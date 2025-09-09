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
// Helper API: programmatically dispatch a toast event from anywhere
export function dispatchToast(options = {}) {
    const detail = Object.assign({ strategy: 'stack', max: 3 }, options);
    window.dispatchEvent(new window.CustomEvent('app:toast', { detail }));
}
// Helper API: clear all toasts from the active toast container
export function dispatchToastClear() {
    window.dispatchEvent(new window.CustomEvent('app:toast-clear'));
}
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
    // window.dispatchEvent(
    //   new CustomEvent<ToastOptions>(
    //     'app:toast', { detail: { type, title, description, timeoutMs, strategy: 'stack', max: 3 } }
    //   )
    // )
    window.addEventListener('app:toast', ((e) => {
        console.log('Toast event received:', e);
        const ce = e;
        const detail = ce.detail || {};
        // Determine strategy: prefer explicit event detail, then container dataset, default to 'stack'
        const containerStrategy = (containerEl.getAttribute('data-strategy') || '').toLowerCase();
        const maxAttr = containerEl.getAttribute('data-max');
        const maxFromAttr = maxAttr ? parseInt(maxAttr, 10) : undefined;
        const strategy = detail.strategy
            ? detail.strategy
            : (containerStrategy === 'single' || maxFromAttr === 1 ? 'single' : 'stack');
        const max = (typeof detail.max === 'number') ? detail.max : (maxFromAttr || undefined);
        if (strategy === 'single' || max === 1) {
            // Always replace any existing toast with a new one
            const toast = createToast(detail);
            while (containerEl.firstChild) {
                containerEl.removeChild(containerEl.firstChild);
            }
            appendToast(toast, containerEl);
        }
        else {
            // Stack behavior with optional max cap: remove oldest when max is reached
            const toast = createToast(detail);
            const maxCap = (typeof max === 'number' && max > 0) ? max : undefined;
            if (maxCap !== undefined) {
                while (containerEl.childElementCount >= maxCap) {
                    const first = containerEl.firstElementChild;
                    if (first)
                        first.remove();
                    else
                        break;
                }
            }
            appendToast(toast, containerEl);
        }
    }));
    // Listen for events that will remove all toasts from the toast-container, without removing the toast-container
    window.addEventListener('app:toast-clear', ((e) => {
        console.log('Toast clear event received:', e);
        while (containerEl.firstChild) {
            containerEl.removeChild(containerEl.firstChild);
        }
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
