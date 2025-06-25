import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";
import { isNo } from '../utils.js'
import { FIELD_NAMES } from './fieldnames.js';

export class WorkExperienceRepeatable extends ConditionalRepeatable {


    static PAID_WORK = '1';

    constructor(repeatablePanel) {
        super(repeatablePanel, 'workexperience');
    }

    _init(entry) {
        const typeOfWorkExperience = entry.querySelector(`[name="${FIELD_NAMES.TYPE_OF_WE}"]`);

        const isFirst = this._isFirstEntry(entry);

        // Make type of work experience visible if not first entry
        typeOfWorkExperience.parentElement.dataset.visible = !isFirst;

        // Show below fields if it is first. Or until a type of work experience has been selected.
        entry.querySelector(`[name="${FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = isFirst;

        typeOfWorkExperience.addEventListener('change', () => {
            // Show fields below now that a type of work has been selected
            entry.querySelector(`[name="${FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = true;
        });

        // Disable/Hide endofwork to prevent validation
        const endofwork = entry.querySelector('.field-endofwork');
        const visible = false;
        endofwork.disabled = !visible;
        endofwork.dataset.visible = visible;

        this._bindEvents(entry);
    }

    _onItemAdded(entry) {
        this._init(entry);

        super._onItemAdded(entry);
    }

    _bindEvents(el) {
        // Register change on still-working field to show hide endofwork
        const stillWorkingRadios = el.querySelectorAll(`input[name="${FIELD_NAMES.STILL_WORKING}"]`);

        stillWorkingRadios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                // endofwork visibility
                const endofwork = radio.closest(`[name="${FIELD_NAMES.FIELDS_CONTAINER}"]`).querySelector('.field-endofwork');
                const visible = isNo(event.target);
                endofwork.dataset.visible = visible;
                endofwork.disabled = !visible;
            });
        });
    }

    _save(entry) {
        // Before save
        if (this._isFirstEntry(entry)) {
            const selectedRadio = this._conditionField.querySelector('input[type="radio"]:checked');
            if (selectedRadio) {
                const value = selectedRadio.value;
                // Copy radio value into type of work field. Because it is not visible initially for the first entry
                const typeOfWorkExperience = entry.querySelector(`[name="${FIELD_NAMES.TYPE_OF_WE}"]`);
                typeOfWorkExperience.value = value;
            }
        }

        super._save(entry);
        // After save

    }
}
