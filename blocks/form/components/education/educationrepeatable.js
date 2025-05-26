import { RepeatablePanel } from "../repeatable-panel/default/default.js";

export class EducationRepeatable extends RepeatablePanel {
    #educationRadioGroup;

    static FIELD_NAMES = {
        'COMPLETION_STATUS': 'completion-status',
        'START_YEAR': 'start-year',
        'FINISH_YEAR': 'finish-year',
        'EDUCATION_SELECTION': 'education-selection'
    };

    constructor(repeatablePanel) {
        super(repeatablePanel);

        // Add class for education
        repeatablePanel.classList.add('panel-repeatable-panel__education');

        // Register listener on completion status
        const completionStatusRadios = repeatablePanel.querySelectorAll(`input[name="${EducationRepeatable.FIELD_NAMES.COMPLETION_STATUS}"]`);
        const finishYear = repeatablePanel.querySelector(`.field-${EducationRepeatable.FIELD_NAMES.FINISH_YEAR}`);

        completionStatusRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value == '0') {
                    // Completed, show finish year
                    finishYear.setAttribute('data-visible', true);
                }
                else {
                    // Not completed, hide finish year
                    finishYear.setAttribute('data-visible', false);
                }
            });
        });

        this.#educationRadioGroup = repeatablePanel.querySelector('.field-education-selection');
        if (this.#educationRadioGroup) {
            const radios = this.#educationRadioGroup.querySelectorAll(`input[name="${EducationRepeatable.FIELD_NAMES.EDUCATION_SELECTION}"]`);

            // register click on radios
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.value == 'yes') {
                        // show repeatable panel
                        repeatablePanel.style.display = 'block';
                        const el = repeatablePanel.querySelector(':scope>[data-repeatable]')

                        // enable validation
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
            // prevent validation
            repeatablePanel.closest('.field-education-options-content').disabled = true;
        }
    }

    _fieldToNameValues(entry) {
        const result = super._fieldToNameValues(entry);

        // Customize rendering for completion-year, completion status
        const completionStatus = result[EducationRepeatable.FIELD_NAMES.COMPLETION_STATUS];
        if (completionStatus.value == '0') {
            // Completed
            const year = result[EducationRepeatable.FIELD_NAMES.FINISH_YEAR];
            completionStatus.displayValue += ` ${year.displayValue}`;
        }

        // Delete start and finish
        delete result[EducationRepeatable.FIELD_NAMES.FINISH_YEAR];
        delete result[EducationRepeatable.FIELD_NAMES.START_YEAR];

        return result;
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