import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";

export class LanguagePanelRepeatable extends ConditionalRepeatable {

    constructor(repeatablePanel) {
        super(repeatablePanel, 'language');
    }
}