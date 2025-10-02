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
/* eslint-disable-next-line no-unused-vars */
export default async function decorate(fieldDiv: HTMLElement, fieldJson: Field, parentElement: HTMLElement, formId: String) {
  fieldDiv.classList.add('extended-checkbox-group');
  const description = fieldDiv.querySelector(':scope>.field-description') as HTMLDivElement;

  const description2 = description?.cloneNode(true) as HTMLElement;
  if (description2) {
    description2.classList.remove('field-description');
    description2.classList.add('field-description-2');
  }

  // add the description2 to the fieldDiv just below the `legend` element
  const legend = fieldDiv.querySelector(':scope>.field-label');
  if (legend && description2) {
    legend.insertAdjacentElement('afterend', description2);
  }

  if (description) {
    fieldDiv.append(description);
    description.dataset.visible = 'false';
  }

  if (fieldJson.properties.isRequired) {
    const input = document.createElement('input');
    input.required = true;
    input.type = 'text';
    input.style.display = 'none';
    input.addEventListener('invalid', () => {
      description.dataset.visible = 'true';
    });
    input.addEventListener('valid', () => {
      description.dataset.visible = 'false';
    });
    const defaultErrorMsg = 'Please select at least one from up to four';
    fieldDiv.dataset.requiredErrorMessage = fieldJson.properties.requiredErrorMessage || defaultErrorMsg;

    fieldDiv.addEventListener('change', () => {
      const required = fieldDiv.querySelectorAll('input[type="checkbox"]:checked').length === 0;
      if (!required) {
        updateOrCreateInvalidMsg(input)
        input.dispatchEvent(new Event('valid'));
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
