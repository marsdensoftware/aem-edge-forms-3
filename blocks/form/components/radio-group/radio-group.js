export default function decorate(element, field) {
    const { withIcon, enumIconNames } = field.properties;
    if (withIcon) {
        element.classList.add('radio-group--with-icon');
        element.classList.remove('horizontal', 'vertical');
        const divs = element.querySelectorAll('div');
        if (divs.length) {
            enumIconNames.forEach((iconName, index) => {
                const div = divs[index];
                // LABEL
                const label = div.querySelector('label');
                label === null || label === void 0 ? void 0 : label.classList.add('radio-group--with-icon__label');
                // ICON
                const icon = document.createElement('span');
                icon.className = `radio-group--with-icon__icon radio-group--with-icon--${iconName}`;
                // Add icon inside label
                label === null || label === void 0 ? void 0 : label.prepend(icon);
            });
        }
    }
    return element;
}
