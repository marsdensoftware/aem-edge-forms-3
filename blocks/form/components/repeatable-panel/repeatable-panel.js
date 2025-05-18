

function createButton(label, icon) {
    const button = document.createElement('button');
    button.className = `btn-${icon}`;
    button.type = 'button';
    const text = document.createElement('span');
    text.textContent = label;
    button.append(document.createElement('i'), text);

    return button;
}

function entryToReadableString(entry) {
    const inputs = entry.querySelectorAll('input, select, textarea');
    const entries = Array.from(inputs).map(input => {
        let value;

        if (input.type === 'checkbox' || input.type === 'radio') {
            value = input.checked ? input.value : '';
        } else {
            value = input.value;
        }

        // Find associated label
        let label = '';
        if (input.id) {
            const associated = el.querySelector(`label[for="${input.id}"]`);
            if (associated) label = associated.textContent.trim();
        }

        return `${label || input.name || input.id || 'unnamed'}: ${value}`;
    }).filter(line => line.includes(': ') && line.split(': ')[1] !== '');

    return entries.join('\n');
}

function renderOverview(panel) {
    const savedEntries = panel.querySelectorAll('[data-repeatable].saved');

    const div = panel.querySelector('.overview');
    // For now reset everything. Later implement a more efficient/targeted approach
    div.innerHTML = '';
    if (savedEntries.length > 0) {
        div.innerHTML = '<ol>';

        savedEntries.forEach((entry, index) => {
            const readable = entryToReadableString(entry);
            div.innerHTML += `<li><div>${el.dataset.id}: ${readable}</div></li>`;
        });

        div.innerHTML += '</ol>';
    }

    // unsaved
    const unsavedEntries = panel.querySelectorAll('[data-repeatable]:not(.saved)');
    unsavedEntries.forEach(el => {
        toggleEditMode(el, true);
    });

}

function ensureButtonBar(entry) {
    let buttonBar = entry.querySelector('.button-bar');
    if (buttonBar) {
        return;
    }

    const panel = entry.closest('.panel-repeatable-panel');

    buttonBar = document.createElement('div');
    buttonBar.className = 'button-bar';
    entry.appendChild(buttonBar);

    const saveBtn = createButton('Save', 'save');
    saveBtn.addEventListener('click', () => {
        // Mark as saved
        entry.classList.add('saved');
        toggleEditMode(entry, false);

        renderOverview(panel);
    });

    const cancelBtn = createButton('Cancel', 'cancel');
    cancelBtn.addEventListener('click', () => {
        toggleEditMode(entry, false);
        // TODO: If new one then remove. 
        // If saved one then reset changes.
        entry.remove();

        renderOverview(panel);
    });

    buttonBar.appendChild(saveBtn);
    buttonBar.appendChild(cancelBtn);
}

function toggleEditMode(entry, visible) {
    const panel = entry.closest('.panel-repeatable-panel');
    if (visible) {
        entry.classList.add('current');
        panel.classList.add('editing');
    }
    else {
        entry.classList.remove('current');
        panel.classList.remove('editing');
    }

    ensureButtonBar(entry);
}

export default function decorate(el, field, container) {

    const targetNode = document.querySelector('.form.block');

    if (targetNode) {
        // Create a MutationObserver instance
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'data-block-status'
                ) {
                    const newValue = targetNode.getAttribute('data-block-status');
                    if (newValue === 'loaded') {
                        console.log('Form is loaded:');
                        const panel = el.closest('.repeat-wrapper');
                        panel.classList.add('panel-repeatable-panel');

                        const form = panel.closest('form');

                        // TODO register on warpper repeatable panel. Change ootb repeat.js to trigger event on wrapper repeatable panel instead of form
                        form.addEventListener('item:add', (event) => {
                            // Event does not carry information about the entry added, so select the last one from the list
                            // Todo update repeat.js ootb code to carry the element added in the event
                            const entry = panel.querySelector(':scope [data-repeatable]:last-of-type');

                            toggleEditMode(entry, true);
                        });

                        // create overview
                        const div = document.createElement('div');
                        div.classList.add('overview');

                        panel.prepend(div);

                        renderOverview(panel);

                        // Optional: Stop observing as only needed once
                        observer.disconnect();
                    }
                }
            }
        });

        // Configuration of the observer:
        const config = { attributes: true, attributeFilter: ['data-block-status'] };

        // Start observing the target node
        observer.observe(targetNode, config);
    }

    return el;
}
