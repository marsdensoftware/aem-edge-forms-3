export default function decorate(panel: Element) {
  panel.classList.add('panel-formhero', 'container-xl')

  const divs = panel.querySelectorAll('div')

  divs[0].classList.add(
    'panel-formhero__content',
    'col-12',
    'col-lg-5',
    'offset-lg-2',
  )

  divs[1].classList.add('panel-formhero__picture', 'col-12', 'col-md-4')

  const row = document.createElement('section')
  panel.appendChild(row)
  row.classList.add('row', 'panel-formhero__inner')
  row.append(divs[0], divs[1])

  return panel
}
