const dropdownMenu = [
    {
        title: 'Kia Ora, Matariki!',
    },
    {
        title: 'Manage Jobseeker Profile',
    },
    {
        title: 'Job Applications',
    },
    {
        title: 'Saved',
    },
    {
        title: 'Your CV',
    },
];
let isAccountMenuOpen = false;
const handleAccountMenu = (triggerEl) => {
    const el = triggerEl.target;
    if (!el) {
        throw new Error('Can not find trigger element');
    }
    const accountMenu = el.nextElementSibling;
    if (!accountMenu) {
        throw new Error('Can not find account menu element');
    }
    isAccountMenuOpen = !isAccountMenuOpen;
    if (isAccountMenuOpen) {
        accountMenu.classList.add('main-menu__account-menu--is-visible');
        return;
    }
    accountMenu.classList.remove('main-menu__account-menu--is-visible');
};
function decorate(block) {
    const [mainMenuInner] = block.children;
    mainMenuInner.classList.add('main-menu__inner');
    // Main left action
    const mainAction = document.createElement('nav');
    mainAction.classList.add('main-menu__main-action');
    // LOGO
    const logo = document.createElement('a');
    logo.classList.add('main-menu__logo');
    const logoText = document.createElement('span');
    logoText.innerHTML = 'Ministry of Social and Development';
    logo.appendChild(logoText);
    mainAction.append(logo);
    const userButton = document.createElement('button');
    userButton.classList.add('main-menu__user-button');
    // Account menu
    const accountMenu = document.createElement('ul');
    accountMenu.classList.add('main-menu__account-menu');
    dropdownMenu.forEach((menu) => {
        const list = document.createElement('li');
        list.classList.add('main-menu__account-menu-item');
        list.innerHTML = menu.title;
        accountMenu.append(list);
    });
    userButton.addEventListener('click', handleAccountMenu);
    mainMenuInner.append(mainAction, userButton, accountMenu);
}
export default decorate;
