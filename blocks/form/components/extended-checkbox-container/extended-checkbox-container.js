/*eslint-disable*/
import { dispatchToast } from '../toast-container/toast-container.js';
/* eslint-disable-next-line no-unused-vars */
export default function decorate(fieldDiv, fieldJson) {
    fieldDiv.classList.add('extended-checkbox-container');
    // Maximum number of checkboxes that can be enabled at once
    const MAX_ENABLED_CHECKBOXES = 4;
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
                // get the '.extended-checkbox-group' element and the data-toast-title attribute
                const extendedCheckboxGroup = fieldDiv.closest('.extended-checkbox-group');
                const toastTitle = extendedCheckboxGroup === null || extendedCheckboxGroup === void 0 ? void 0 : extendedCheckboxGroup.dataset.toastTitle;
                // If the checkbox is being checked
                if (target.checked) {
                    // Count enabled checkboxes across all containers
                    const enabledCount = countEnabledCheckboxes();
                    // If enabling this checkbox would exceed the maximum
                    if (enabledCount > MAX_ENABLED_CHECKBOXES) {
                        // Prevent the checkbox from being checked
                        event.preventDefault();
                        target.checked = false;
                        // dispatch toast event with the max selection message (error state)
                        dispatchToast({
                            type: 'error',
                            toastTitle,
                            toastMessage: 'Deselect a strength to select a new one',
                            dismissible: true,
                            timeoutMs: undefined,
                            strategy: 'stack',
                            max: 4,
                        });
                        return;
                    }
                    // Show toast with the current selection count (success state)
                    // showToast(`${enabledCount} of ${MAX_ENABLED_CHECKBOXES} selected`, undefined, false);
                    let toastMessageFin = `You can add ${MAX_ENABLED_CHECKBOXES - enabledCount} strengths`;
                    if (MAX_ENABLED_CHECKBOXES - enabledCount === 1) {
                        toastMessageFin = 'You can add 1 more strength';
                    }
                    else if (MAX_ENABLED_CHECKBOXES - enabledCount === 0) {
                        toastMessageFin = 'You can\'t add anymore strengths';
                    }
                    dispatchToast({
                        type: 'success',
                        toastTitle,
                        toastMessage: toastMessageFin,
                        dismissible: true,
                        timeoutMs: undefined,
                    });
                }
            }, true); // Use capturing to intercept the event before it reaches the checkbox
        }
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
    }, 500);
    return fieldDiv;
}
