import { onPageLoad } from '../utils.js';

onPageLoad(() => {
    const main = document.querySelector('main');
    main.classList.add('wizard--bg-dark');

    window.addEventListener('wizard:navigate', (e) => {
        const index = e.detail.currStep.index;

        if (index == 0 || index == 1) {
            main.classList.add('wizard--bg-dark');
            main.classList.remove('wizard--bg-light');
        } else {
            main.classList.add('wizard--bg-light');
            main.classList.remove('wizard--bg-dark');
        }
    });
});
