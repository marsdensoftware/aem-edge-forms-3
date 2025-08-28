import { onElementAdded } from '../utils.js'
import fchDecorate from '../formcontextualhelp/formcontextualhelp.js'

/*eslint-disable*/
/**
 * This component looks for all fields within the same parent container and subscribes to invalid/valid events.
 * A list of errors for invalid fields is then displayed
 */
export default function decorate(panelEl, model) {
  // Reuse form contextual help decorate
  fchDecorate(panelEl, model);

  onElementAdded(panelEl).then((connectedEl) => {
    const errorContainer = document.createElement('ul');
    errorContainer.classList.add('error-container');
    connectedEl.append(errorContainer);

    function updateVisibility() {
      const hasInvalidFields = errorContainer.querySelector("li:not(.d-none)") !== null;

      connectedEl.dataset.visible = hasInvalidFields;
    }

    // Create an observer
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          const id = target.dataset.id;
          const field = myForm.getElement(id);

          if (!field) {
            return;
          }

          let errorFieldContainer = errorContainer.querySelector(`li.error-${id}`);

          if (target.classList.contains('field-invalid')) {
            if (!errorFieldContainer) {
              errorFieldContainer = document.createElement('li');
              errorFieldContainer.classList.add(`error-${id}`);
              errorFieldContainer.innerHTML = `<span class="fieldname">${field.label.value}<span> ${field.errorMessage}`;
              errorContainer.append(errorFieldContainer);
            }

            errorFieldContainer.classList.remove('d-none');
          }
          else {
            errorFieldContainer?.classList.add('d-none');
          }
          updateVisibility();
        }
      }
    });

    // Start observing for attribute changes
    observer.observe(connectedEl.parentElement, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true
    });
  });

  return panelEl;
}
