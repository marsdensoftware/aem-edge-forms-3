import { onElementsAddedByClassName } from '../utils.js';

onElementsAddedByClassName('wizard', (wizardEl) => {
  const container = wizardEl.closest('main');
  container.classList.add('wizard--bg-dark');

  wizardEl.addEventListener('wizard:navigate', (e) => {
    const index = e.detail.currStep.index;

    // Clear all background classes first
    container.classList.remove('wizard--bg-dark', 'wizard--bg-mid', 'wizard--bg-light');

    if (index === 0 || index === 1) {
      container.classList.add('wizard--bg-dark');
    } else if (index === 2) {
      container.classList.add('wizard--bg-mid');
    } else {
      container.classList.add('wizard--bg-light');
    }
  });
});
