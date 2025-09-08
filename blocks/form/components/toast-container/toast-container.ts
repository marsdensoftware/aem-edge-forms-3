/**
 * Custom toast-container component
 * Based on: Panel
 */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { FieldJson } from '@aemforms/af-core';
// @ts-ignore
import { createToast } from '../toast/toast.js';
import type { ToastOptions } from '../toast/toast.js';

let globalContainerEl: HTMLElement | null = null;
let listenerInitialized = false;

export function getOrCreateToastContainer(): HTMLElement {
  // Prefer an existing decorated container in the DOM which will be a child of the `form .current-wizard-step` element
  const existing = document.querySelector<HTMLElement>('form .current-wizard-step .toast-container')
    || document.querySelector<HTMLElement>('.toast-container');
  if (existing) {
    globalContainerEl = existing;
    return existing;
  }

  // Create a detached container if not present
  const container = document.createElement('div');
  container.classList.add('toast-container');
  document.querySelector('form .current-wizard-step')?.appendChild(container);
  globalContainerEl = container;
  return container;
}

export function appendToast(toastEl: HTMLElement, container?: HTMLElement) {
  const target = container || globalContainerEl || getOrCreateToastContainer();
  target.appendChild(toastEl);
}

export function removeToast(toastEl: HTMLElement) {
  if (toastEl.isConnected) {
    toastEl.remove();
  }
}

function initToastEventBridge(containerEl: HTMLElement) {
  if (listenerInitialized) return;
  listenerInitialized = true;

  // Listen for programmatic toasts from anywhere:
  // window.dispatchEvent(new CustomEvent<ToastOptions>('app:toast', { detail: { type, title, description, timeoutMs } }))
  window.addEventListener('app:toast', ((e: Event) => {
    console.log('Toast event received:', e);

    const ce = e as CustomEvent<ToastOptions>;
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
export default async function decorate(fieldDiv: HTMLElement, fieldJson: FieldJson, parentElement: HTMLElement, formId: String) {
  console.log('Decorating toast-container component:', fieldDiv, fieldJson, parentElement, formId);

  fieldDiv.classList.add('toast-container');
  initToastEventBridge(fieldDiv);

  return fieldDiv;
}
