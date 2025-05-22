function entryToReadableString(entry) {
    const inputs = entry.querySelectorAll('input, select, textarea');
    const entries = Array.from(inputs).map(input => {
        let value;

        if (input.tagName === 'SELECT') {
            value = input.options[input.selectedIndex]?.text.trim() || '';
        }
        else if (input.type === 'checkbox' || input.type === 'radio') {
            value = input.checked ? input.value : '';
        } else {
            value = input.value;
        }

        // Find associated label
        let label = '';
        if (input.id && value) {
            const associated = entry.querySelector(`label[for="${input.id}"]`);
            if (associated) label = associated.textContent.trim();

            return `<li>${label || input.name || input.id || 'unnamed'}: ${value}</li>`;
        }
        else {
            return '';
        }
    }).filter(line => line.includes(': ') && line.split(': ')[1] !== '');

    return '<ul>' + entries.join('') + '</ul>';
}

export default function renderEntry(entry) {
    const readable = entryToReadableString(entry);

    return `<div class="education-entry repeatable-entry" data-id="${entry.dataset.id}">${readable}</div>`;
}

export function init(repeatablePanel) {
    // Add class for education
    repeatablePanel.classList.add('panel-repeatable-panel__education');

    const educationRadioGroup = repeatablePanel.closest('form')?.querySelector('.field-education-selection');
    if (educationRadioGroup) {
        const radios = educationRadioGroup.querySelectorAll('input[type="radio"]');

        // regsiter click on radios
        radios?.forEach(radio => {
            radio.addEventListener('change', () => {
                if (radio.value == 'yes') {
                    // show repeatable panel
                    repeatablePanel.style.display = 'block';
                }
                if (radio.value == 'no') {
                    // hide repeatable panel
                    repeatablePanel.style.display = 'none';
                }
            });

        });

        repeatablePanel.addEventListener('updated', () => {
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
