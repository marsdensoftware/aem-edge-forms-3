export function handleTabNavigation(panel: HTMLElement, index: number): void {
  const tabs = panel.querySelectorAll<HTMLFieldSetElement>(':scope > fieldset')
  const navItems = panel.querySelectorAll<HTMLLIElement>(':scope > .navitems > li')

  tabs.forEach((otherTab, i) => {
    if (i === index) {
      otherTab.classList.add('formtab-current')
      navItems[i]?.classList.add('navitem-current')
    } else {
      otherTab.classList.remove('formtab-current')
      navItems[i]?.classList.remove('navitem-current')
    }
  })
}

export default function decorate(panel: HTMLElement): HTMLElement {
  panel.classList.add('formtabs')
  const tabs = panel.querySelectorAll<HTMLFieldSetElement>(':scope > fieldset')
  const navItems = document.createElement('ul')
  navItems.classList.add('navitems', 'p-large')
  panel.prepend(navItems)

  tabs.forEach((tab, index) => {
    tab.dataset.index = index.toString()
    tab.classList.add('formtab')
    const legend = tab.querySelector('legend')

    const navItem = document.createElement('li')
    navItem.textContent = legend?.textContent ?? `Tab ${index + 1}`

    navItem.addEventListener('click', () => {
      handleTabNavigation(panel, index)
    })

    navItems.append(navItem)
  })

  handleTabNavigation(panel, 0) // first tab visible
  return panel
}
