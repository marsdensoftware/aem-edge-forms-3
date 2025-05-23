function entryToReadableString(entry) {
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

export default function renderEntry(entry) {
    const readable = entryToReadableString(entry);

    const result = document.createElement('div');
    result.classList.add('education-entry', 'repeatable-entry');
    result.dataset.id = entry.dataset.id;

    const editLink = document.createElement('a');
    editLink.classList.add('repeatable-entry__edit');
    editLink.textContent = 'Edit';
    result.append(editLink);

    editLink.addEventListener('click', () => {
        alert('Edit entry: ' + result.dataset.id);
    });

    readable.forEach(r => {
        result.append(r);
    });

    return result;
}

export function init(repeatablePanel) {
    // Add class for education
    repeatablePanel.classList.add('panel-repeatable-panel__education');

    const educationRadioGroup = repeatablePanel.closest('form')?.querySelector('.field-education-selection');
    if (educationRadioGroup) {
        const radios = educationRadioGroup.querySelectorAll('input[type="radio"]');

        // register click on radios
        radios?.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value == 'yes') {
                    // show repeatable panel
                    repeatablePanel.style.display = 'block';
                    const el = repeatablePanel.querySelector(':scope>[data-repeatable]')

                    // Edit first entry
                    const event = new CustomEvent('rp:edit', {
                        detail: { item: el },
                        bubbles: false,
                    });
                    repeatablePanel.dispatchEvent(event);
                }
                if (radio.value == 'no') {
                    // hide repeatable panel
                    repeatablePanel.style.display = 'none';
                }
            });
        });

        repeatablePanel.addEventListener('rp:updated', () => {
            // Add custom logic here
            const savedEntries = repeatablePanel.querySelectorAll('[data-repeatable].saved');
            if (savedEntries.length > 0) {
                // Hide question
                educationRadioGroup.setAttribute('data-visible', false);
            }
            else {
                // reset selection & show question
                radios?.forEach(radio => { radio.checked = false; });
                // Show question
                educationRadioGroup.setAttribute('data-visible', true);
                // hide repeatable panel
                repeatablePanel.style.display = 'none';
            }
        });

    }
}
