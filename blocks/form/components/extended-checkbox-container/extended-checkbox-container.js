/*eslint-disable*/
import { createToast } from '../toast/toast.js';
import { getOrCreateToastContainer, appendToast, removeToast } from '../toast-container/toast-container.js';
/* eslint-disable-next-line no-unused-vars */
export default function decorate(fieldDiv, fieldJson) {
    fieldDiv.classList.add('extended-checkbox-container');
    // Maximum number of checkboxes that can be enabled at once
    const MAX_ENABLED_CHECKBOXES = 4;
    // Track the currently displayed toast so we can replace or remove it as needed
    let currentToastEl = null;
    // Function to show a toast with a message using the shared toast + container
    const showToast = (message, secondLine, isError = false) => {
        // Remove any existing toast created by this component to keep a single active toast
        if (currentToastEl) {
            removeToast(currentToastEl);
            currentToastEl = null;
        }
        const options = {
            type: isError ? 'error' : 'success',
            toastTitle: message,
            toastMessage: secondLine,
            dismissible: true,
            timeoutMs: undefined,
        };
        const toast = createToast(options);
        const container = getOrCreateToastContainer();
        appendToast(toast, container);
        currentToastEl = toast;
    };
    // Function to count the number of enabled checkboxes across all sibling containers
    const countEnabledCheckboxes = () => {
        // Find the parent element that contains all the extended-checkbox-containers
        const parent = fieldDiv.parentElement;
        if (!parent)
            return 0;
        // Find all sibling extended-checkbox-containers
        const containers = parent.querySelectorAll('.extended-checkbox-container');
        let count = 0;
        // Count enabled checkboxes across all containers
        containers.forEach((container) => {
            const checkbox = container.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                count += 1;
            }
        });
        return count;
    };
    // Add an event listener to the checkbox in this container
    const setupCheckboxListeners = () => {
        // Get the single checkbox in this container
        const checkbox = fieldDiv.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.addEventListener('click', (event) => {
                const target = event.target;
                // If the checkbox is being checked
                if (target.checked) {
                    // Count enabled checkboxes across all containers
                    const enabledCount = countEnabledCheckboxes();
                    // If enabling this checkbox would exceed the maximum
                    if (enabledCount > MAX_ENABLED_CHECKBOXES) {
                        // Prevent the checkbox from being checked
                        event.preventDefault();
                        target.checked = false;
                        // Show toast with max selection message (error state)
                        showToast(`${MAX_ENABLED_CHECKBOXES} of ${MAX_ENABLED_CHECKBOXES} selected`, 'Deselect a skill to select a new one', true);
                        return;
                    }
                    // Show toast with the current selection count (success state)
                    showToast(`${enabledCount} of ${MAX_ENABLED_CHECKBOXES} selected`, undefined, false);
                }
                else {
                    // Checkbox is being unchecked, update the count
                    // We need to call countEnabledCheckboxes() after the current event completes
                    // because the checkbox state hasn't been updated yet
                    setTimeout(() => {
                        const enabledCount = countEnabledCheckboxes();
                        if (enabledCount > 0) {
                            showToast(`${enabledCount} of ${MAX_ENABLED_CHECKBOXES} selected`, undefined, false);
                        }
                    }, 0);
                }
            }, true); // Use capturing to intercept the event before it reaches the checkbox
        }
    };
    const setupWizardCloseButtonListener = () => {
        // find the wizard
        const wizardPanel = fieldDiv.closest('.wizard');
        if (!wizardPanel)
            return;
        // get the wizard-button-wrapper
        const wizardButtonWrapper = wizardPanel.querySelector('.wizard-button-wrapper');
        if (!wizardButtonWrapper)
            return;
        // attach a listener to the wizard-button-next and wizard-button-prev so we hide the toast
        // when they are clicked
        wizardButtonWrapper.addEventListener('click', (event) => {
            const target = event.target;
            if (target.id === 'wizard-button-next' || target.id === 'wizard-button-prev') {
                if (currentToastEl) {
                    removeToast(currentToastEl);
                    currentToastEl = null;
                }
            }
        });
    };
    // Set up a MutationObserver to detect when a checkbox is added to this container
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Check if any of the added nodes is a checkbox or contains a checkbox
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        if (element.tagName === 'INPUT' && element.getAttribute('type') === 'checkbox') {
                            // If a checkbox was added directly, set up listeners again
                            setupCheckboxListeners();
                        }
                        else if (element.querySelector) {
                            // If a container was added, check if it contains a checkbox
                            const checkbox = element.querySelector('input[type="checkbox"]');
                            if (checkbox) {
                                setupCheckboxListeners();
                            }
                        }
                    }
                });
            }
        });
    });
    // Start observing the container for changes
    observer.observe(fieldDiv, { childList: true, subtree: true });
    // Initial setup of checkbox listeners
    // Use setTimeout to ensure all checkboxes are rendered
    setTimeout(() => {
        setupCheckboxListeners();
        setupWizardCloseButtonListener();
    }, 500);
    return fieldDiv;
}
