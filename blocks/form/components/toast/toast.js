/*eslint-disable*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
window.addEventListener('keydown', (event) => {
    var _a;
    if (event.key === 'Escape') {
        if (((_a = document.querySelector('dialog')) === null || _a === void 0 ? void 0 : _a.clientWidth) > 0) {
            // Do nothing if there is a dialog open
            return;
        }
        const toastDivs = document.querySelectorAll('.toast');
        const toastDiv = toastDivs[toastDivs.length - 1] || null;
        if (toastDiv) {
            toastDiv.classList.add('toast__hidden');
            // remove the toast
            if (toastDiv.isConnected)
                toastDiv.remove();
        }
    }
});
function decorateToast(toastDiv, options = {}) {
    const { toastTitle, toastMessage, dismissible = true, timeoutMs, // auto-dismiss after N ms (undefined to disable)
     } = options;
    // make sure we have the `aria-alive="polite"` attribute on the toast container
    toastDiv.setAttribute('aria-live', 'polite');
    // Create a header container
    const headerContainer = document.createElement('div');
    headerContainer.classList.add('toast__header-container');
    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('toast__icon');
    // Create the title div
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('toast__title');
    if (toastTitle)
        titleDiv.textContent = toastTitle;
    // Create a close button
    const closeButton = document.createElement('button');
    closeButton.classList.add('toast__close-button');
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close');
    // Add click event to close button
    closeButton.addEventListener('click', () => {
        toastDiv.classList.add('toast__hidden');
        // remove the toast
        if (toastDiv.isConnected)
            toastDiv.remove();
    });
    // add the icon, title and close to the header container
    headerContainer.appendChild(iconContainer);
    headerContainer.appendChild(titleDiv);
    if (dismissible) {
        headerContainer.appendChild(closeButton);
    }
    // Create the description div
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('toast__description');
    if (toastMessage)
        messageDiv.textContent = toastMessage;
    // Append elements to toast
    toastDiv.appendChild(headerContainer);
    toastDiv.appendChild(messageDiv);
    // Optional auto-dismiss
    if (timeoutMs && timeoutMs > 0) {
        setTimeout(() => {
            if (!toastDiv.classList.contains('toast__hidden')) {
                toastDiv.classList.add('toast__hidden');
                setTimeout(() => {
                    if (toastDiv.isConnected)
                        toastDiv.remove();
                }, 400);
            }
        }, timeoutMs);
    }
}
export function createToast(options = {}) {
    const toastDiv = document.createElement('div');
    toastDiv.classList.add('toast');
    if (options.type)
        toastDiv.classList.add(`toast--${options.type}`);
    decorateToast(toastDiv, options);
    return toastDiv;
}
/**
 * Decorates a custom form field component
 * @param {HTMLElement} fieldDiv - The DOM element containing the field wrapper. Refer to the documentation
 * for its structure for each component.
 * @param {Object} fieldJson - The form JSON object for the component.
 * @param {HTMLElement} parentElement - The parent element of the field.
 * @param {string} formId - The unique identifier of the form.
 */
export default function decorate(fieldDiv, fieldJson, parentElement, formId) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Decorating toast component:', fieldDiv, fieldJson, parentElement, formId);
        const { properties } = fieldJson;
        // Extract ToastOptions from properties
        const toastOptions = {
            type: properties === null || properties === void 0 ? void 0 : properties.toastType,
            toastTitle: properties === null || properties === void 0 ? void 0 : properties.toastTitle,
            toastMessage: properties === null || properties === void 0 ? void 0 : properties.toastMessage,
            dismissible: (properties === null || properties === void 0 ? void 0 : properties.dismissible) !== false, // default to true if not specified
            timeoutMs: properties === null || properties === void 0 ? void 0 : properties.timeoutMs,
            iconClass: properties === null || properties === void 0 ? void 0 : properties.iconClass,
        };
        fieldDiv.classList.add('toast');
        if (toastOptions.type) {
            fieldDiv.classList.add(`toast--${toastOptions.type}`);
        }
        // Use the existing decorateToast function instead of recreating the elements
        decorateToast(fieldDiv, toastOptions);
        // get the sibling legend element and add the data-visible="false" attribute
        const legend = fieldDiv.querySelector('legend');
        if (legend) {
            legend.setAttribute('data-visible', 'false');
        }
        return fieldDiv;
    });
}
