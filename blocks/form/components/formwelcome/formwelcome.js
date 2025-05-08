export default function decorate(panel) {
    panel.classList.add('panel-formwelcome');
    const div = panel.querySelector('div');
    div.className = 'panel-formwelcome__header';
    const items = panel.querySelectorAll(':scope>fieldset>fieldset');
    items.forEach((e) => {
        e.classList.add('panel-formwelcome__item');
        const divs = e.querySelectorAll('div');
        divs[0].className = 'panel-formwelcome__item-image';
        divs[1].className = 'panel-formwelcome__item-content';
    });
    return panel;
}
