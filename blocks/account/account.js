import {
  authStatus,
  onAuthChange,
  authLoginUrl,
  authLogout,
} from '../../scripts/msd/auth.js'

import {
  withBlockLifecycle,
  isHistoryTraversal,
} from '../../scripts/msd/blocks.js'

const DASH_OR_SPACE = /[\s\p{Pd}]+/gu
const SIGN_IN_BTN_TARGETS = new Set(['signin', 'signout'])

const signInOutButton = (block) => {
  const find = (block) => {
    for (const a of block.querySelectorAll('a.button')) {
      if (!a.textContent) continue
      const t = a.textContent.toLowerCase().replace(DASH_OR_SPACE, '')
      if (SIGN_IN_BTN_TARGETS.has(t)) return a
    }
    return null
  }

  const a = find(block)
  if (!a) return null

  const updateText = () => {
    const isAuthenticated = authStatus().isAuthenticated
    a.textContent = isAuthenticated ? 'sign-out' : 'sign-in'
    a.title = a.textContent
  }

  const setBusy = (busy = true) => {
    a.classList.toggle('is-busy', busy)
    if (busy) {
      a.setAttribute('aria-disabled', 'true')
      a.setAttribute('aria-busy', 'true')
    } else {
      a.removeAttribute('aria-disabled')
      a.removeAttribute('aria-busy')
    }
  }

  return {
    update: updateText,
    setBusy: () => setBusy(true),
    clearBusy: () => setBusy(false),
    isBusy: () => a.getAttribute('aria-disabled') === 'true',
    reset: () => {
      updateText()
      setBusy(false)
    },
    addEventListener: a.addEventListener.bind(a),
  }
}

export default async function decorate(block) {
  withBlockLifecycle(
    block,
    ({ signal, isEditor }) => {
      const btn = signInOutButton(block)
      if (!btn) {
        console.warn(
          'could not find sign-in button. In UE name it sign-in and set the link to #',
        )
        return
      }

      btn.reset()
      // stop here, this is in the Universal Editor (don’t bind listeners)
      if (isEditor) return

      const onSignInOutClick = async (e) => {
        e.preventDefault()
        // debouce
        if (btn.isBusy()) return
        btn.setBusy()

        try {
          const s = authStatus()
          // if we signed someone has likely clicked sign-out
          if (s.isAuthenticated) {
            await authLogout()
            return
          }
          const url = await authLoginUrl()
          await new Promise((r) => requestAnimationFrame(r))
          window.location.assign(url)
        } catch (err) {
          console.error(err)
          btn.reset()
        }
      }

      // Reset on BFCache restore (back/forward)
      const onPageShow = (e) => {
        if (isHistoryTraversal(e)) btn.reset()
      }

      window.addEventListener('pageshow', onPageShow, { signal })
      onAuthChange(() => btn.reset(), { signal })
      btn.addEventListener('click', onSignInOutClick, { signal })
    },
    // if you want to reset btn on nav back/forward set this to default
    { teardownOnPageHide: false },
  )
}
