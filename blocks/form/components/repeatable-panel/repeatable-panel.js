import { RepeatablePanelFactory } from './factory.js'

export default async function decorate(el, field) {

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
                        RepeatablePanelFactory.createRepeatablePanel(el, field);

                        // Stop observing as only needed once
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
