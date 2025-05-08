export default function decorate(panel: Element) {
  panel.classList.add('panel-heroform')

  const divs = panel.querySelectorAll('div')

  divs[0].className = 'panel-heroform__picture'
  divs[1].className = 'panel-heroform__content'

  return panel
}
