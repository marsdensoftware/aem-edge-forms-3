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
// @ts-ignore
import { createToast } from '../toast/toast.js';
let globalContainerEl = null;
let listenerInitialized = false;
export function getOrCreateToastContainer() {
    var _a;
    // Prefer an existing decorated container in the DOM which will be a child of the `form .current-wizard-step` element
    const existing = document.querySelector('form .current-wizard-step .toast-container')
        || document.querySelector('.toast-container');
    if (existing) {
        globalContainerEl = existing;
        return existing;
    }
    // Create a detached container if not present
    const container = document.createElement('div');
    container.classList.add('toast-container');
    (_a = document.querySelector('form .current-wizard-step')) === null || _a === void 0 ? void 0 : _a.appendChild(container);
    globalContainerEl = container;
    return container;
}
export function appendToast(toastEl, container) {
    const target = container || globalContainerEl || getOrCreateToastContainer();
    target.appendChild(toastEl);
}
export function removeToast(toastEl) {
    if (toastEl.isConnected) {
        toastEl.remove();
    }
}
function initToastEventBridge(containerEl) {
    if (listenerInitialized)
        return;
    listenerInitialized = true;
    // Listen for programmatic toasts from anywhere:
    // window.dispatchEvent(new CustomEvent<ToastOptions>('app:toast', { detail: { type, title, description, timeoutMs } }))
    window.addEventListener('app:toast', ((e) => {
        console.log('Toast event received:', e);
        const ce = e;
        const toast = createToast(ce.detail || {});
        appendToast(toast, containerEl);
    }));
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
        console.log('Decorating toast-container component:', fieldDiv, fieldJson, parentElement, formId);
        fieldDiv.classList.add('toast-container');
        initToastEventBridge(fieldDiv);
        return fieldDiv;
    });
}
