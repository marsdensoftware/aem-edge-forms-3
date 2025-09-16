import { getMetadata } from '../../scripts/aem.js'
import { loadFragment } from '../fragment/fragment.js'

async function decorate(block: Element) {
  // load nav as fragment
  const navMeta = getMetadata('nav')
  const navPath = navMeta
    ? new URL(navMeta, window.location.href).pathname
    : '/nav'
  // eslint-disable-next-line no-unused-vars
  await loadFragment(navPath)

  block.textContent = ''
  const nav = document.createElement('nav')
  nav.id = 'nav'
  nav.className = 'nav'
}

export default decorate
