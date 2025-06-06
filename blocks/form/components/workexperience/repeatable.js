import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";
import { isNo } from '../utils.js'

export class WorkExperienceRepeatable extends ConditionalRepeatable {
    static FIELD_NAMES = {
        'TYPE_OF_WE': 'type-of-work-experience',
        'FIELDS_CONTAINER': 'fields-container',
        'START_OF_WORK_MONTH': 'startofwork-month',
        'START_OF_WORK_YEAR': 'startofwork-year',
        'END_OF_WORK_MONTH': 'endofwork-month',
        'END_OF_WORK_YEAR': 'endofwork-year',
        'STILL_WORKING': 'still-working',
        'TYPE_OF_WORK_EXPERIENCE': 'type-of-work-experience',
        'JOB_TITLE': 'title',
        'EMPLOYER_NAME': 'employer'
    };

    constructor(repeatablePanel) {
        super(repeatablePanel, 'workexperience');

        const entries = repeatablePanel.querySelectorAll('[data-repeatable]');
        entries.forEach(entry => {
            this._init(entry);
        });
    }

    _fieldToNameValues(entry) {
        const result = super._fieldToNameValues(entry);

        // Customize rendering for completion-year, completion status
        const stillWorking = result[WorkExperienceRepeatable.FIELD_NAMES.STILL_WORKING];
        let workperiod = result[WorkExperienceRepeatable.FIELD_NAMES.START_OF_WORK_MONTH].displayValue + ' ' + result[WorkExperienceRepeatable.FIELD_NAMES.START_OF_WORK_YEAR].displayValue;

        if (stillWorking.value == '0') {
            // No longer working
            const endofwork = result[WorkExperienceRepeatable.FIELD_NAMES.END_OF_WORK_MONTH].displayValue + ' ' + result[WorkExperienceRepeatable.FIELD_NAMES.END_OF_WORK_YEAR].displayValue;

            workperiod += ` - ${endofwork}`;
        }

        const newResult = {};
        newResult[WorkExperienceRepeatable.FIELD_NAMES.JOB_TITLE] = result[WorkExperienceRepeatable.FIELD_NAMES.JOB_TITLE];
        newResult[WorkExperienceRepeatable.FIELD_NAMES.EMPLOYER_NAME] = result[WorkExperienceRepeatable.FIELD_NAMES.EMPLOYER_NAME];
        newResult['workperiod'] = { 'value': workperiod, 'displayValue': workperiod };

        return newResult;
    }

    _init(entry) {
        const typeOfWorkExperience = entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.TYPE_OF_WE}"]`);

        // Make type of work experience visible if not first entry
        typeOfWorkExperience.parentElement.dataset.visible = !this._isFirstEntry(entry);

        // Hide below fields until a type of work experience has been selected
        entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = false;

        typeOfWorkExperience.addEventListener('change', () => {
            // Show fields below now that a type of work has been selected
            entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = true;
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
        const stillWorkingRadios = el.querySelectorAll(`input[name="${WorkExperienceRepeatable.FIELD_NAMES.STILL_WORKING}"]`);

        stillWorkingRadios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                // endofwork visibility
                const endofwork = radio.closest(`[name="${WorkExperienceRepeatable.FIELD_NAMES.FIELDS_CONTAINER}"]`).querySelector('.field-endofwork');
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
                const typeOfWorkExperience = entry.querySelector(`[name="${WorkExperienceRepeatable.FIELD_NAMES.TYPE_OF_WE}"]`);
                typeOfWorkExperience.value = value;
            }
        }

        super._save(entry);
        // After save

    }
}
