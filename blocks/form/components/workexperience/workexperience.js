import { WorkExperienceRepeatable } from "./repeatable.js";
import { onElementAdded } from '../utils.js'

export default async function decorate(el) {

    onElementAdded(el).then((connectedEl) => {
        const repeatablePanel = connectedEl.querySelector('.repeat-wrapper');
        const obj = new WorkExperienceRepeatable(repeatablePanel);
        obj.init();
    });

    return el;
}