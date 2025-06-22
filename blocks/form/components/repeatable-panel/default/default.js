import { validateContainer } from '../../wizard/wizard.js'
import { loadCSS } from '../../../../../scripts/aem.js'
import { isNo } from '../../utils.js'

export class RepeatablePanel {
    #overview;
    constructor(el, properties, name) {
        this._repeatablePanel = el.querySelector('.repeat-wrapper');
        this._name = name;

        if (!this._repeatablePanel) {
            throw new Error('No repeatable panel found');
        }

        this._addedTitle = properties.addedTitle;
        this._cardTitle = properties.cardTitle;

        // Load css
        loadCSS(`${window.hlx.codeBasePath}/blocks/form/components/repeatable-panel/repeatable-panel.css`)

        this._repeatablePanel.classList.add('panel-repeatable-panel');

        // create overview
        this.#overview = document.createElement('div');
        this.#overview.dataset.visible = false;
        this.#overview.classList.add('overview');

        if (this._addedTitle) {
            const addedTitleContainer = document.createElement('div');
            addedTitleContainer.classList.add('overview-title');
            addedTitleContainer.innerHTML = this._addedTitle;
            this.#overview.append(addedTitleContainer);
        }

        const content = document.createElement('div');
        content.classList.add('repeatable-entries');
        this.#overview.append(content);

        this._repeatablePanel.prepend(this.#overview);

        const form = this._repeatablePanel.closest('form');

        form.addEventListener('item:add', (event) => {
            const added = event.detail.item.el;
            // Check that added belongs to the current repeatable
            if (this._repeatablePanel.contains(added)) {
                this._onItemAdded(added);
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

        const entries = this._repeatablePanel.querySelectorAll('[data-repeatable]');
        entries.forEach(entry => {
            this._init(entry);
        });
    }

    _init(entry) {
        // Can be overriden in sub classes to perform entry initialization, event bindings, etc...
        console.log(`Initializing ${entry.id}`);
    }

    _onItemAdded(entry) {
        // make unique
        this._makeUnique(entry);
        this._toggleEditMode(entry, true);
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

    _isFirstEntry(entry) {
        return Array.from(this._repeatablePanel.querySelectorAll('[data-repeatable]')).indexOf(entry) == 0;
    }

    _validate(entry) {
        // Can be used in subclasses to perform custom validations
        return entry != undefined;
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
            const valid = validateContainer(entry) && this._validate(entry);

            if (valid) {
                // Save
                this._save(entry);

            }
        });

        const cancelBtn = this._createButton('Cancel');
        cancelBtn.classList.add('btn-cancel', 'link');

        cancelBtn.addEventListener('click', () => {

            this._toggleEditMode(entry, false);
            this._resetChanges(entry);

            if (!entry.classList.contains('saved') && !this._isFirstEntry(entry)) {
                // Unsaved and not first one --> Delete
                this.#triggerDeletion(entry);
            }
            this._renderOverview();

        });

        buttonBar.appendChild(cancelBtn);
        buttonBar.appendChild(saveBtn);
    }

    _save(entry) {
        entry.classList.add('saved');
        this._toggleEditMode(entry, false);

        this._entryModified(entry);
    }

    _resetChanges(entry) {
        const inputs = entry.querySelectorAll('input, select, textarea');

        if (entry.classList.contains('saved')) {
            // Save entry, reset to previous values from repeatable-entry
            const id = entry.dataset.id;
            const repeatableEntry = this._repeatablePanel.querySelector(`[data-id="${id}"]`);
            if (!repeatableEntry) {
                // Clear fields
                this._clearFields(entry);
                return;
            }

            inputs.forEach(input => {
                const el = repeatableEntry.querySelector(`[data-name="${input.name}"]`);
                const value = el ? el.data.value : undefined;

                switch (input.type) {
                    case 'checkbox':
                    case 'radio':
                        input.checked = input.value === value;
                        break;
                    default:
                        input.value = value;
                        break;
                }
            });
        }
        else {
            // Unsaved --> Clear all fields
            this._clearFields(entry);
        }
    }

    _clearFields(entry) {
        const inputs = entry.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }

    _fieldToNameValues(entry) {
        function getLabelText(input) {
            // First check text inside label
            let label = input.parentElement.querySelector('label>.text');
            if (!label) {
                // Fallback to label
                label = input.parentElement.querySelector('label');
            }

            return label.textContent.trim()
        }

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

                displayValue = input.checked ? getLabelText(input) : '';
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
        let nameValues = this._fieldToNameValues(entry)
        const entries = [];

        if (this._cardTitle) {
            // Add card title as first entry
            nameValues = {
                cardTitle: {
                    'value': this._cardTitle,
                    'displayValue': this._cardTitle
                },
                ...nameValues
            };
        }

        Object.entries(nameValues).forEach(([name, data]) => {
            const value = data.value;
            const displayValue = data.displayValue;

            if (value) {
                const result = document.createElement('div');
                result.classList.add(`repeatable-entry__${name}`);
                result.dataset.value = value;
                result.dataset.name = name;
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
        result.classList.add(`${this._name}-entry`, 'repeatable-entry');
        result.dataset.id = entry.dataset.id;

        const editLink = document.createElement('a');
        editLink.classList.add('repeatable-entry__edit');
        editLink.textContent = 'Edit';
        editLink.href = '#';
        result.append(editLink);

        editLink.addEventListener('click', (e) => {
            alert('Coming soon...');
            /*
            this._toggleEditMode(entry, true);
            */

            e.preventDefault();
        });

        const deleteLink = document.createElement('a');
        deleteLink.classList.add('repeatable-entry__delete');
        deleteLink.textContent = 'Delete';
        deleteLink.href = '#';
        //result.append(deleteLink);

        // TODO Implement deletion
        deleteLink.addEventListener('click', (e) => {
            alert('Coming soon...');
            /*
            if (this._isFirstEntry(entry)) {
                // First one --> Remove from overview
                result.remove();
                // Clear changes
                this.#clearFields(entry);
                // Remove saved flag
                entry.classList.remove('saved');
                this._renderOverview();
            }
            else {
                this.#triggerDeletion(entry);
            }
            */

            e.preventDefault();
        });

        readable.forEach(r => {
            result.append(r);
        });

        return result;
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
            this.#overview.querySelector('.repeatable-entries').append(content);
            this.#overview.dataset.visible = true;
        }
        else {
            // Update
            e.replaceWith(content);
        }
    }

    _renderOverview() {
        const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');

        if (savedEntries.length > 0) {
            const content = this.#overview.querySelector('.repeatable-entries');

            // Clear content
            content.innerHTML = '';

            savedEntries.forEach((entry) => {
                content.append(this._renderEntry(entry));
            });
            this.#overview.dataset.visible = true;
        }
        else {
            this.#overview.dataset.visible = false;
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
    // A field with many options with one that yields no,0,false as value
    _conditionField;

    constructor(el, properties, name) {
        super(el, properties, name);

        // Add class
        this._repeatablePanel.classList.add(`panel-repeatable-panel__conditional`);

        // Add class
        this._repeatablePanel.classList.add(`panel-repeatable-panel__${name}`);

        this._conditionField = this._repeatablePanel.closest(`.field-${name}`).querySelector(`.field-${name}-selection`);
        if (this._conditionField) {
            const radios = this._conditionField.querySelectorAll(`input[name="${name}-selection"]`);

            // register click on radios
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    const entry = this._repeatablePanel.querySelector(':scope>[data-repeatable]:not(.saved)')

                    if (isNo(radio)) {
                        // hide repeatable panel
                        this._repeatablePanel.style.display = 'none';
                        // Show wizard buttons
                        super._toggleWizardButtons(true);

                        // TODO Clear all edits?
                        if (entry) {
                            this._clearFields(entry);
                        }

                        // prevent validation
                        this._repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
                    }
                    else {
                        // show repeatable panel
                        this._repeatablePanel.style.display = 'block';
                        // enable validation
                        this._repeatablePanel.closest(`.field-${name}-options-content`).disabled = false;

                        if (entry) {
                            // Edit first entry if any
                            this._toggleEditMode(entry, true);
                        }
                    }
                });
            });
            // prevent validation
            this._repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
        }
    }

    _entryModified(entry) {
        super._entryModified(entry);

        this._updateCondition();
    }

    _updateCondition() {
        const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');
        if (savedEntries.length > 0) {
            // Hide question
            this._conditionField.setAttribute('data-visible', false);
        }
        else {
            // reset selection & condition field
            const radios = this._conditionField.querySelectorAll('input[type="radio"]');

            radios?.forEach(radio => { radio.checked = false; });
            // Show condition field
            this._conditionField.setAttribute('data-visible', true);
            // hide repeatable panel
            this._repeatablePanel.style.display = 'none';
        }
    }

    _renderOverview() {
        super._renderOverview();

        this._updateCondition();
    }
}