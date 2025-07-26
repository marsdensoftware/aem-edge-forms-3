import { createOptimizedPicture } from '../../scripts/aem.js'
import { moveInstrumentation } from '../../scripts/scripts.js'
// import odic from '../../scripts/auth/oidc-entry.js'

const signInText = 'Sign in'
const signOutText = 'Sign out'

const decorateSignInButton = async (block) => {

  const link = [...block.querySelectorAll('a.button')].find(a => {
    const t = (a.textContent ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
    return t === 'sign in' || t === 'sign out';
  });

  if (!link) {
    console.warn('sign in button not found')
    return
  }

  let isAuthenticated = true

  const handleSignIn = (e) => {
    e.preventDefault() // oidc.signIn()
    console.log(signInText)
    isAuthenticated = true
  }

  const handleSignOut = (e) => {
    e.preventDefault()
    console.log(signOutText)
    isAuthenticated = false
  }

  const updateLink = (a, text, onClick) => {
    a.textContent = text
    a.title = text
    if (a._prevClickHandler) {
      a.removeEventListener('click', a._prevClickHandler)
    }
    a._prevClickHandler = onClick // save reference for next time
    a.addEventListener('click', onClick)
  }

  updateLink(
    link,
    isAuthenticated ? signOutText : signInText,
    isAuthenticated ? handleSignOut : handleSignIn,
  )

  // const updateLink = (link, signedIn) => {
  //   if (signedIn) {
  //     link.textContent = signInText
  //     link.title = 'Log Out'
  //     link.removeEventListener('click', handleSignIn)
  //     link.addEventListener('click', handleSignOut)
  //   } else {
  //     link.textContent = 'Sign in'
  //     link.title = 'Sign In'
  //     link.removeEventListener('click', handleSignOut)
  //     link.addEventListener('click', handleSignIn)
  //   }
  /* ----------  initialise & set initial state  ---------- */
  // try {
  //   await oidc.init() // wait for OIDC bootstrap
  //   updateLink(await oidc.isAuthenticated())
  // } catch (err) {
  //   // Library failed → fall back to “Sign in” so the user can recover
  //   console.error('OIDC init failed', err)
  //   updateLink(false)
  // }

  /* ----------  stay in sync with future auth events  ---------- */
  // if (oidc.events?.addEventListener) {
  //   oidc.events.addEventListener('signin', () => updateLink(true))
  //   oidc.events.addEventListener('signout', () => updateLink(false))
  // }
}

export default async function decorate(block) {
  console.log('account decorate()')
  await decorateSignInButton(block)
}
