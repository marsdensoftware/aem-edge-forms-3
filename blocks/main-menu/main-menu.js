const dropdownMenu = [
    {
        title: 'Kia Ora, Matariki!',
        url: '/',
    },
    {
        title: 'Manage Jobseeker Profile',
        url: '/',
        icon: `<path fill-rule="evenodd" clip-rule="evenodd" d="M5.12324 1.6228C3.16695 1.6228 1.58105 3.2087 1.58105 5.16499C1.58105 7.12128 3.16695 8.70718 5.12324 8.70718C6.63953 8.70718 7.93329 7.75446 8.43857 6.41498H22.0855V3.91498H8.43856C7.93328 2.57551 6.63952 1.6228 5.12324 1.6228ZM4.08105 5.16499C4.08105 4.58941 4.54766 4.1228 5.12324 4.1228C5.69882 4.1228 6.16543 4.58941 6.16543 5.16499C6.16543 5.74057 5.69882 6.20718 5.12324 6.20718C4.54766 6.20718 4.08105 5.74057 4.08105 5.16499Z" fill="#017AC9"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.9998 8.95782C11.5347 8.95782 11.074 9.04945 10.6443 9.22746C10.2145 9.40547 9.82405 9.66639 9.49512 9.99531C9.1662 10.3242 8.90529 10.7147 8.72727 11.1445C8.71279 11.1795 8.69887 11.2146 8.68553 11.25H1.91418V13.75H8.68552C8.69887 13.7854 8.71278 13.8206 8.72727 13.8555C8.90529 14.2853 9.1662 14.6758 9.49512 15.0047C9.82405 15.3336 10.2145 15.5946 10.6443 15.7726C11.074 15.9506 11.5347 16.0422 11.9998 16.0422C12.465 16.0422 12.9256 15.9506 13.3554 15.7726C13.7851 15.5946 14.1756 15.3336 14.5045 15.0047C14.8335 14.6758 15.0944 14.2853 15.2724 13.8555C15.2869 13.8206 15.3008 13.7854 15.3141 13.75H22.0854V11.25H15.3141C15.3008 11.2146 15.2869 11.1795 15.2724 11.1445C15.0944 10.7147 14.8335 10.3242 14.5045 9.99531C14.1756 9.66639 13.7851 9.40547 13.3554 9.22746C12.9256 9.04945 12.465 8.95782 11.9998 8.95782ZM11.601 11.5372C11.7274 11.4848 11.863 11.4578 11.9998 11.4578C12.1367 11.4578 12.2722 11.4848 12.3987 11.5372C12.5251 11.5895 12.64 11.6663 12.7368 11.7631C12.8335 11.8599 12.9103 11.9747 12.9627 12.1012C13.0151 12.2276 13.042 12.3632 13.042 12.5C13.042 12.6369 13.0151 12.7724 12.9627 12.8988C12.9103 13.0253 12.8335 13.1402 12.7368 13.2369C12.64 13.3337 12.5251 13.4105 12.3987 13.4629C12.2722 13.5152 12.1367 13.5422 11.9998 13.5422C11.863 13.5422 11.7274 13.5152 11.601 13.4629C11.4746 13.4105 11.3597 13.3337 11.2629 13.2369C11.1661 13.1402 11.0893 13.0253 11.037 12.8988C10.9846 12.7724 10.9576 12.6369 10.9576 12.5C10.9576 12.3632 10.9846 12.2276 11.037 12.1012C11.0893 11.9747 11.1661 11.8598 11.2629 11.7631C11.3597 11.6663 11.4746 11.5895 11.601 11.5372Z" fill="#017AC9"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15.5611 21.085H1.91418V18.585H15.561C16.0663 17.2455 17.3601 16.2928 18.8764 16.2928C20.8326 16.2928 22.4185 17.8787 22.4185 19.835C22.4185 21.7913 20.8326 23.3772 18.8764 23.3772C17.3601 23.3772 16.0664 22.4245 15.5611 21.085ZM17.8342 19.835C17.8342 19.2594 18.3008 18.7928 18.8764 18.7928C19.4519 18.7928 19.9185 19.2594 19.9185 19.835C19.9185 20.4105 19.4519 20.8772 18.8764 20.8772C18.3008 20.8772 17.8342 20.4105 17.8342 19.835Z" fill="#017AC9"/>
`,
    },
    {
        title: 'Job Matches',
        url: '/',
        icon: `<g clip-path="url(#clip0_3635_53)">
<path d="M17.3309 9.11339L15.3788 7.55165L10.7499 13.3377L8.52841 11.1161L6.76065 12.8839L10.9572 17.0805L17.3309 9.11339Z" fill="#134276"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M11.9997 0.664368C8.99329 0.664368 6.11003 1.85866 3.98419 3.9845C1.85835 6.11034 0.664062 8.9936 0.664062 12C0.664062 15.0064 1.85835 17.8897 3.98419 20.0155C6.11004 22.1414 8.9933 23.3356 11.9997 23.3356C15.0061 23.3356 17.8894 22.1414 20.0152 20.0155C22.1411 17.8897 23.3353 15.0064 23.3353 12C23.3353 8.99361 22.1411 6.11035 20.0152 3.9845C17.8894 1.85866 15.0061 0.664368 11.9997 0.664368ZM5.75196 5.75227C7.40896 4.09526 9.65634 3.16437 11.9997 3.16437C14.3431 3.16437 16.5904 4.09527 18.2474 5.75227C19.9044 7.40926 20.8353 9.65663 20.8353 12C20.8353 14.3434 19.9044 16.5908 18.2474 18.2477C16.5904 19.9047 14.3431 20.8356 11.9997 20.8356C9.65633 20.8356 7.40896 19.9047 5.75196 18.2477C4.09496 16.5907 3.16406 14.3434 3.16406 12C3.16406 9.65664 4.09496 7.40927 5.75196 5.75227Z" fill="#134276"/>
</g>
<defs>
<clipPath id="clip0_3635_3821">
<rect width="24" height="24" fill="white" transform="translate(0 0.5)"/>
</clipPath>
</defs>`,
    },
    {
        title: 'Job Applications',
        url: '/',
        icon: `<path fill-rule="evenodd" clip-rule="evenodd" d="M17.9597 1.10504L9.83293 9.23184V14.6671H15.2682L23.3949 6.54031L17.9597 1.10504ZM12.3329 10.2674L17.9597 4.64058L19.8594 6.54031L14.2327 12.1671H12.3329V10.2674Z" fill="#017AC9"/>
<path d="M1.58105 3.91499V22.9187H20.5848L20.5847 13.4168L18.0847 13.4169L18.0848 20.4187H4.08105V6.41499H11.0827V3.91499H1.58105Z" fill="#017AC9"/>
`,
    },
    {
        title: 'Saved',
        url: '/',
        icon: `<g clip-path="url(#clip0_3635_3067)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.0002 0.350464L16.0431 7.28126L23.5209 9.5821L18.3999 14.703L20.1209 23.3082L12.0002 19.6447L3.87941 23.3082L5.60044 14.703L0.479492 9.5821L7.95721 7.28126L12.0002 0.350464ZM12.0002 5.31205L9.62501 9.38376L5.18335 10.7504L8.31428 13.8814L7.28469 19.0293L12.0002 16.902L16.7157 19.0293L15.6861 13.8814L18.817 10.7504L14.3753 9.38376L12.0002 5.31205Z" fill="#017AC9"/>
</g>
<defs>
<clipPath id="clip0_3635_3067">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,
    },
    {
        title: 'Your CV',
        url: '/',
        icon: `<path d="M7.41555 8.70721H11.9999V6.20721H7.41555V8.70721Z" fill="#017AC9"/>
<path d="M7.41555 11.25V13.75H16.5843V11.25H7.41555Z" fill="#017AC9"/>
<path d="M7.41555 18.7928V16.2928H16.5843V18.7928H7.41555Z" fill="#017AC9"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M2.49805 1.16437V23.8356H21.5018V6.48098L16.1852 1.16437H2.49805ZM4.99805 21.3356V3.66437H15.1497L19.0018 7.51651V21.3356H4.99805Z" fill="#017AC9"/>
`,
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
    userButton.innerHTML = '<span>User button</span>';
    // Account menu
    const accountMenu = document.createElement('ul');
    accountMenu.classList.add('main-menu__account-menu');
    dropdownMenu.forEach((menu, idx) => {
        const list = document.createElement('li');
        list.classList.add('main-menu__account-menu-item');
        const link = document.createElement('a');
        link.href = menu.url;
        link.innerText = menu.title;
        link.classList.add('main-menu__account-menu-link');
        // Active link
        if (idx === 2) {
            list.classList.add('main-menu__account-menu-item--is-active');
        }
        // Icon
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewbox', '0 0 24 24');
        icon.setAttribute('height', '24');
        icon.setAttribute('width', '24');
        if (menu.icon) {
            icon.innerHTML = menu.icon;
        }
        if (idx !== 0) {
            icon.classList.add('main-menu__account-menu-icon');
            link.prepend(icon);
        }
        list.append(link);
        accountMenu.append(list);
    });
    userButton.addEventListener('click', handleAccountMenu);
    mainMenuInner.append(mainAction, userButton, accountMenu);
}
export default decorate;
