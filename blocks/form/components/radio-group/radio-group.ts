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
                icon.className = `.radio-group--with-icon .radio-group--with-icon--${iconName}`
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="45" height="44" viewBox="0 0 45 44" fill="none">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M26.2181 8.55664L27.5978 9.93623L22.6726 14.8613L29.802 21.9907L34.7271 17.0656L39.6522 21.9907L40.9848 20.6582V37.1237H4.01562V8.55664H26.2181Z" fill="#DDDDDD"/>
          <path d="M28.6133 3.82275L40.84 16.0495" stroke="#666666" stroke-width="3.67"/>
          <path d="M28.6133 16.0495L40.84 3.82275" stroke="#666666" stroke-width="3.67"/>
          <path d="M40.9848 20.3196V37.1237H4.01562V8.55664H24.1806" stroke="#666666" stroke-width="3.67"/>
          <path d="M34.2636 30.4023H20.8203" stroke="#666666" stroke-width="3.67"/>
          <path d="M17.458 30.4023H10.7363" stroke="#666666" stroke-width="3.67"/>
          </svg>`

                // Add icon inside label
                label?.prepend(icon)
            })
        }
    }

    return element
}
