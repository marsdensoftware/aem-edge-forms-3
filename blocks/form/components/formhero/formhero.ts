interface Field {
  properties: {
    wizardtheme: string
  }
}

export default function decorate(panel: Element, field: Field) {
  panel.classList.add('panel-formhero')

  // if the field properties contain a wizardtheme add it to the class list
  if (field.properties.wizardtheme) {
    panel.classList.add(field.properties.wizardtheme)
  }

  const divs = panel.querySelectorAll(':scope>fieldset,:scope>div')

  divs[0].classList.add('panel-formhero__content')
  divs[1].classList.add('panel-formhero__picture')

  return panel
}
