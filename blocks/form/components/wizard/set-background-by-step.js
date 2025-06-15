import { onElementsAddedByClassName } from '../utils.js';

onElementsAddedByClassName('wizard', (wizardEl) => {
    const container = wizardEl.closest('main');
    container.classList.add('wizard--bg-dark');

    wizardEl.addEventListener('wizard:navigate', (e) => {
        const index = e.detail.currStep.index;

        if (index == 0 || index == 1) {
            container.classList.add('wizard--bg-dark');
            container.classList.remove('wizard--bg-light');
        } else {
            container.classList.add('wizard--bg-light');
            container.classList.remove('wizard--bg-dark');
        }
    });
});
