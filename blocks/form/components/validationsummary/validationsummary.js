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

  const className = 'panel-validationsummary'
  panelEl.classList.add(className);

  onElementAdded(panelEl).then((connectedEl) => {
    const errorContainer = document.createElement('ul');
    errorContainer.classList.add('error-container');
    connectedEl.append(errorContainer);

    const parentElement = connectedEl.parentElement;

    function updateVisibility() {
      const invalidFields = parentElement.querySelectorAll('.field-invalid');
      const hasInvalidFields = invalidFields.length > 0;
      errorContainer.innerHTML = '';

      invalidFields.forEach((target) => {
        const label = target.querySelector('legend')?.textContent;
        const errorFieldContainer = document.createElement('li');
        const errorMessage = target.dataset.requiredErrorMessage || target.querySelector('.field-description')?.textContent;

        errorFieldContainer.innerHTML = `<span class="fieldname">${label}</span> <span class="errormessage">${errorMessage}</span>`;
        errorContainer.append(errorFieldContainer);
      });

      connectedEl.dataset.visible = hasInvalidFields;
    }

    // Create an observer
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;

          if (!target.offsetParent) {
            return;
          }

          const oldClasses = mutation.oldValue ? mutation.oldValue.split(/\s+/) : [];
          const newClasses = target.classList;

          const wasPresent = oldClasses.includes('field-invalid');
          const isPresent = newClasses.contains('field-invalid');
          const added = !wasPresent && isPresent;
          const removed = wasPresent && !isPresent;

          if (added || removed) {
            updateVisibility();
          }

          if (added) {
            connectedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    });

    // Start observing for attribute changes on parent element
    observer.observe(parentElement, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
      subtree: true
    });
  });

  return panelEl;
}
