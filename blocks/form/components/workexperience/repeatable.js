import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";
import { isNo } from '../utils.js'

export class WorkExperienceRepeatable extends ConditionalRepeatable {
    static FIELD_NAMES = {
        'TYPE_OF_WE': 'type-of-work-experience',
        'FIELDS_CONTAINER': 'fields-container',
        'STILL_WORKING': 'still-working'
    };

    constructor(repeatablePanel) {
        super(repeatablePanel, 'workexperience');

        this._bindEvents(repeatablePanel);
    }

    _onItemAdded(entry) {
        const typeOfWorkExperience = entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.TYPE_OF_WE}"]`);

        // Make type of work experience visible if not first entry
        typeOfWorkExperience.parentElement.dataset.visible = !this._isFirstEntry(entry);

        // Hide below fields until a type of work experience has been selected
        entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = false;

        typeOfWorkExperience.addEventListener('change', () => {
            // Show fields below now that a type of work has been selected
            entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = true;
        });

        this._bindEvents(entry);

        super._onItemAdded(entry);
    }

    _bindEvents(el) {
        // Register change on still-working field to show hide endofwork
        const stillWorkingRadios = el.querySelectorAll(`[name="${WorkExperienceRepeatable.FIELD_NAMES.STILL_WORKING}"]`);

        stillWorkingRadios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                // endofwork visibility
                const endofwork = radio.closest(`.${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}`).querySelector('.field-endofwork');

                endofwork.dataset.visible = isNo(event.target);
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
                const typeOfWorkExperience = entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.TYPE_OF_WE}"]`);
                typeOfWorkExperience.value = value;
            }
        }

        super._save(entry);
        // After save

    }
}
