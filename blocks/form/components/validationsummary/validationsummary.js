import { collectFields, waitForVar } from '../utils.js'
import fchDecorate from '../formcontextualhelp/formcontextualhelp.js'

/*eslint-disable*/
/**
 * This component looks for all fields within the same parent container and subscribes to invalid/valid events.
 * A list of errors for invalid fields is then displayed
 */
export default function decorate(panelEl, model) {
  // Reuse form contextual help decorate
  fchDecorate(panelEl, model);

  (async () => {
    const myForm = await waitForVar('myForm');
    const parent = myForm.getElement(panelEl.dataset.id);

    if (!parent) {
      return;
    }

    const fields = collectFields(parent);
    const errorContainer = document.createElement('ul');
    ul.classList.add('error-container');
    panelEl.append(errorContainer);

    // Subscribe to invalid/valid events on the field datamodel
    fields.forEach((field) => {
      const errorFieldContainer = document.createElement('li');
      errorFieldContainer.id = field.id;
      errorFieldContainer.style.display = 'none';
      errorContainer.append(errorFieldContainer);

      field.subscribe((e) => {
        errorFieldContainer.innerHTML = `<span class="fieldname">${field.label}<span> field.errorMsg`;
        errorFieldContainer.style.display = 'block';
      }, 'invalid');

      field.subscribe((e) => {
        errorFieldContainer.innerHTML = '';
        errorFieldContainer.style.display = 'none';
      }, 'valid');
    });

  })();

  return panelEl;
}
