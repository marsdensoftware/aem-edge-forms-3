export default function decorate(element, field) {
    const { withIcon, enumIconNames } = field.properties;
    if (withIcon) {
        element.classList.remove('horizontal', 'vertical');
        element.classList.add('radio-group--with-icon');
        const divs = element.querySelectorAll('div');
        if (divs.length) {
            enumIconNames.forEach((iconName, index) => {
                var _a;
                const div = divs[index];
                // LABEL
                const label = div.querySelector('label');
                if (!label) {
                    return;
                }
                const text = (_a = label.textContent) === null || _a === void 0 ? void 0 : _a.trim();
                label.textContent = ''; // clear existing text
                label.classList.add('radio-group--with-icon__label');
                // ICON
                const icon = document.createElement('i');
                icon.className = `radio-group--with-icon__icon radio-group--with-icon--${iconName}`;
                // Add icon inside label
                label.append(icon);
                const span = document.createElement('span');
                span.textContent = text || '';
                label.appendChild(span);
            });
        }
    }
    return element;
}
