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

        const content = document.createElement('div');
        content.classList.add('repeatable-entries');
        this.#overview.append(content);

        this._repeatablePanel.prepend(this.#overview);

        const form = this._repeatablePanel.closest('form');

        form.addEventListener('item:add', (event) => {
            const added = event.detail.item.el;
            // Check that added belongs to the current repeatable
            if (this._repeatablePanel.contains(added)) {
                // make unique
                this._makeUnique(added);
                this._toggleEditMode(added, true);
            }
        });

        form.addEventListener('item:remove', (event) => {
            const removed = event.detail.item.el;
            // At this point the element is no longer in the dom
            const id = removed.dataset.id;
            const repeatableEntry = this._repeatablePanel.querySelector(`.repeatable-entry[data-id="${id}"]`);
            if (repeatableEntry) {
                // Find matching overview entry and remove
                repeatableEntry.remove();
                this._renderOverview();
            }
        });
    }

    _makeUnique(el) {
        // TODO NJ: Remove after bug fixed by Adobe
        const index = new Date().getTime();//Array.from(el.parentNode.children).indexOf(el);
        el.dataset.id = el.dataset.id + '-' + index;
        // Update IDs and labels
        const inputs = el.querySelectorAll('[data-id]');

        inputs.forEach((input) => {
            input.dataset.id = input.dataset.id + '-' + index;
            if (input.querySelector('input')) {
                input.querySelector('input').id = input.dataset.id;
            }
            if (input.querySelector('label')) {
                input.querySelector('label').htmlFor = input.dataset.id;
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

    #isFirstEntry(entry) {
        return Array.from(this._repeatablePanel.querySelectorAll('[data-repeatable]')).indexOf(entry) == 0;
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

                this._entryModified(entry);
            }
        });

        const cancelBtn = this._createButton('Cancel');
        cancelBtn.classList.add('btn-cancel', 'link');

        cancelBtn.addEventListener('click', () => {
            this._toggleEditMode(entry, false);
            this.#resetChanges();

            if (!entry.classList.contains('saved') && !this.#isFirstEntry(entry)) {
                // Unsaved and not first one --> Delete
                this.#triggerDeletion(entry);
            }
            this._renderOverview();

        });

        buttonBar.appendChild(saveBtn);
        buttonBar.appendChild(cancelBtn);
    }

    #resetChanges(entry) {
        alert('Todo: Reset changes');
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
            this._toggleEditMode(entry, true);
            e.preventDefault();
        });

        const deleteLink = document.createElement('a');
        deleteLink.classList.add('repeatable-entry__delete');
        deleteLink.textContent = 'Delete';
        deleteLink.href = '#';
        result.append(deleteLink);

        // TODO Implement deletion
        deleteLink.addEventListener('click', (e) => {
            if (this.#isFirstEntry(entry)) {
                // First one --> Remove from overview
                result.remove();
                // Clear changes
                this.#clearChanges(entry);
                // Remove saved flag
                entry.classList.remove('saved');
                this._renderOverview();
            }
            else {
                this.#triggerDeletion(entry);
            }

            e.preventDefault();
        });

        readable.forEach(r => {
            result.append(r);
        });

        return result;
    }

    #clearChanges(entry) {
        alert('Clearing changes');
    }

    #triggerDeletion(entry) {
        // Trigger click on framework item remove button
        entry?.querySelector('.item-remove')?.click();
    }

    init() {
        this._renderOverview();
    }

    _entryModified(entry) {
        // Find existing rendered entry
        const dataId = entry.dataset.id;
        const e = this._repeatablePanel.querySelector(`.repeatable-entry[data-id="${dataId}"]`);

        const content = this._renderEntry(entry);

        if (!e) {
            // Create
            this.#overview.firstElementChild.append(content);
        }
        else {
            // Update
            e.replaceWith(content);
        }
    }

    _renderOverview() {
        const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');

        if (savedEntries.length > 0) {
            const content = this.#overview.firstChild;
            
            // Clear content
            content.innerHTML = '';

            savedEntries.forEach((entry) => {
                content.append(this._renderEntry(entry));
            });
        }
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
    // A field that yields yes,1,true or no,0,false as value
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
                    if (this.#isYes(radio)) {
                        // show repeatable panel
                        repeatablePanel.style.display = 'block';
                        // enable validation
                        repeatablePanel.closest(`.field-${name}-options-content`).disabled = false;

                        const el = repeatablePanel.querySelector(':scope>[data-repeatable]:not(.saved)')

                        if (el) {
                            // Edit first entry if any
                            this._toggleEditMode(el, true);
                        }
                    }
                    else {
                        // hide repeatable panel
                        repeatablePanel.style.display = 'none';
                        // Show wizard buttons
                        super._toggleWizardButtons(true);

                        // TODO Clear all edits?

                        // prevent validation
                        repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
                    }
                });
            });
            // prevent validation
            repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
        }
    }

    #isYes(field) {
        const value = field.value || '';
        if (value === true || value === 1) return true;
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            return normalized === 'yes' || normalized === 'true' || normalized === '1';
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