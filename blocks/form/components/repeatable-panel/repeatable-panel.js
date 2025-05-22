

function createButton(label, icon) {
    const button = document.createElement('button');
    button.className = `btn-${icon}`;
    button.type = 'button';
    const text = document.createElement('span');
    text.textContent = label;
    button.append(document.createElement('i'), text);

    return button;
}

async function renderOverview(renderer, panel) {

    const savedEntries = panel.querySelectorAll('[data-repeatable].saved');

    const div = panel.querySelector('.overview');
    // For now reset everything. Later implement a more efficient/targeted approach;
    if (savedEntries.length > 0 && renderer && renderer.renderEntry) {
        let content = '<ol>';

        savedEntries.forEach((entry) => {
            content += renderer.renderEntry(entry);
        });

        content += '</ol>';

        div.innerHTML = content;
    }

    // unsaved
    const unsavedEntries = panel.querySelectorAll('[data-repeatable]:not(.saved)');
    unsavedEntries.forEach(el => {
        toggleEditMode(renderer, el, true);
    });

}

function ensureButtonBar(renderer, entry) {
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
        toggleEditMode(renderer, entry, false);

        renderOverview(renderer, panel);
    });

    const cancelBtn = createButton('Cancel', 'cancel');
    cancelBtn.addEventListener('click', () => {
        toggleEditMode(renderer, entry, false);
        // TODO: If new one then remove. 
        // If saved one then reset changes.
        entry.remove();

        renderOverview(renderer, panel);
    });

    buttonBar.appendChild(saveBtn);
    buttonBar.appendChild(cancelBtn);
}

function toggleEditMode(renderer, entry, visible) {
    const panel = entry.closest('.panel-repeatable-panel');
    if (visible) {
        entry.classList.add('current');
        panel.classList.add('editing');
    }
    else {
        entry.classList.remove('current');
        panel.classList.remove('editing');
    }

    ensureButtonBar(renderer, entry);
}

export default async function decorate(el, field, container) {

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

                        // create overview
                        const div = document.createElement('div');
                        div.classList.add('overview');

                        panel.prepend(div);

                        const form = panel.closest('form');

                        const rendererName = field.properties.renderer || 'default';
                        const renderer = import(`./renderers/${rendererName}.js`)

                        renderer.then((r) => {
                            r.hook && r.hook(panel);
                            renderOverview(r, panel);
                        })

                        form.addEventListener('item:add', (event) => {
                            renderer.then((r) => {
                                const added = event.detail.item.el;
                                toggleEditMode(r, added, true);
                            })

                        });

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
