import { DriverLicenceRepeatable } from "./repeatable.js";
import { onElementAdded } from '../utils.js'

export default async function decorate(el) {
    el.classList.add();
    onElementAdded(el).then((connectedEl) => {
        const repeatablePanel = connectedEl.querySelector('.repeat-wrapper');
        if (repeatablePanel) {
            const obj = new DriverLicenceRepeatable(repeatablePanel);
            obj.init();
        }
    });

    return el;
}