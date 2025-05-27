export default function decorate(panel: Element) {
  panel.classList.add('panel-formhero')

  const divs = panel.querySelectorAll('div')

  divs[0].classList.add('panel-formhero__content')
  divs[1].classList.add('panel-formhero__picture')

  return panel
}
