import { loadCSS } from '../../../../scripts/aem.js'

function createButton(label) {
    const button = document.createElement('button');
    button.classList.add('button');
    button.type = 'button';
    const text = document.createElement('span');
    text.textContent = label;
    button.append(document.createElement('i'), text);

    return button;
}

async function renderOverview(renderer, panel) {

    const savedEntries = panel.querySelectorAll('[data-repeatable].saved');

    const overview = panel.querySelector('.overview');
    // For now reset everything. Later implement a more efficient/targeted approach;
    if (savedEntries.length > 0 && renderer && renderer.default) {
        const content = document.createElement('div');
        content.classList.add('repeatable-entries')

        savedEntries.forEach((entry) => {
            content.append(renderer.default(entry));
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

    // trigger event that rendering updated
    const event = new CustomEvent('rp:updated', {
        detail: {},
        bubbles: false,
    });
    panel.dispatchEvent(event);

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

    const saveBtn = createButton('Save');
    saveBtn.classList.add('btn-save')
    
    saveBtn.addEventListener('click', () => {
        // Mark as saved
        entry.classList.add('saved');
        toggleEditMode(renderer, entry, false);

        renderOverview(renderer, panel);
    });

    const cancelBtn = createButton('Cancel');
    cancelBtn.classList.add('btn-cancel', 'link');
    
    cancelBtn.addEventListener('click', () => {
        // TODO: If new added one then remove. 
        // TODO: If saved one then reset changes.
        // if first one hide
        if (entry.dataset.index == 0) {
            toggleEditMode(renderer, entry, false);
        }

        renderOverview(renderer, panel);
    });

    buttonBar.appendChild(saveBtn);
    buttonBar.appendChild(cancelBtn);
}

function toggleWizardButtons(el, visible) {
    const wizardButtonWrapper = el.closest('.wizard')?.querySelector('.wizard-button-wrapper');
    if (visible) {
        // show wizard buttons
        wizardButtonWrapper.style.display = 'block';
    }
    else {
        // hide wizard buttons
        wizardButtonWrapper.style.display = 'none';
    }
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

    toggleWizardButtons(entry, !visible);

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
                    if (targetNode.classList.contains('edit-mode')) {
                        // Do nothing
                        return;
                    }

                    const newValue = targetNode.getAttribute('data-block-status');
                    if (newValue === 'loaded') {
                        // Implement repeatable panel customisations

                        const panel = el.closest('.repeat-wrapper');
                        panel.classList.add('panel-repeatable-panel');

                        // create overview
                        const div = document.createElement('div');
                        div.classList.add('overview');

                        panel.prepend(div);

                        const form = panel.closest('form');

                        const rendererName = field.properties.renderer || 'default';
                        // TODO Turn this into classes extending 
                        // DefaultRenderer being the base class
                        // EducationRenderer will extend fro DefaultRenderer
                        // load js & css
                        const renderer = import(`./renderers/${rendererName}.js`)
                        loadCSS(`${window.hlx.codeBasePath}/blocks/form/components/repeatable-panel/renderers/${rendererName}.css`)

                        renderer.then((r) => {
                            r.init && r.init(panel);
                            renderOverview(r, panel);
                        })

                        panel.addEventListener('rp:edit', (event) => {
                            renderer.then((r) => {
                                const el = event.detail.item;
                                toggleEditMode(r, el, true);
                            })

                        });

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
