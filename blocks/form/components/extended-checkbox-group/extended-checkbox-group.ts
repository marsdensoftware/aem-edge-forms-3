/**
 * Custom extended-checkbox-group component
 * Based on: Panel
 */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { Field } from '@aemforms/af-core';
import { updateOrCreateInvalidMsg } from '../../util.js'
/**
 * Decorates a custom form field component
 * @param {HTMLElement} fieldDiv - The DOM element containing the field wrapper. Refer to the documentation
 * for its structure for each component.
 * @param {Object} fieldJson - The form json object for the component.
 * @param {HTMLElement} parentElement - The parent element of the field.
 * @param {string} formId - The unique identifier of the form.
 */
export default async function decorate(fieldDiv: HTMLElement, fieldJson: Field, parentElement: HTMLElement, formId: String) {
  console.log('⚙️ Decorating extended-checkbox-group component:', fieldDiv, fieldJson, parentElement, formId);

  fieldDiv.classList.add('extended-checkbox-group');
  const description = fieldDiv.querySelector(':scope>.field-description');

  if (description) {
    // Move description to the bottom
    fieldDiv.append(description);
  }

  if (fieldJson.required) {
    const input = document.createElement('input');
    input.required = true;
    input.type = 'text';
    input.style.display = 'none';

    fieldDiv.dataset.requiredErrorMessage = fieldJson.mandatoryMessage || 'Please select at least one from up to four';

    fieldDiv.addEventListener('change', () => {
      const required = fieldDiv.querySelectorAll('input[type="checkbox"]:checked').length === 0;
      if (!required) {
        updateOrCreateInvalidMsg(input)
      }
      input.required = required;
    });

    fieldDiv.append(input);
  }

  const toastTitleProp = fieldJson.properties.toastTitle;
  // set the 'data-toast-title' on the fieldDiv
  fieldDiv.setAttribute('data-toast-title', toastTitleProp);

  return fieldDiv;
}
