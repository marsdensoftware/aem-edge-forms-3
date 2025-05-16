export default function decorate(element, field, container) {
    const { withIcon, enumIconNames } = field.properties;

    if (withIcon) {
        element.classList.add('radio-group-wrapper--with-icon');
        const radios = element.querySelectorAll('input[type="radio"]');

        if (radios) {
            enumIconNames?.forEach((iconName, index) => {
                const radio = radios[index];

                if (radio && withIcon && iconName) {
                    radio.classList.add(`icon-${iconName}`);
                }
            });
        }

    }

    return element;
}
