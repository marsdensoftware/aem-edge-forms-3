export default function decorate(panel) {
    panel.classList.add('panel-formwelcome');
    const div = panel.querySelector('div');
    div.classList.add('panel-formwelcome__header');
    const items = panel.querySelectorAll(':scope>fieldset>fieldset');
    items.forEach((e) => {
        e.classList.add('panel-formwelcome__item');
        const divs = e.querySelectorAll('div');
        divs[0].classList.add('panel-formwelcome__item-content');
        divs[1].classList.add('panel-formwelcome__item-image');
    });
    return panel;
}
