import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";

export class LanguagePanelRepeatable extends ConditionalRepeatable {

    static FIELD_NAMES = {
        'PROFICIENCY': 'proficiency'
    };

    constructor(repeatablePanel) {
        super(repeatablePanel, 'languagepanel');

        // Register typeahead valid listener
        document.addEventListener('typeahead:valid', (event) => {
            // Check if the change happens on language field within this repeatable
            const target = event.target;
            if (this._repeatablePanel.contains(target)) {
                target.closest('fieldset').querySelector(`[name="${proficiency}"]`)?.display = 'block';
            }
        });

        // Register typeahead invalid listener
        document.addEventListener('typeahead:valid', (event) => {
            // Check if the change happens on language field within this repeatable
            const target = event.target;
            if (this._repeatablePanel.contains(target)) {
                target.closest('fieldset').querySelector(`[name="${proficiency}"]`)?.display = 'none';
            }
        });
    }
}