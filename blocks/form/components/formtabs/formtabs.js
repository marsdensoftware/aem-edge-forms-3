export function handleTabNavigation(panel, tab, index) {
    const tabs = panel.querySelectorAll(':scope > fieldset');
    const navItems = panel.querySelectorAll(':scope > .navitems > li');

    tabs.forEach((otherTab, i) => {
        // new selection
        if (otherTab.dataset.index == index) {
            otherTab.classList.add('tab-current');
            navItems[i].classList.add('navitem-current');
        }
        else {
            otherTab.classList.remove('tab-current');
            navItems[i].classList.remove('navitem-current');
        }
    });
}

export default function decorate(panel) {
    panel.classList.add('formtabs');
    const tabs = panel?.querySelectorAll(':scope > fieldset');
    const navItems = document.createElement('ul');
    navItems.classList.add('navitems');
    panel.prepend(navItems);

    tabs?.forEach((tab, index) => {
        tab.dataset.index = index;
        tab.classList.add('formtab');
        const legend = tab.querySelector(':scope > legend');
        const navItem = document.createElement('li');
        navItem.textContent = legend.textContent;

        if (index == 0) handleTabNavigation(panel, tab, 0); // first tab visible
        navItem.addEventListener('click', () => {
            handleTabNavigation(panel, tab, index);
        });

        navItems.append(navItem);
    });
    return panel;
}
