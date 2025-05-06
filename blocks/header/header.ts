import { getMetadata } from '../../scripts/aem.js'
import { loadFragment } from '../fragment/fragment.js'

async function decorate(block: Element) {
  // load nav as fragment
  const navMeta = getMetadata('nav')
  const navPath = navMeta
    ? new URL(navMeta, window.location.href).pathname
    : '/nav'
  const fragment = await loadFragment(navPath)

  block.textContent = ''
  const nav = document.createElement('nav')
  nav.id = 'nav'
  nav.className = 'nav'

  // Fragment.firstElementChild is <main> element
  // while (fragment?.firstElementChild) {
  //   nav.append(fragment.firstElementChild)
  // }

  // const paras = nav.querySelectorAll('div.section .default-content-wrapper p')

  // // Top nav
  // paras.forEach((item, idx) => {
  //   item.outerHTML = `<div class="${idx === 0 ? 'nav__logo' : 'nav__action'}">${
  //     item.innerHTML
  //   }</div>`
  // })

  // block.append(nav)
}

export default decorate
