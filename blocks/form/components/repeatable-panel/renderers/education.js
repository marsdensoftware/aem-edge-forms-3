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

export default function render(entry) {
    const readable = entryToReadableString(entry);

    return `<li><p>${entry.dataset.id}</p>${readable}</li>`;
}