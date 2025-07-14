export default function decorate(panel, field) {
    var _a, _b;
    panel.classList.add('panel-formwelcome');
    // if the field properties contain a wizardtheme add it to the class list
    if (field.properties.wizardtheme) {
        panel.classList.add(field.properties.wizardtheme);
    }
    const children = panel.querySelectorAll(':scope > fieldset');
    // container for text
    (_a = children[0]) === null || _a === void 0 ? void 0 : _a.classList.add('panel-formwelcome__header');
    // container for items
    const container = children[1];
    (_b = children[1]) === null || _b === void 0 ? void 0 : _b.classList.add('panel-formwelcome__content-container');
    const items = container === null || container === void 0 ? void 0 : container.querySelectorAll(':scope > fieldset');
    items.forEach((el) => {
        var _a, _b;
        el.classList.add('panel-formwelcome__item');
        const divs = el.querySelectorAll('div');
        (_a = divs[0]) === null || _a === void 0 ? void 0 : _a.classList.add('panel-formwelcome__item-content');
        (_b = divs[1]) === null || _b === void 0 ? void 0 : _b.classList.add('panel-formwelcome__item-image');
    });
    return panel;
}
