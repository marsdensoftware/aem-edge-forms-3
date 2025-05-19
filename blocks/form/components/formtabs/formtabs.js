export function handleTabNavigation(panel, tab, index) {
    const tabs = panel.querySelectorAll(':scope > fieldset');
    const lis = panel.querySelectorAll(':scope > .navitems > li');

    tabs.forEach((otherTab, i) => {
        // new selection
        if (otherTab.dataset.index == index) {
            otherTab.classList.add('tab-current');
            lis[index].classList.add('navitem-current');
        }
        else {
            otherTab.classList.remove('tab-current');
            lis[i].classList.remove('navitem-current');
        }
    });
}

export default function decorate(panel) {
    panel.classList.add('formtabs');
    const tabs = panel?.querySelectorAll(':scope > fieldset');
    const tabHeader = document.createElement('ul');
    tabHeader.classList.add('navitems');
    panel.prepend(tabHeader);

    tabs?.forEach((tab, index) => {
        tab.dataset.index = index;
        tab.classList.add('formtab');
        const legend = tab.querySelector(':scope > legend');
        const li = document.createElement('li');
        li.textContent = legend.textContent;

        if (index == 0) handleTabNavigation(panel, tab, 0); // first tab visible
        li.addEventListener('click', () => {
            handleTabNavigation(panel, tab, index);
        });
    });
    return panel;
}
