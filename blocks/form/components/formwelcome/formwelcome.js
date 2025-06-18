export default function decorate(panel) {
    panel.classList.add('panel-formwelcome', 'container-xl');
    const children = panel.querySelectorAll(':scope > fieldset');
    const row = document.createElement('div');
    row.className = 'row panel-formwelcome__inner';
    // container for text
    children[0].classList.add('panel-formwelcome__header', 'col-12', 'col-md-5', 'col-lg-4', 'offset-lg-2');
    // container for items
    children[1].classList.add('panel-formwelcome__content-container', 'col-12', 'col-lg-5');
    const items = children[1].querySelectorAll(':scope > fieldset');
    items.forEach((el) => {
        el.classList.add('panel-formwelcome__item', 'row');
        const divs = el.querySelectorAll('div');
        divs[0].classList.add('panel-formwelcome__item-content', 'col-9', 'col-md-8', 'col-lg-8', 'col-xl-8');
        divs[1].classList.add('panel-formwelcome__item-image', 'col-3', 'col-md-2', 'col-lg-4', 'col-xl-4');
    });
    row.append(children[0], children[1]);
    panel.appendChild(row);
    return panel;
}
