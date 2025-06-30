import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";
import { FIELD_NAMES } from './fieldnames.js'
import { DefaultFieldConverter } from '../utils.js'

class EducationConverter extends DefaultFieldConverter {

    convert(element) {
        const result = super.convert(element);

        // Customize rendering for completion-year, completion status
        const completionStatus = result[FIELD_NAMES.COMPLETION_STATUS];
        if (completionStatus?.value == '0') {
            // Completed
            const year = result[FIELD_NAMES.FINISH_YEAR];
            completionStatus.displayValue += ` ${year.displayValue}`;
        }

        // Delete start and finish
        delete result[FIELD_NAMES.FINISH_YEAR];
        delete result[FIELD_NAMES.START_YEAR];

        return result;
    }
}

export class EducationRepeatable extends ConditionalRepeatable {

    constructor(repeatablePanel) {
        super(repeatablePanel, 'education', new EducationConverter());
    }

    _init(entry) {
        super._init(entry);
        // Register listener on completion status
        const completionStatusRadios = entry.querySelectorAll(`input[name="${FIELD_NAMES.COMPLETION_STATUS}"]`);
        const finishYear = entry.querySelector(`.field-${FIELD_NAMES.FINISH_YEAR}`);

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
}