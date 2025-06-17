export default function decorate(panel) {
    panel.classList.add('panel-formhero', 'container-xl');
    const childEls = panel.querySelectorAll(':scope > .field-wrapper');
    childEls[0].classList.add('panel-formhero__content', 'col-12', 'col-lg-5', 'offset-lg-2');
    childEls[1].classList.add('panel-formhero__picture', 'col-12', 'col-md-4');
    const row = document.createElement('section');
    row.classList.add('row', 'panel-formhero__inner');
    row.append(childEls[0], childEls[1]);
    panel.appendChild(row);
    return panel;
}
