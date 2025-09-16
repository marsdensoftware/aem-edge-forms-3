export function handleTabNavigation(panel, index) {
  const tabs = panel.querySelectorAll(':scope > fieldset');
  const navItems = panel.querySelectorAll(':scope > .navitems > li');

  tabs.forEach((otherTab, i) => {
    // new selection
    if (i === index) {
      otherTab.classList.add('formtab-current');
      navItems[i].classList.add('navitem-current');
    } else {
      otherTab.classList.remove('formtab-current');
      navItems[i].classList.remove('navitem-current');
    }
  });
}

export default function decorate(panel) {
  panel.classList.add('formtabs');
  const tabs = panel?.querySelectorAll(':scope > fieldset');
  const navItems = document.createElement('ul');
  navItems.classList.add('navitems', 'p-large');
  panel.prepend(navItems);

  tabs?.forEach((tab, index) => {
    tab.dataset.index = index;
    tab.classList.add('formtab');
    const legend = tab.querySelector(':scope > legend');
    const navItem = document.createElement('li');
    navItem.textContent = legend.textContent;

    navItem.addEventListener('click', () => {
      handleTabNavigation(panel, index);
    });

    navItems.append(navItem);
  });

  handleTabNavigation(panel, 0); // first tab visible
  return panel;
}
