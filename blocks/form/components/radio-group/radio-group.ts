interface Field {
  properties: {
    withIcon: boolean
    enumIconNames: string[]
  }
}

export default function decorate(element: Element, field: Field) {
  const { withIcon, enumIconNames } = field.properties

  if (withIcon) {
    element.classList.add('radio-group--with-icon')
    element.classList.remove('horizontal', 'vertical')
    
    const divs = element.querySelectorAll('div')

    if (divs.length) {
      enumIconNames.forEach((iconName, index) => {
        const div = divs[index]
        // LABEL
        const label = div.querySelector('label')
        label?.classList.add('radio-group--with-icon__label')

        // ICON
        const icon = document.createElement('span')
        icon.className = `radio-group--with-icon__icon radio-group--with-icon--${iconName}`

        // Add icon inside label
        label?.prepend(icon)
      })
    }
  }

  return element
}
