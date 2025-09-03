/**
 * Custom toast component
 * Based on: Panel
 */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { FieldJson } from '@aemforms/af-core';

/**
 * Decorates a custom form field component
 * @param {HTMLElement} fieldDiv - The DOM element containing the field wrapper. Refer to the documentation
 * for its structure for each component.
 * @param {Object} fieldJson - The form json object for the component.
 * @param {HTMLElement} parentElement - The parent element of the field.
 * @param {string} formId - The unique identifier of the form.
 */
export default async function decorate(fieldDiv: HTMLElement, fieldJson: FieldJson, parentElement: HTMLElement, formId: String) {
  console.log('⚙️ Decorating toast component:', fieldDiv, fieldJson, parentElement, formId);

  // TODO: Implement your custom component logic here
  // You can access the field properties via fieldJson.properties

  const { properties } = fieldJson

  fieldDiv.classList.add('toast')

  // add the value of the type property as a class to the toast
  const type = properties?.toastType as string;
  fieldDiv.classList.add(type)

  // Create icon container
  const iconContainer = document.createElement('div');
  iconContainer.classList.add('toast__icon');

  // Create message container
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('toast__message-container');

  // Create the title div
  const titleDiv = document.createElement('div');
  titleDiv.classList.add('toast__title');

  // Create the description div
  const descriptionDiv = document.createElement('div');
  descriptionDiv.classList.add('toast__description');

  // add title and description to the message container
  messageContainer.appendChild(titleDiv);
  messageContainer.appendChild(descriptionDiv);

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.classList.add('toast__close-button');
  closeButton.innerHTML = '&times;';
  closeButton.setAttribute('aria-label', 'Close');

  // Add click event to close button
  closeButton.addEventListener('click', () => {
    fieldDiv.classList.add('toast__hidden');
  });

  // Append elements to toast
  fieldDiv.appendChild(iconContainer);
  fieldDiv.appendChild(messageContainer);
  fieldDiv.appendChild(closeButton);

  return fieldDiv;
}
