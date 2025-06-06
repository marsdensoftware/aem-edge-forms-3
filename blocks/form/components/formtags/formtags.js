export default function decorate(panel) {
    panel.classList.add('tags');
    const childInput = panel.querySelectorAll('input');
    const childDivs = panel.querySelectorAll('div');
    childInput[0].remove();
    childInput[1].remove();
    const text = document.createElement('span');
    text.className = 'tags-item__title';
    text.innerHTML = 'Porirua, Wellington';
    const closeButton = document.createElement('span');
    closeButton.className = 'tags-item__close';
    closeButton.innerHTML = 'x';
    const text2 = document.createElement('span');
    text2.className = 'tags-item__title';
    text2.innerHTML = 'Newmarket, Auckland';
    const closeButton2 = document.createElement('span');
    closeButton2.className = 'tags-item__close';
    closeButton2.innerHTML = 'x';
    childDivs.forEach((div) => {
        div.classList.add('tags__item');
        div.classList.remove('text-wrapper');
    });
    childDivs[0].append(text, closeButton);
    childDivs[1].append(text2, closeButton2);
}
