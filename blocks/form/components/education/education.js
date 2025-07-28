import { EducationRepeatable } from "./repeatable.js";
import { onElementAdded } from '../utils.js'

export default async function decorate(el, fd) {

  onElementAdded(el).then((connectedEl) => {
    if (!connectedEl.querySelector('.repeat-wrapper')) {
      return;
    }
    const obj = new EducationRepeatable(connectedEl, fd.properties);
    obj.init();
  });

  return el;
}