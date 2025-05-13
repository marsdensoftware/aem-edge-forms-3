export default function decorate(panel) {
    panel.classList.add('panel-heroform');
    const divs = panel.querySelectorAll('div');
    divs[0].classList.add('panel-heroform__picture');
    divs[1].classList.add('panel-heroform__content');
    return panel;
}
