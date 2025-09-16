import { onElementsAddedByClassName } from '../utils.js'
import { Summarizer } from './summarizer.js'
import { createButton } from '../../util.js';
import { i18n } from '../../../../i18n/index.js';
import { validateContainer } from '../wizard/wizard.js'

const summaryComponents = [];

onElementsAddedByClassName('wizard', (wizardEl) => {
  // Add save button to go back to the review page after save
  const def = {
    label: { value: i18n('Save changes') }, fieldType: 'button', name: 'save-changes', id: 'wizard-button-save-changes',
  };

  const saveBtn = createButton(def);
  // this is to match how addButton() works in wizard.js
  saveBtn.classList.add(def.id);

  wizardEl.querySelector('.wizard-button-wrapper').append(saveBtn);

  saveBtn.addEventListener('click', () => {
    // Save changes and go to review panel_summary
    const stepEl = wizardEl.querySelector('.current-wizard-step');

    if (validateContainer(stepEl)) {
      const index = wizardEl.querySelector('[name="panel_review"]')?.dataset.index;
      wizardEl.classList.remove('from-review');
      Summarizer.navigate(wizardEl, index);
    }
  });

  wizardEl.addEventListener('wizard:navigate', (e) => {
    const stepId = e.detail.currStep.id;
    const step = document.getElementById(stepId);
    summaryComponents.forEach((summary) => {
      if (step.contains(summary.el)) {
        // Render summary
        try {
          summary.summarizer(summary.el, summary.properties);
          // Register click on edit
          summary.el.querySelectorAll('.edit').forEach((a) => {
            a.addEventListener('click', () => {
              wizardEl.classList.add('from-review');
              Summarizer.gotoWizardStep(a);
            });
          });
        } catch {
          console.log(`Could not render summary ${summary.summaryType}`);
        }
      }
    });
  });
});

export default function decorate(el, field) {
  const { summaryType } = field.properties;
  const summarizer = Summarizer[summaryType];

  el.classList.add('field-summary');
  el.dataset.summaryType = summaryType;

  if (typeof summarizer !== 'function') {
    // ignore
    el.innerHTML = `Invalid summarizer ${summaryType}`;
    return el;
  }

  const { properties } = field;
  properties.title = field?.label?.value;
  properties.description = field?.description;

  summaryComponents.push({
    summaryType,
    summarizer,
    el,
    properties,
  });

  return el;
}
