import { onElementsAddedByClassName } from '../utils.js'
import { Summarizer } from './summarizer.js'

export default function decorate(el, field) {
    const { summaryType } = field.properties;

    el.classList.add('field-summary');
    el.dataset.summaryType = summaryType;

    onElementsAddedByClassName('wizard', (wizardEl) => {
        wizardEl.addEventListener('wizard:navigate', (e) => {
            const stepId = e.detail.currStep.id;
            const step = document.getElementById(stepId);

            if (step.contains(el)) {
                // Render summary
                const summarizer = Summarizer[summaryType];
                if (typeof summarizer === 'function') {
                    const { properties } = field;
                    properties.title = field?.label?.value;

                    summarizer(el, properties);

                    // Register click on edit
                    el.querySelectorAll('.edit').forEach(a => {
                        a.addEventListener('click', () => {
                            Summarizer.gotoWizardStep(a);
                        });
                    });
                }
            };

        });
    });

    return el;
}