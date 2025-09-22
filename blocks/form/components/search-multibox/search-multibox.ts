/**
 * Custom search-multibox component
 * Based on: Checkbox Group
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
  console.log('⚙️ Decorating search-multibox component:', fieldDiv, fieldJson, parentElement, formId);

  // TODO: Implement your custom component logic here
  // You can access the field properties via fieldJson.properties

  return fieldDiv;
}
