export default function decorate(panel) {
    panel.classList.add('panel-formhero');
    panel.classList.add('wizard--bg-dark');
    const divs = panel.querySelectorAll(':scope>fieldset,:scope>div');
    divs[0].classList.add('panel-formhero__content');
    divs[1].classList.add('panel-formhero__picture');
    return panel;
}
