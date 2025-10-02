import { onElementsAddedByClassName } from '../utils.js'
import { Summarizer } from './summarizer.js'

const summaryComponents = [];

onElementsAddedByClassName('wizard', (wizardEl) => {
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
