import { validateContainer } from '../../wizard/wizard.js'

export class RepeatablePanel {
    constructor(repeatablePanel) {
        this._repeatablePanel = repeatablePanel;
        this._repeatablePanel.classList.add('panel-repeatable-panel');

        // create overview
        const div = document.createElement('div');
        div.classList.add('overview');

        this._repeatablePanel.prepend(div);

        const form = this._repeatablePanel.closest('form');

        form.addEventListener('item:add', (event) => {
            const added = event.detail.item.el;
            this._toggleEditMode(added, true);
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
                result[name] = { 'value': value, 'displayValue': displayValue };
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

        const overview = this._repeatablePanel.querySelector('.overview');
        // For now reset everything. Later implement a more efficient/targeted approach;
        if (savedEntries.length > 0) {
            const content = document.createElement('div');
            content.classList.add('repeatable-entries')

            savedEntries.forEach((entry) => {
                content.append(this._renderEntry(entry));
            });

            overview.replaceWith(content);
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