import { LanguagePanelRepeatable } from './languagepanelrepeatable.js';
import { onElementAdded } from '../utils.js'

export default async function decorate(el) {

    onElementAdded(el, () => {
        const repeatablePanel = el.querySelector('.repeat-wrapper');
        const obj = new LanguagePanelRepeatable(repeatablePanel);

        obj.init();
    });

    return el;
}