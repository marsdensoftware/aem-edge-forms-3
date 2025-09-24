/**
 * Custom textarea component
 * Based on: Text Input
 */
/* eslint-disable-next-line import/no-extraneous-dependencies */
import { Field } from '@aemforms/af-core';

/**
 * Decorates a custom form field component
 * @param {HTMLElement} fieldDiv - The DOM element containing the field wrapper. Refer to the documentation
 * for its structure for each component.
 * @param {Object} fieldJson - The form json object for the component.
 * @param {HTMLElement} parentElement - The parent element of the field.
 * @param {string} formId - The unique identifier of the form.
 */
export default async function decorate(fieldDiv: HTMLElement, fieldJson: Field, parentElement: HTMLElement, formId: String) {
  console.log('⚙️ Decorating textarea component:', fieldDiv, fieldJson, parentElement, formId);

  fieldDiv.classList.add('textarea');

  // add the row attribute to the textarea element
  // eslint-disable-next-line prefer-destructuring
  const rows = fieldJson.properties.rows;
  if (rows) {
    fieldDiv.setAttribute('rows', rows);
  }

  return fieldDiv;
}
