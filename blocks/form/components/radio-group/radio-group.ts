interface Field {
    properties: {
        withIcon: boolean
        enumIconNames: string[]
    }
}

export default function decorate(element: Element, field: Field) {
    const { withIcon, enumIconNames } = field.properties

    if (withIcon) {
        element.classList.remove('horizontal', 'vertical')
        element.classList.add('radio-group--with-icon')

        const divs = element.querySelectorAll('div')

        if (divs.length) {
            enumIconNames.forEach((iconName, index) => {
                const div = divs[index]
                // LABEL
                const label = div.querySelector('label')
                if (!label) {
                    return;
                }

                const text = label.textContent?.trim();
                label.textContent = ''; // clear existing text
                label.classList.add('radio-group--with-icon__label')

                // ICON
                const icon = document.createElement('i')
                icon.className = `radio-group--with-icon__icon radio-group--with-icon--${iconName}`

                // Add icon inside label
                label.append(icon)

                const span = document.createElement('span');
                span.textContent = text || '';
                label.appendChild(span);
            })
        }
    }

    return element
}
