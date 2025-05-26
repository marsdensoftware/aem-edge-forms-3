import { RepeatablePanel } from "../default/default.js";
import { loadCSS } from '../../../../../scripts/aem.js'

export class Education extends RepeatablePanel {
    #educationRadioGroup;

    constructor(repeatablePanel) {
        super(repeatablePanel);

        loadCSS(`${window.hlx.codeBasePath}/blocks/form/components/repeatable-panel/education/education.css`)

        // Add class for education
        repeatablePanel.classList.add('panel-repeatable-panel__education');

        this.#educationRadioGroup = repeatablePanel.closest('.field-education')?.querySelector('.field-education-selection');
        if (this.#educationRadioGroup) {
            const radios = this.#educationRadioGroup.querySelectorAll('input[type="radio"]');

            // register click on radios
            radios?.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.value == 'yes') {
                        // show repeatable panel
                        repeatablePanel.style.display = 'block';
                        const el = repeatablePanel.querySelector(':scope>[data-repeatable]')

                        // prevent validation
                        repeatablePanel.closest('.field-education-options-content').disabled = false;

                        // Edit first entry
                        super._toggleEditMode(el, true);

                    }
                    if (radio.value == 'no') {
                        // hide repeatable panel
                        repeatablePanel.style.display = 'none';
                        // Show wizard buttons
                        super._toggleWizardButtons(true);

                        // prevent validation
                        repeatablePanel.closest('.field-education-options-content').disabled = true;
                    }
                });
            });
        }
    }

    _renderOverview() {
        super._renderOverview();

        // Add custom logic here
        const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');
        if (savedEntries.length > 0) {
            // Hide question
            this.#educationRadioGroup.setAttribute('data-visible', false);
        }
        else {
            // reset selection & show question
            const radios = this.#educationRadioGroup.querySelectorAll('input[type="radio"]');

            radios?.forEach(radio => { radio.checked = false; });
            // Show question
            this.#educationRadioGroup.setAttribute('data-visible', true);
            // hide repeatable panel
            this._repeatablePanel.style.display = 'none';
        }
    }
}
