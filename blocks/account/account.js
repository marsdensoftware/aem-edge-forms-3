import { createOptimizedPicture } from '../../scripts/aem.js'
import { moveInstrumentation } from '../../scripts/scripts.js'
// import odic from '../../scripts/auth/oidc-entry.js'

const signInText = 'Sign in'
const signOutText = 'Sign out'

const decorateSignInButton = async (block) => {
  const links = [...block.querySelectorAll('a.button.secondary')].filter((a) =>
    /^(sign in|sign out)$/i.test(a.textContent.trim()),
  )

  if (!links) {
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

  const updateLink = (link, text, onClick) => {
    link.textContent = text
    link.title = text
    if (link._prevClickHandler) {
      link.removeEventListener('click', link._prevClickHandler)
    }
    link._prevClickHandler = onClick // save reference for next time
    link.addEventListener('click', onClick)
  }

  updateLink(
    links[0],
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
