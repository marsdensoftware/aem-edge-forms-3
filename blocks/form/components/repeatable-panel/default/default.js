export class RepeatablePanel {
    constructor(repeatablePanel) {
        this._repeatablePanel = repeatablePanel;
        this._repeatablePanel.classList.add('panel-repeatable-panel');

        // create overview
        const div = document.createElement('div');
        div.classList.add('overview');

        this._repeatablePanel.prepend(div);

        const form = this._repeatablePanel.closest('form');
        this._renderOverview();

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

        this.#toggleWizardButtons(entry, !visible);
        this.#ensureButtonBar(entry);
    }

    #toggleWizardButtons(el, visible) {
        const wizardButtonWrapper = el.closest('.wizard')?.querySelector('.wizard-button-wrapper');
        if (visible) {
            // show wizard buttons
            wizardButtonWrapper?.style.display = 'block';
        }
        else {
            // hide wizard buttons
            wizardButtonWrapper?.style.display = 'none';
        }
    }

    #ensureButtonBar(entry) {
        let buttonBar = entry.querySelector('.button-bar');
        if (buttonBar) {
            return;
        }

        buttonBar = document.createElement('div');
        buttonBar.className = 'button-bar';
        entry.appendChild(buttonBar);

        const saveBtn = this.#createButton('Save');
        saveBtn.classList.add('btn-save')

        saveBtn.addEventListener('click', () => {
            // Mark as saved
            entry.classList.add('saved');
            this._toggleEditMode(renderer, entry, false);

            this._renderOverview(renderer, panel);
        });

        const cancelBtn = this.#createButton('Cancel');
        cancelBtn.classList.add('btn-cancel', 'link');

        cancelBtn.addEventListener('click', () => {
            // TODO: If new added one then remove. 
            // TODO: If saved one then reset changes.
            // if first one hide
            if (entry.dataset.index == 0) {
                this._toggleEditMode(entry, false);
            }

            this._renderOverview(panel);
        });

        buttonBar.appendChild(saveBtn);
        buttonBar.appendChild(cancelBtn);
    }

    #entryToReadableString(entry) {
        const inputs = entry.querySelectorAll('input, select, textarea');
        const entries = Array.from(inputs).map(input => {
            let value;
            let name = input.name;
            let label = '';
            const type = input.type;

            if (input.tagName === 'SELECT') {
                value = input.options[input.selectedIndex]?.text.trim() || '';
            }
            else if (type === 'checkbox' || type === 'radio') {
                value = input.checked ? input.parentElement.querySelector('label').textContent.trim() : '';
                label = input.closest('fieldset')?.querySelector('legend').textContent.trim();
            } else {
                value = input.value;
            }

            // Find associated label
            if (input.id && value) {
                if (type != 'radio' && type != 'checkbox') {
                    const associated = entry.querySelector(`label[for="${input.id}"]`);
                    if (associated) label = associated.textContent.trim();
                }

                const result = document.createElement('div');
                result.classList.add(`repeatable-entry__${name}`);
                result.innerHTML = `${label || input.name || input.id || 'unnamed'}: ${value}`;

                return result;
            }
            else {
                return undefined;
            }
        }).filter(e => e != undefined);

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

    #createButton(label) {
        const button = document.createElement('button');
        button.classList.add('button');
        button.type = 'button';
        const text = document.createElement('span');
        text.textContent = label;
        button.append(document.createElement('i'), text);

        return button;
    }
}