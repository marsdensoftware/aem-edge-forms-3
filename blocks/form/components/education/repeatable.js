import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";

export class EducationRepeatable extends ConditionalRepeatable {

    static FIELD_NAMES = {
        'COMPLETION_STATUS': 'completion-status',
        'START_YEAR': 'start-year',
        'FINISH_YEAR': 'finish-year',
        'EDUCATION_SELECTION': 'education-selection'
    };

    constructor(repeatablePanel) {
        super(repeatablePanel, 'education');
    }

    _init(entry) {
        super._init(entry);
        // Register listener on completion status
        const completionStatusRadios = entry.querySelectorAll(`input[name="${EducationRepeatable.FIELD_NAMES.COMPLETION_STATUS}"]`);
        const finishYear = entry.querySelector(`.field-${EducationRepeatable.FIELD_NAMES.FINISH_YEAR}`);

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
    }

    _onItemAdded(entry) {
        this._init(entry);

        super._onItemAdded(entry);
    }

    _fieldToNameValues(entry) {
        const result = super._fieldToNameValues(entry);

        // Customize rendering for completion-year, completion status
        const completionStatus = result[EducationRepeatable.FIELD_NAMES.COMPLETION_STATUS];
        if (completionStatus?.value == '0') {
            // Completed
            const year = result[EducationRepeatable.FIELD_NAMES.FINISH_YEAR];
            completionStatus.displayValue += ` ${year.displayValue}`;
        }

        // Delete start and finish
        delete result[EducationRepeatable.FIELD_NAMES.FINISH_YEAR];
        delete result[EducationRepeatable.FIELD_NAMES.START_YEAR];

        return result;
    }
}