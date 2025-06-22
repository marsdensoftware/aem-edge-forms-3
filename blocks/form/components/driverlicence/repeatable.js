import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";
import { isNo } from '../utils.js'

export class DriverLicenceRepeatable extends ConditionalRepeatable {
    static FIELD_NAMES = {
        LICENCE_CLASS: 'licence-class',
        ENDORSEMENTS_AVAILABLE: 'endorsements-available',
        ENDORSEMENTS: 'endorsements'
    };

    constructor(el, properties) {
        super(el, properties, 'driverlicence');
    }

    _init(entry) {
        this._bindEvents(entry);
    }

    _clearFields(entry) {
        super._clearFields(entry);
        
        const endorsementsField = entry.querySelectorAll(`fieldset[name="${DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS}"]`);
        endorsementsField.dataset.visible = false;

        const endorsementsAvailableField = entry.querySelector(`fieldset[name="${DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS_AVAILABLE}"]`);
        endorsementsAvailableField.dataset.visible = false;

        const classStages = entry.querySelectorAll('[name^="class"][name$="-stage"]');
        classStages.forEach(classStage => {
            classStage.dataset.visible = false;
        });

    }

    _bindEvents(entry) {
        // Register change on licence class to show/hide the relevant class stage and endorsements
        const licenceClass = entry.querySelectorAll(`input[name="${DriverLicenceRepeatable.FIELD_NAMES.LICENCE_CLASS}"]`);

        const endorsementsAvailable = entry.querySelectorAll(`input[name="${DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS_AVAILABLE}"]`);
        const endorsementsAvailableField = entry.querySelector(`fieldset[name="${DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS_AVAILABLE}"]`);

        licenceClass.forEach(cb => {
            cb.addEventListener('change', () => {
                // class stage visibility
                const classStage = entry.querySelector(`fieldset[name="class${cb.value}-stage"]`);
                const visible = cb.checked == true;

                classStage.dataset.visible = visible;

                const anyClassChecked = Array.from(licenceClass).some(checkbox => checkbox.checked);
                endorsementsAvailableField.dataset.visible = anyClassChecked;
            });
        });

        // Register change on endorsement to change dependent field
        const endorsements = entry.querySelector(`fieldset[name="${DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS}"]`);

        endorsementsAvailable.forEach(radio => {
            radio.addEventListener('change', (event) => {
                // Endorsements visibility
                const visible = !isNo(event.target);

                endorsements.dataset.visible = visible;
            });
        });
    }

    _fieldToNameValues(entry) {
        const result = super._fieldToNameValues(entry);
        const newResult = {};

        // Customize rendering for licence class/stage
        const licenceClass = result[DriverLicenceRepeatable.FIELD_NAMES.LICENCE_CLASS];
        if (licenceClass.value) {
            licenceClass.values = [licenceClass.value];
            licenceClass.displayValues = [licenceClass.displayValue];
        }

        newResult[DriverLicenceRepeatable.FIELD_NAMES.LICENCE_CLASS] = { values: [], displayValues: [] };
        const hasEndorsements = !isNo(result[DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS_AVAILABLE]);
        if (hasEndorsements) {
            newResult[DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS] = result[DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS];
        }

        licenceClass.values.forEach((value, index) => {
            const stage = result[`class${value}-stage`];
            const displayValue = licenceClass.displayValues[index];

            newResult[DriverLicenceRepeatable.FIELD_NAMES.LICENCE_CLASS].values.push(`${value}-${stage.value}`);
            newResult[DriverLicenceRepeatable.FIELD_NAMES.LICENCE_CLASS].displayValues.push(`${displayValue} - ${stage.displayValue}`);
        });

        return newResult;
    }
}
