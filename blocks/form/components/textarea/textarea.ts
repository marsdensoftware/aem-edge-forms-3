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
 */
export default async function decorate(fieldDiv: HTMLElement, fieldJson: Field) {
  fieldDiv.classList.add('textarea');

  // eslint-disable-next-line prefer-destructuring
  const rows = fieldJson.properties.rows;

  if (rows) {
    fieldDiv.querySelector('textarea')?.setAttribute('rows', rows);
  }

  return fieldDiv;
}
