import { onElementAdded } from '../utils.js'
import fchDecorate from '../formcontextualhelp/formcontextualhelp.js'

/*eslint-disable*/
/**
 * This component looks for all invalid fields within the current wizard step and displays a list of errors
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

    const parentElement = connectedEl.closest('.field-wizard > fieldset');;

    function updateVisibility() {
      const invalidFields = parentElement.querySelectorAll('.field-invalid');
      const hasInvalidFields = invalidFields.length > 0;
      errorContainer.innerHTML = '';

      invalidFields.forEach((target) => {
        if (!target.offsetParent || target.dataset.visible === 'false' || target.parentElement.dataset.visible === 'false') {
          // Consider only visible ones
          return;
        }

        let label = target.querySelector('legend,label')?.textContent;
        if (!target.classList.contains('advanceddatepicker') && target.closest('.advanceddatepicker')) {
          const adpLabel = target.closest('.advanceddatepicker').querySelector(':scope>legend')?.textContent;
          if (adpLabel) {
            label = `${adpLabel} - ${label}`;
          }
        }
        const errorFieldContainer = document.createElement('li');
        const errorMessage = target.dataset.requiredErrorMessage || target.querySelector(':scope>.field-description-2,:scope>.field-description')?.textContent;

        errorFieldContainer.innerHTML = `<a class="fieldname" href="#${target.dataset.id}">${label}</a> <span class="errormessage">${errorMessage}</span>`;
        errorFieldContainer.setAttribute('aria-live', 'polite');
        errorContainer.append(errorFieldContainer);
      });

      connectedEl.dataset.visible = hasInvalidFields;
    }

    // Create an observer
    const observer = new MutationObserver((mutationsList) => {
      let added = false;
      let removed = false;

      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;

          const oldClasses = mutation.oldValue ? mutation.oldValue.split(/\s+/) : [];
          const newClasses = target.classList;

          const wasPresent = oldClasses.includes('field-invalid');
          const isPresent = newClasses.contains('field-invalid');
          added = added || (!wasPresent && isPresent);
          removed = removed || (wasPresent && !isPresent);
        }
      }

      if (added || removed) {
        updateVisibility();
      }

      if (added) {
        connectedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
