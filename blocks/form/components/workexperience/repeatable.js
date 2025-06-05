import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";

export class WorkExperienceRepeatable extends ConditionalRepeatable {
    static FIELD_NAMES = {
        'TYPE_OF_WE': 'type-of-work-experience',
        'FIELDS_CONTAINER': 'fields-container'
    };

    constructor(repeatablePanel) {
        super(repeatablePanel, 'workexperience');
    }

    _onItemAdded(entry) {
        const typeOfWorkExperience = entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.TYPE_OF_WE}"]`);

        // Make type of work experience visible if not first entry
        typeOfWorkExperience.parentElement.dataset.visible = !this._isFirstEntry(entry);

        // Hide below fields until a type of work experience has been added
        entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = false;

        typeOfWorkExperience.addEventListener('change', () => {
            entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = true;
        });

        super._onItemAdded(entry);
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
