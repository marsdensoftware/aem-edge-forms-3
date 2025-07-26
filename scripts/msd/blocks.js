/**
 * Attach lifecycle to an AEM EDS block.
 * @param {Element} block
 * @param {(ctx: {
 *   signal: AbortSignal,
 *   isEditor: boolean,
 *   onTeardown: (fn: (ctx?: {source?: string}) => void) => void
 * }) => (void | (() => void) | Promise<void | (() => void)>)} init
 * @param {{ marker?: string, observeRemoval?: boolean, teardownOnPageHide?: boolean }} [opts]
 * @returns {(arg?: {source?: string}) => void} teardown
 */
const withBlockLifecycle = (block, init, opts = {}) => {
  const {
    marker = 'data-lifecycle-init',
    observeRemoval = true,
    teardownOnPageHide = true,
  } = opts

  // Prevent double initialization on the same element
  if (block.hasAttribute(marker)) return () => {}

  block.setAttribute(marker, 'true')

  const ac = new AbortController()
  const { signal } = ac

  let done = false
  let mo = null

  const extraTeardowns = new Set()
  const onTeardown = (fn) => {
    if (typeof fn !== 'function') return
    if (done) {
      // If teardown already happened, run immediately
      try {
        fn({ source: 'late-register' })
      } catch (e) {
        console.error(e)
      }
    } else {
      extraTeardowns.add(fn)
    }
  }

  function runTeardowns(source) {
    for (const fn of extraTeardowns) {
      try {
        fn({ source })
      } catch (e) {
        console.error('teardown error', e)
      }
    }
    extraTeardowns.clear()
  }

  function teardown({ source } = { source: 'manual' }) {
    if (done) return
    done = true
    try {
      runTeardowns(source)
    } finally {
      try {
        ac.abort()
      } catch {}
      try {
        block.removeAttribute(marker)
      } catch {}
      try {
        mo && mo.disconnect()
      } catch {}
      mo = null
    }
  }

  // Auto-teardown on real navigation (covers BFCache eviction)
  if (teardownOnPageHide) {
    window.addEventListener(
      'pagehide',
      () => teardown({ source: 'pagehide' }),
      {
        once: true,
        signal,
      },
    )
  }

  // Tear down if the block is detached (editor re-decoration, dynamic content)
  if (observeRemoval) {
    mo = new MutationObserver((mutations) => {
      if (done) return
      // Fast path: if not connected, we’re done.
      if (!block.isConnected) {
        teardown({ source: 'mutation' })
        return
      }
      // Otherwise, scan removals quickly to avoid extra work
      for (const m of mutations) {
        if (m.type !== 'childList' || !m.removedNodes.length) continue
        for (const n of m.removedNodes) {
          if (n === block || (n.contains && n.contains(block))) {
            teardown({ source: 'mutation' })
            return
          }
        }
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })
  }

  // Run initializer (supports sync/async; may return a teardown)
  ;(async () => {
    try {
      const ret = await init({
        signal,
        isEditor: block.hasAttribute('data-aue-resource'),
        onTeardown,
      })
      if (typeof ret === 'function') onTeardown(ret)
    } catch (err) {
      console.error('block init failed:', err)
      teardown({ source: 'init-error' }) // pass a source to avoid destructuring error
    }
  })()

  return teardown
}

// True if the page is shown due to a history traversal (back/forward),
// including BFCache restores.
const isHistoryTraversal = (e) => {
  // BFCache restore (pageshow)
  if (e && typeof e.persisted === 'boolean' && e.persisted) return true

  // Navigation Timing Level 2
  const [nav] = performance.getEntriesByType?.('navigation') ?? []
  if (nav?.type) return nav.type === 'back_forward'

  // Legacy (deprecated) – older Safari
  // 2 === TYPE_BACK_FORWARD
  const t = performance.navigation?.type
  return typeof t === 'number' && t === 2
}

export { withBlockLifecycle, isHistoryTraversal }
