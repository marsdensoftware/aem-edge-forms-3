import { onElementsAddedByClassName } from '../utils.js'
import { createProgressBar, trackProgress } from './progress-bar.js'
import { dispatchToastClear } from '../toast-container/toast-container.js';

// Define the possible background classes in a constant for clarity and reuse.
const BG_CLASSES = ['wizard--bg-dark', 'wizard--bg-mid', 'wizard--bg-light']
const DEFAULT_BG_CLASS = 'wizard--bg-light'
const FINAL_STEP_GROUP = '4';

/**
 * Finds the background class on the current wizard step and applies it to the container,
 * falling back to a default class if no specific one is found.
 * @param {HTMLElement} wizardEl The main wizard element.
 * @param {HTMLElement} container The container element to apply the background to.
 */
function updateBackground(wizardEl, container) {
  // 1. Find the currently active step by its class.
  const currentStepEl = wizardEl.querySelector('.current-wizard-step')
  if (!currentStepEl) return

  // 2. Find which of the defined background classes is present on the active step.If none
  // is found, use the default. This uses short-circuiting: if currentStepEl is null, it
  // immediately uses the default.
  const newBgClass =
    (currentStepEl &&
      BG_CLASSES.find((cls) => currentStepEl.classList.contains(cls))) ||
    DEFAULT_BG_CLASS

  // 3. Clear any pre-existing background classes from the container for a clean slate.
  container.classList.remove(...BG_CLASSES)

  // 4. If a background class was found on the step, apply it to the container.
  if (newBgClass) {
    container.classList.add(newBgClass)
  }
}

function updateExitButtonText(wizardEl) {
  const currentStepEl = wizardEl.querySelector('.current-wizard-step')
  if (!currentStepEl) return

  const exitBtn = currentStepEl
    .closest('form')
    .querySelector('[name="top_nav"] [name="exitBtn"]')
  if (!exitBtn) return

  exitBtn.textContent = currentStepEl.classList.contains('wizard-intro')
    ? 'Exit'
    : 'Save & exit'
}

function updateWizardNextButton(container) {
  // if the current wizard step has a data-stepgroup of '4' set the value of the
  // Net button to Finish
  const currentStepEl = container.querySelector('.current-wizard-step')
  if (!currentStepEl) return
  const nextBtn = currentStepEl
    .closest('form')
    .querySelector('#wizard-button-next')
  if (!nextBtn) return
  if (currentStepEl.dataset.stepgroup === FINAL_STEP_GROUP) {
    nextBtn.textContent = 'Finish'
  } else {
    nextBtn.textContent = 'Next'
  }
}

onElementsAddedByClassName('wizard', (wizardEl) => {
  const container = wizardEl.closest('main')

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        if (mutation.target.classList.contains('current-wizard-step')) {
          updateBackground(wizardEl, container);
          trackProgress();
        }
      }
    });
  });

  const wizardChildren = wizardEl.children;
  for (const child of wizardChildren) {
    observer.observe(child, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  // Set the initial background based on the default active step on page load.
  updateBackground(wizardEl, container)
  updateExitButtonText(wizardEl)
  createProgressBar()

  // Add an event listener to update the background whenever the step changes.
  wizardEl.addEventListener('wizard:navigate', () => {
    updateExitButtonText(wizardEl)
    updateWizardNextButton(container)

    // clear the toasts in the container by triggering the toast-clear event
    dispatchToastClear();
  })
})
