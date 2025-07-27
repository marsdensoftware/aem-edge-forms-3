import { error } from './log.js'

const isEditor = (block) => {
  const is =
    block.hasAttribute('data-aue-resource') ||
    block.hasAttribute('data-aue-label')
  return is
}

const queryFirst = (container, selector, matchFn) => {
  const elements = container.querySelectorAll(selector)
  for (let i = 0; i < elements.length; i += 1) {
    if (matchFn(elements[i])) return elements[i]
  }
  return null
}

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
  if (block.hasAttribute(marker)) {
    return () => {}
  }

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
        error('onTeardown error', e)
      }
    } else {
      extraTeardowns.add(fn)
    }
  }

  const runTeardowns = (source) => {
    extraTeardowns.forEach((fn) => {
      try {
        fn({ source })
      } catch (e) {
        error('teardown error', e)
      }
    })
    extraTeardowns.clear()
  }

  const teardown = ({ source } = { source: 'manual' }) => {
    if (done) return
    done = true
    try {
      runTeardowns(source)
    } finally {
      try {
        ac.abort()
      } catch {
        /* empty */
      }
      try {
        block.removeAttribute(marker)
      } catch {
        /* empty */
      }
      if (mo) {
        try {
          mo.disconnect()
        } catch {
          /* empty */
        }
        mo = null
      }
    }
  }

  // Auto-teardown on real navigation (covers BFCache eviction)
  if (teardownOnPageHide) {
    window.addEventListener(
      'pagehide',
      () => {
        teardown({ source: 'pagehide' })
      },
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

      const removed = mutations.some((m) => {
        if (m.type !== 'childList' || !m.removedNodes.length) return false
        for (let i = 0; i < m.removedNodes.length; i += 1) {
          const n = m.removedNodes[i]
          if (n === block || (n.contains && n.contains(block))) {
            return true
          }
        }
        return false
      })

      if (removed) {
        teardown({ source: 'mutation' })
      }
    })
    mo.observe(document.body, { childList: true, subtree: true })
  }

  // Run initializer (supports sync/async; may return a teardown)
  const runInit = async () => {
    try {
      const ret = await init({
        signal,
        isEditor: isEditor(block),
        onTeardown,
      })
      if (typeof ret === 'function') onTeardown(ret)
    } catch (err) {
      error('block init failed:', err)
      teardown({ source: 'init-error' }) // pass a source to avoid destructuring error
    }
  }

  runInit()
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
  const t = performance?.navigation?.type
  return typeof t === 'number' && t === 2
}

/* eslint-disable object-curly-newline */
export { withBlockLifecycle, isHistoryTraversal, isEditor, queryFirst }
/* eslint-enable object-curly-newline */
