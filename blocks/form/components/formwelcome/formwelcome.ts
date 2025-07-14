export default function decorate(panel: Element) {
  panel.classList.add('panel-formwelcome')
  panel.classList.add('wizard--bg-mid')

  const children = panel.querySelectorAll(':scope > fieldset')

  // container for text
  children[0].classList.add('panel-formwelcome__header')

  // container for items
  const container = children[1]
  children[1].classList.add('panel-formwelcome__content-container')

  const items = container.querySelectorAll(':scope > fieldset')

  items.forEach((el) => {
    el.classList.add('panel-formwelcome__item')

    const divs = el.querySelectorAll('div')
    divs[0].classList.add('panel-formwelcome__item-content')
    divs[1].classList.add('panel-formwelcome__item-image')
  })

  return panel
}
