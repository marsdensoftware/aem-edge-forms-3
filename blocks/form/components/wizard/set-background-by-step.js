import { onElementsAddedByClassName } from '../utils.js';

// Define the possible background classes in a constant for clarity and reuse.
const BG_CLASSES = ['wizard--bg-dark', 'wizard--bg-mid', 'wizard--bg-light'];

/**
 * Finds the background class on the current wizard step and applies it to the container.
 * @param {HTMLElement} wizardEl The main wizard element.
 * @param {HTMLElement} container The container element to apply the background to.
 */
function updateBackground(wizardEl, container) {
  // 1. Find the currently active step by its class.
  const currentStepEl = wizardEl.querySelector('.current-wizard-step');
  if (!currentStepEl) return;

  // 2. Find which of the defined background classes is present on the active step.
  const newBgClass = BG_CLASSES.find((cls) => currentStepEl.classList.contains(cls));

  // 3. Clear any pre-existing background classes from the container for a clean slate.
  container.classList.remove(...BG_CLASSES);

  // 4. If a background class was found on the step, apply it to the container.
  if (newBgClass) {
    container.classList.add(newBgClass);
  }
}

onElementsAddedByClassName('wizard', (wizardEl) => {
  const container = wizardEl.closest('main');

  // Set the initial background based on the default active step on page load.
  updateBackground(wizardEl, container);

  // Add an event listener to update the background whenever the step changes.
  wizardEl.addEventListener('wizard:navigate', () => {
    updateBackground(wizardEl, container);
  });
});
