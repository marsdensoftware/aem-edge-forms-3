/**
 * Custom toast component
 * Based on: Panel
 */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { FieldJson } from '@aemforms/af-core';

export type ToastOptions = {
  type?: string; // e.g., 'success' | 'error' | 'info' | 'warning'
  toastTitle?: string;
  toastMessage?: string;
  dismissible?: boolean; // default: true
  timeoutMs?: number; // auto-dismiss after N ms (undefined to disable)
  iconClass?: string; // optional extra class for the icon node
};

function decorateToast(toastDiv: HTMLElement, options: ToastOptions = {}) {
  const {
    toastTitle,
    toastMessage,
    dismissible = true,
    timeoutMs, // auto-dismiss after N ms (undefined to disable)
  } = options;

  // Create a header container
  const headerContainer = document.createElement('div');
  headerContainer.classList.add('toast__header-container');

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('toast__icon');

  // Create the title div
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('toast__title');
  if (toastTitle) titleDiv.textContent = toastTitle;

  // Create a close button
  const closeButton = document.createElement('button');
  closeButton.classList.add('toast__close-button');
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close');

  // Add click event to close button
  closeButton.addEventListener('click', () => {
    toastDiv.classList.add('toast__hidden');
    // remove the toast
    if (toastDiv.isConnected) toastDiv.remove();
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
  if (toastMessage) messageDiv.textContent = toastMessage;

  // Append elements to toast
  toastDiv.appendChild(headerContainer);
  toastDiv.appendChild(messageDiv);

  // Optional auto-dismiss
  if (timeoutMs && timeoutMs > 0) {
    setTimeout(() => {
      if (!toastDiv.classList.contains('toast__hidden')) {
        toastDiv.classList.add('toast__hidden');
        setTimeout(() => {
          if (toastDiv.isConnected) toastDiv.remove();
        }, 400);
      }
    }, timeoutMs);
  }
}

export function createToast(options: ToastOptions = {}): HTMLDivElement {
  const toastDiv = document.createElement('div');
  toastDiv.classList.add('toast');
  if (options.type) toastDiv.classList.add(`toast--${options.type}`);
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
export default async function decorate(fieldDiv: HTMLElement, fieldJson: FieldJson, parentElement: HTMLElement, formId: String) {
  console.log('Decorating toast component:', fieldDiv, fieldJson, parentElement, formId);

  const { properties } = fieldJson;

  // Extract ToastOptions from properties
  const toastOptions: ToastOptions = {
    type: properties?.toastType as string,
    toastTitle: properties?.toastTitle as string,
    toastMessage: properties?.toastMessage as string,
    dismissible: properties?.dismissible !== false, // default to true if not specified
    timeoutMs: properties?.timeoutMs as number,
    iconClass: properties?.iconClass as string,
  };

  fieldDiv.classList.add('toast');
  if (toastOptions.type) {
    fieldDiv.classList.add(`toast--${toastOptions.type}`);
  }

  // Use the existing decorateToast function instead of recreating the elements
  decorateToast(fieldDiv, toastOptions);

  return fieldDiv;
}
