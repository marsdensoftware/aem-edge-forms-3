import { validateContainer } from '../../wizard/wizard.js'
import { loadCSS } from '../../../../../scripts/aem.js'

export class RepeatablePanel {
    #overview;
    constructor(repeatablePanel) {
        // Load css
        loadCSS(`${window.hlx.codeBasePath}/blocks/form/components/repeatable-panel/repeatable-panel.css`)

        this._repeatablePanel = repeatablePanel;
        this._repeatablePanel.classList.add('panel-repeatable-panel');

        // create overview
        this.#overview = document.createElement('div');
        this.#overview.classList.add('overview');

        this._repeatablePanel.parentElement.prepend(this.#overview);

        const form = this._repeatablePanel.closest('form');

        form.addEventListener('item:add', (event) => {
            const added = event.detail.item.el;
            // make unique
            this.#makeUnique(added);
            this._toggleEditMode(added, true);
        });
    }

    #makeUnique(el) {
        // Update IDs and labels
        const inputs = el.querySelectorAll('input, select, textarea');
        // Use timestamp to generate a unique suffix
        const uniqueSuffix = Date.now();
        el.dataset.id = 'panelcontainer-'+uniqueSuffix;
        el.querySelectorAll('.field-wrapper').forEach(fw=>{
            const type = fw.id.split('-')[0];
            fw.id = `${type}-${uniqueSuffix}`;
            fw.dataset.id = fw.id;
        });

        inputs.forEach((input, index) => {
            const oldId = input.id;
            const newId = `${input.name}-${index}-${uniqueSuffix}`;

            // Update input ID
            input.id = newId;

            // Update corresponding label "for"
            if (oldId) {
                const label = el.querySelector(`label[for="${oldId}"]`);
                if (label) {
                    label.setAttribute('for', newId);
                }
            }
        });
    }

    _toggleEditMode(entry, visible) {
        const panel = entry.closest('.panel-repeatable-panel');
        if (visible) {
            entry.classList.add('current');
            panel.classList.add('editing');
        }
        else {
            entry.classList.remove('current');
            panel.classList.remove('editing');
        }

        this._toggleWizardButtons(!visible);
        this._ensureButtonBar(entry);
    }

    _toggleWizardButtons(visible) {
        const wizardButtonWrapper = this._repeatablePanel.closest('.wizard')?.querySelector('.wizard-button-wrapper');
        if (!wizardButtonWrapper) {
            return;
        }
        if (visible) {
            // show wizard buttons
            wizardButtonWrapper.style.display = 'flex';
        }
        else {
            // hide wizard buttons
            wizardButtonWrapper.style.display = 'none';
        }
    }

    _ensureButtonBar(entry) {
        let buttonBar = entry.querySelector('.button-bar');
        if (buttonBar) {
            return;
        }

        buttonBar = document.createElement('div');
        buttonBar.className = 'button-bar';
        entry.appendChild(buttonBar);

        const saveBtn = this._createButton('Save');
        saveBtn.classList.add('btn-save')

        saveBtn.addEventListener('click', () => {
            // Validate
            const valid = validateContainer(entry);

            if (valid) {
                // Mark as saved
                entry.classList.add('saved');
                this._toggleEditMode(entry, false);

                this._renderOverview();
            }
        });

        const cancelBtn = this._createButton('Cancel');
        cancelBtn.classList.add('btn-cancel', 'link');

        cancelBtn.addEventListener('click', () => {
            // TODO: If new added one then remove. 
            // TODO: If saved one then reset changes.
            // if first one hide
            if (entry.dataset.index == 0) {
                this._toggleEditMode(entry, false);
            }

            this._renderOverview();
        });

        buttonBar.appendChild(saveBtn);
        buttonBar.appendChild(cancelBtn);
    }

    _fieldToNameValues(entry) {
        const inputs = entry.querySelectorAll('input, select, textarea');
        const result = {};

        inputs.forEach(input => {
            const value = input.value;;
            let displayValue = value;
            const name = input.name;

            const type = input.type;

            if (input.tagName === 'SELECT') {
                displayValue = input.options[input.selectedIndex]?.text.trim() || '';
            }
            else if (type === 'checkbox' || type === 'radio') {
                // Ignore not checked
                if (!input.checked) {
                    return;
                }

                displayValue = input.checked ? input.parentElement.querySelector('label').textContent.trim() : '';
            }

            if (value) {
                if (result[name]) {
                    // multi values
                    const e = result[name];
                    if (!e.values) {
                        e.values = [];
                        e.values.push(e.value);
                        delete e.value;
                        e.displayValues = [];
                        e.displayValues.push(e.displayValue);
                        delete e.displayValue;
                    }
                    e.values.push(value);
                    e.displayValues.push(displayValue);
                }
                else {
                    result[name] = { 'value': value, 'displayValue': displayValue };
                }
            }
        });

        return result;
    }

    #entryToReadableString(entry) {
        const nameValues = this._fieldToNameValues(entry)
        const entries = [];

        Object.entries(nameValues).forEach(([name, data]) => {
            const value = data.value;
            const displayValue = data.displayValue;

            if (value) {
                const result = document.createElement('div');
                result.classList.add(`repeatable-entry__${name}`);
                result.dataset.value = value;
                result.innerHTML = displayValue;

                entries.push(result);
            }

            const values = data.values;
            const displayValues = data.displayValues;
            if (values) {
                const result = document.createElement('div');
                result.classList.add(`repeatable-entry__${name}`);
                result.dataset.values = values;
                result.innerHTML = displayValues.join(', ');

                entries.push(result);
            }
        });

        return entries;
    }

    _renderEntry(entry) {
        const readable = this.#entryToReadableString(entry);

        const result = document.createElement('div');
        result.classList.add('education-entry', 'repeatable-entry');
        result.dataset.id = entry.dataset.id;

        const editLink = document.createElement('a');
        editLink.classList.add('repeatable-entry__edit');
        editLink.textContent = 'Edit';
        editLink.href = '#';
        result.append(editLink);

        editLink.addEventListener('click', (e) => {
            alert('Edit entry: ' + result.dataset.id);
            e.preventDefault();
        });

        readable.forEach(r => {
            result.append(r);
        });

        return result;
    }

    init() {
        this._renderOverview();
    }

    _renderOverview() {
        const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');

        // For now reset everything. Later implement a more efficient/targeted approach;
        if (savedEntries.length > 0) {
            const content = document.createElement('div');
            content.classList.add('repeatable-entries')

            savedEntries.forEach((entry) => {
                content.append(this._renderEntry(entry));
            });

            // Clear without repaint
            while (this.#overview.firstChild) {
                this.#overview.removeChild(this.#overview.firstChild);
            }

            // Append new content
            this.#overview.appendChild(content);
        }

        // unsaved
        /*
        const unsavedEntries = panel.querySelectorAll('[data-repeatable]:not(.saved)');
        unsavedEntries.forEach(el => {
            toggleEditMode(renderer, el, true);
        });
        */

    }

    _createButton(label) {
        const button = document.createElement('button');
        button.classList.add('button');
        button.type = 'button';
        const text = document.createElement('span');
        text.textContent = label;
        button.append(document.createElement('i'), text);

        return button;
    }
}

/**
 * Repeatable that is displayed when a condition is fullfiled, based on a radio group
 */
export class ConditionalRepeatable extends RepeatablePanel {
    // Radio group
    #conditionField;

    static FIELD_NAMES = {
        'COMPLETION_STATUS': 'completion-status',
        'START_YEAR': 'start-year',
        'FINISH_YEAR': 'finish-year',
        'EDUCATION_SELECTION': 'education-selection'
    };

    constructor(repeatablePanel, name) {
        super(repeatablePanel);

        // Add class
        repeatablePanel.classList.add(`panel-repeatable-panel__conditional`);

        // Add class
        repeatablePanel.classList.add(`panel-repeatable-panel__${name}`);

        this.#conditionField = repeatablePanel.closest(`.field-${name}`).querySelector(`.field-${name}-selection`);
        if (this.#conditionField) {
            const radios = this.#conditionField.querySelectorAll(`input[name="${name}-selection"]`);

            // register click on radios
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.value == 'yes') {
                        // show repeatable panel
                        repeatablePanel.style.display = 'block';
                        const el = repeatablePanel.querySelector(':scope>[data-repeatable]')

                        // enable validation
                        repeatablePanel.closest(`.field-${name}-options-content`).disabled = false;

                        // Edit first entry
                        super._toggleEditMode(el, true);

                    }
                    if (radio.value == 'no') {
                        // hide repeatable panel
                        repeatablePanel.style.display = 'none';
                        // Show wizard buttons
                        super._toggleWizardButtons(true);

                        // prevent validation
                        repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
                    }
                });
            });
            // prevent validation
            repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
        }
    }

    _renderOverview() {
        super._renderOverview();

        // Add custom logic here
        const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');
        if (savedEntries.length > 0) {
            // Hide question
            this.#conditionField.setAttribute('data-visible', false);
        }
        else {
            // reset selection & condition field
            const radios = this.#conditionField.querySelectorAll('input[type="radio"]');

            radios?.forEach(radio => { radio.checked = false; });
            // Show condition field
            this.#conditionField.setAttribute('data-visible', true);
            // hide repeatable panel
            this._repeatablePanel.style.display = 'none';
        }
    }
}