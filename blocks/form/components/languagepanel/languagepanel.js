import { LanguageRepeatable } from './languagerepeatable.js';
import { onElementAdded } from '../utils.js'

export default async function decorate(el) {

    onElementAdded(el, () => {
        const repeatablePanel = el.querySelector('.repeat-wrapper');
        const obj = new LanguageRepeatable(repeatablePanel);

        obj.init();
    });

    return el;
}