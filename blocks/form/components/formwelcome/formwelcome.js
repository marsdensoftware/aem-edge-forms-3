export default function decorate(panel) {
    panel.classList.add('panel-formwelcome');
    const container = document.createElement('div');
    container.className = 'panel-formwelcome__content-container';
    const directFieldsetChild = panel.querySelector(':scope > fieldset');
    directFieldsetChild === null || directFieldsetChild === void 0 ? void 0 : directFieldsetChild.classList.add('panel-formwelcome__container');
    directFieldsetChild === null || directFieldsetChild === void 0 ? void 0 : directFieldsetChild.append(container);
    const div = panel.querySelector('div');
    div.classList.add('panel-formwelcome__header');
    const fieldsets = panel.querySelectorAll(':scope>fieldset>fieldset');
    fieldsets.forEach((el) => {
        el.classList.add('panel-formwelcome__item');
        container.append(el);
        const divs = el.querySelectorAll('div');
        divs[0].classList.add('panel-formwelcome__item-content');
        divs[1].classList.add('panel-formwelcome__item-image');
    });
    return panel;
}
