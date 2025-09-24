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

  // Add role alert
  panelEl.setAttribute('role', 'alert');
  panelEl.setAttribute('tabindex', '-1');

  const textContent = panelEl.querySelector('.panel-formcontextualhelp__title')?.textContent;

  onElementAdded(panelEl).then((connectedEl) => {
    const errorContainer = document.createElement('ul');
    errorContainer.classList.add('error-container');
    connectedEl.append(errorContainer);

    const parentElement = connectedEl.closest('.field-wizard > fieldset');;

    function updateVisibility() {
      const invalidFields = parentElement.querySelectorAll('.field-invalid');
      const hasInvalidFields = invalidFields.length > 0;
      errorContainer.innerHTML = '';

      // Reset original title
      connectedEl.querySelector('.panel-formcontextualhelp__title').textContent = textContent;

      invalidFields.forEach((target) => {
        if (!target.offsetParent || target.dataset.visible === 'false' || target.parentElement.dataset.visible === 'false') {
          // Consider only visible ones
          return;
        }

        let label = target.querySelector('legend,label')?.textContent;
        if (target.closest('.advanceddatepicker')) {
          const adpLabel = target.closest('.advanceddatepicker').querySelector(':scope>legend')?.textContent;
          if (adpLabel) {
            label = `${adpLabel} - ${label}`;
          }
        }
        const errorFieldContainer = document.createElement('li');
        const errorMessage = target.dataset.requiredErrorMessage || target.querySelector('.field-description')?.textContent;

        errorFieldContainer.innerHTML = `<a class="fieldname" href="#${target.dataset.id}">${label}</a> <span class="errormessage">${errorMessage}</span>`;
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
        connectedEl.focus();
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

export function reportGenericError(title, content) {
  const validationSummaryEl = document.querySelector('.wizard > .current-wizard-step .panel-validationsummary');
  if (!validationSummaryEl) {
    console.error(`${title}: ${content}`);
    return;
  }

  validationSummaryEl.querySelector('.panel-formcontextualhelp__title').textContent = title;

  const errorContainer = validationSummaryEl.querySelector('.error-container');
  errorContainer.innerHTML = '';

  const errorFieldContainer = document.createElement('li');
  errorFieldContainer.innerHTML = `<span class="errormessage">${content}</span>`;

  errorContainer.append(errorFieldContainer);

  validationSummaryEl.dataset.visible = true;
  validationSummaryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  validationSummaryEl.focus();

}

export function clearGenericError() {
  const validationSummaryEl = document.querySelector('.wizard > .current-wizard-step .panel-validationsummary');
  if (validationSummaryEl) {
    const errorContainer = validationSummaryEl.querySelector('.error-container');
    errorContainer.innerHTML = '';

    validationSummaryEl.dataset.visible = false;
  }
}
