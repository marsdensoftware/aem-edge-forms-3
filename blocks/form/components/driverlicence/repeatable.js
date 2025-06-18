import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";
import { isNo } from '../utils.js'

export class DriverLicenceRepeatable extends ConditionalRepeatable {
    static FIELD_NAMES = {
        LICENCE_CLASS: 'licence-class',
        ENDORSEMENTS_AVAILABLE: 'endorsements-available',
        ENDORSEMENTS: 'endorsements'
    };

    constructor(repeatablePanel) {
        super(repeatablePanel, 'driverlicence');
    }

    _init(entry) {
        this._bindEvents(entry);
    }

    _bindEvents(entry) {
        // Register change on licence class to show/hide the relevant class stage
        const licenceClass = entry.querySelectorAll(`input[name="${DriverLicenceRepeatable.FIELD_NAMES.LICENCE_CLASS}"]`);

        licenceClass.forEach(cb => {
            cb.addEventListener('change', () => {
                // class stage visibility
                const classStage = entry.querySelector(`fieldset[name="class${cb.value}-stage"]`);
                const visible = cb.checked == true;

                classStage.dataset.visible = visible;
            });
        });

        // Register change on endorsement to change dependent field
        const endorsementsAvailable = entry.querySelectorAll(`input[name="${DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS_AVAILABLE}"]`);
        const endorsements = entry.querySelector(`fieldset[name="${DriverLicenceRepeatable.FIELD_NAMES.ENDORSEMENTS}"]`);

        endorsementsAvailable.forEach(radio => {
            radio.addEventListener('change', (event) => {
                // Endorsements visibility
                const visible = !isNo(event.target);

                endorsements.dataset.visible = visible;
            });
        });
    }

    _onItemAdded(entry) {
        this._init(entry);

        super._onItemAdded(entry);
    }
}
