/*eslint-disable*/
export default function decorate(panel, field) {
    var _a, _b;
    panel.classList.add('panel-formhero');
    // if the field properties contain a wizardtheme add it to the class list
    if (field.properties.wizardtheme) {
        panel.classList.add(field.properties.wizardtheme);
    }
    const divs = panel.querySelectorAll(':scope>fieldset,:scope>div');
    (_a = divs[0]) === null || _a === void 0 ? void 0 : _a.classList.add('panel-formhero__content');
    (_b = divs[1]) === null || _b === void 0 ? void 0 : _b.classList.add('panel-formhero__picture');
    return panel;
}
