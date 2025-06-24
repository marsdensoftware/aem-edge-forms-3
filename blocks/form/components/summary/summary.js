import { onElementAdded } from '../utils.js'
import { Summarizers } from './summarizers.js'

export default function decorate(el, field) {
    const { summaryType } = field.properties;

    el.classList.add(`summary--${summaryType}`);

    onElementAdded(el).then((connectedEl) => {
        // Populate
        const summarizer = Summarizers[summaryType];
        if (typeof summarizer === 'function') {
            summarizer(connectedEl);
        }

    });

    return el;
}