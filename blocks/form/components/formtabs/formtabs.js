export function handleTabNavigation(panel, index) {
    const tabs = panel.querySelectorAll(':scope > fieldset');
    const navItems = panel.querySelectorAll(':scope > .navitems > li');
    tabs.forEach((otherTab, i) => {
        var _a, _b;
        if (i === index) {
            otherTab.classList.add('formtab-current');
            (_a = navItems[i]) === null || _a === void 0 ? void 0 : _a.classList.add('navitem-current');
        }
        else {
            otherTab.classList.remove('formtab-current');
            (_b = navItems[i]) === null || _b === void 0 ? void 0 : _b.classList.remove('navitem-current');
        }
    });
}
export default function decorate(panel) {
    panel.classList.add('formtabs');
    const tabs = panel.querySelectorAll(':scope > fieldset');
    const navItems = document.createElement('ul');
    navItems.classList.add('navitems', 'p-large');
    panel.prepend(navItems);
    tabs.forEach((tab, index) => {
        var _a;
        tab.dataset.index = index.toString();
        tab.classList.add('formtab');
        const legend = tab.querySelector('legend');
        const navItem = document.createElement('li');
        navItem.textContent = (_a = legend === null || legend === void 0 ? void 0 : legend.textContent) !== null && _a !== void 0 ? _a : `Tab ${index + 1}`;
        navItem.addEventListener('click', () => {
            handleTabNavigation(panel, index);
        });
        navItems.append(navItem);
    });
    handleTabNavigation(panel, 0); // first tab visible
    return panel;
}
