import { EducationRepeatable } from "./educationrepeatable.js";

export default async function decorate(el) {

    const repeatablePanel = el.querySelector('.repeat-wrapper');

    const obj = new EducationRepeatable(repeatablePanel);
    obj.init();

    return el;
}