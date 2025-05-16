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
}

function addButtonCancel(panel) {
    const btn = createButton('Cancel', 'cancel');

    panel.querySelector('.repeat-actions')?.append(btn);

    btn.addEventListener('click', () => {
        alert('Cancel');
    });
}

function renderOverview(panel, entries) {
    const div = document.createElement('<div>');

    entries.forEach((el, index) => {
        div.innerHTML += `<p>${el.dataset.id}-${index}</p>`;
    });

    panel.prepend(div);
}

export default function decorate(panel, field, container) {

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

    panel.closest('form')?.addEventListener('item:add', (event) => {
        const entry = panel.querySelector(event.detail.item.id);
        toggleEditMode(entry, true);
    });

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

    renderOverview(entries);

    if (entries.length == 1) {
        // entry edit mode
        toggleEditMode(entries[0], true);
    }

    return panel;
}
