

function createButton(label, icon) {
    const button = document.createElement('button');
    button.className = `btn-${icon}`;
    button.type = 'button';
    const text = document.createElement('span');
    text.textContent = label;
    button.append(document.createElement('i'), text);

    return button;
}

function addButtonSave(panel) {
    const btn = createButton('Save', 'save');

    panel.querySelector('.repeat-actions')?.append(btn);

    return btn;
}

function addButtonCancel(panel) {
    const btn = createButton('Cancel', 'cancel');

    panel.querySelector('.repeat-actions')?.append(btn);

    return btn;
}

function renderOverview(panel) {
    const entries = panel.querySelectorAll('[data-repeatable]');
                        
    if (entries.length > 0) {
        if (entries.length == 1) {
            // entry edit mode
            toggleEditMode(entries[0], true);
        }

        const div = panel.querySelector('.overview');

        entries.forEach((el, index) => {
            div.innerHTML += `<p>${el.dataset.id}-${index}</p>`;
        });
    }
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
                        console.log('Form is available:');
                        const panel = el.closest('.repeat-wrapper');
                        panel.classList.add('panel-repeatable-panel');

                        const form = panel.closest('form');

                        form.addEventListener('item:add', (event) => {
                            // Event does not carry information about the entry added, so select the last one from the list
                            const entry = panel.querySelector(':scope [data-repeatable]:last-of-type');
                            toggleEditMode(entry, true);
                        });

                        const saveBtn = addButtonSave(panel);
                        saveBtn.addEventListener('click', () => {
                            alert('Saving');
                            const entry = panel.querySelector('[data-repeatable].edit-mode');
                            toggleEditMode(entry, false);
                            
                            renderOverview(panel);
                        });

                        const cancelBtn = addButtonCancel(panel);
                        cancelBtn.addEventListener('click', () => {
                            alert('Cancelling');
                            const entry = panel.querySelector('[data-repeatable].edit-mode');
                            toggleEditMode(entry, false);
                            // TODO: If new one then remove. If saved one then reset changes.
                            entry.remove();
                            
                            renderOverview(panel);
                        });

                        // create overview
                        const div = document.createElement('div');
                        div.classList.add('overview');

                        panel.prepend(div);

                        renderOverview(panel);

                        // Optional: Stop observing if only needed once
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

    function toggleEditMode(entry, visible) {
        const panel = entry.closest('.panel-repeatable-panel');
        if (visible) {
            panel.classList.add('edit-mode');
            entry.classList.add('edit-mode');
        }
        else {
            panel.classList.remove('edit-mode');
            entry.classList.remove('edit-mode');
        }
    }

    return el;
}
