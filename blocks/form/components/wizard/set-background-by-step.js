import { onElementsAddedByClassName } from '../utils.js'

// Define the possible background classes in a constant for clarity and reuse.
const BG_CLASSES = ['wizard--bg-dark', 'wizard--bg-mid', 'wizard--bg-light']
const DEFAULT_BG_CLASS = 'wizard--bg-light'

/**
 * Finds the background class on the current wizard step and applies it to the container,
 * falling back to a default class if no specific one is found.
 * @param {HTMLElement} currentStepEl The current wizard step element.
 * @param {HTMLElement} container The container element to apply the background to.
 */
function updateBackground(currentStepEl, container) {
  if (!currentStepEl) return

  // Find which of the defined background classes is present on the active step.
  // If none is found, use the default.
  const newBgClass =
    BG_CLASSES.find((cls) => currentStepEl.classList.contains(cls)) ||
    DEFAULT_BG_CLASS

  // Clear any pre-existing background classes from the container for a clean slate.
  container.classList.remove(...BG_CLASSES)

  // If a background class was found on the step, apply it to the container.
  if (newBgClass) {
    container.classList.add(newBgClass)
  }
}

/**
 * Updates the exit button text based on whether the current step has the wizard-intro class.
 * @param {HTMLElement} currentStepEl The current wizard step element.
 */
function updateExitButtonText(currentStepEl) {
  if (!currentStepEl) return

  const exitBtn = currentStepEl.closest('form')?.querySelector('[name="top_nav"] [name="exitBtn"]')
  if (!exitBtn) return

  exitBtn.textContent = currentStepEl.classList.contains('wizard-intro') ? 'Exit' : 'Save & exit'
}

onElementsAddedByClassName('current-wizard-step', (wizardStepEl) => {
  const container = wizardStepEl.closest('main')

  updateBackground(wizardStepEl, container)
  updateExitButtonText(wizardStepEl)
})
