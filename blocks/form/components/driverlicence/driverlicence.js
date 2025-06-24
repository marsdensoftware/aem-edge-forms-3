import { DriverLicenceRepeatable } from "./repeatable.js";
import { onElementAdded } from '../utils.js'

export default async function decorate(el, fd) {

    onElementAdded(el).then((connectedEl) => {
        const obj = new DriverLicenceRepeatable(connectedEl, fd.properties);
        obj.init();
    });

    return el;
}