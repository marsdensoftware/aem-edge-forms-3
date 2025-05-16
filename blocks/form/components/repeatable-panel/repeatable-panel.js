

function createButton(label, icon) {
    const button = document.createElement('button');
    button.className = `btn-${icon}`;
    button.type = 'button';
    const text = document.createElement('span');
    text.textContent = label;
    button.append(document.createElement('i'), text);

    button.style.display = 'none';

    return button;
}

function addButtonSave(panel) {
    const btn = createButton('Save', 'save');

    panel.querySelector('.repeat-actions')?.append(btn);

    btn.addEventListener('click', () => {
        alert('Save');
    });

    return btn;
}

function addButtonCancel(panel) {
    const btn = createButton('Cancel', 'cancel');

    panel.querySelector('.repeat-actions')?.append(btn);

    btn.addEventListener('click', () => {
        alert('Cancel');
    });

    return btn;
}

function renderOverview(panel, entries) {
    const div = document.createElement('div');

    entries.forEach((el, index) => {
        div.innerHTML += `<p>${el.dataset.id}-${index}</p>`;
    });

    panel.prepend(div);
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
                        console.log('Form is available:', form);

                        panel.closest('form')?.addEventListener('item:add', (event) => {
                            const entry = panel.querySelector(event.detail.item.id);
                            toggleEditMode(entry, true);
                        });
                        
                        const panel = el.closest('.repeat-wrapper');

                        panel.classList.add('panel-repeatable-panel');

                        const saveBtn = addButtonSave(panel);
                        saveBtn.addEventListener('click', () => {
                            alert('Saving');
                            const entry = panel.querySelector('[data-repeatable].edit-mode');
                            toggleEditMode(entry, false);
                        });

                        const cancelBtn = addButtonCancel(panel);
                        cancelBtn.addEventListener('click', () => {
                            alert('Cancelling');
                            const entry = panel.querySelector('[data-repeatable].edit-mode');
                            toggleEditMode(entry, false);
                            // TODO: If new one then remove. If saved one then reset changes.
                            entry.remove();
                        });

                        const entries = panel.querySelectorAll('[data-repeatable]');

                        if (entries.length > 0) {
                            renderOverview(panel, entries);

                            if (entries.length == 1) {
                                // entry edit mode
                                toggleEditMode(entries[0], true);
                            }
                        }

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
        if (visible) {
            panel.classList.add('edit-mode');
            entry.classList.add('edit-mode');
        }
        else {
            panel.classList.remove('edit-mode');
            entry.classList.remove('edit-mode');
        }
    }



    return panel;
}
