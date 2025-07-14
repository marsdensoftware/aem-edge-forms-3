interface Field {
  properties: {
    wizardtheme: string
  }
}

export default function decorate(panel: Element, field: Field) {
  panel.classList.add('panel-formwelcome')

  // if the field properties contain a wizardtheme add it to the class list
  if (field.properties.wizardtheme) {
    panel.classList.add(field.properties.wizardtheme)
  }

  const children = panel.querySelectorAll(':scope > fieldset')

  // container for text
  children[0]?.classList.add('panel-formwelcome__header')

  // container for items
  const container = children[1]
  children[1]?.classList.add('panel-formwelcome__content-container')

  const items = container?.querySelectorAll(':scope > fieldset')

  items.forEach((el) => {
    el.classList.add('panel-formwelcome__item')

    const divs = el.querySelectorAll('div')
    divs[0]?.classList.add('panel-formwelcome__item-content')
    divs[1]?.classList.add('panel-formwelcome__item-image')
  })

  return panel
}
