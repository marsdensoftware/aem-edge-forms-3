import { ConditionalRepeatable } from "../repeatable-panel/default/default.js";

export class LanguageRepeatable extends ConditionalRepeatable {

    constructor(repeatablePanel) {
        super(repeatablePanel, 'language');
    }
}