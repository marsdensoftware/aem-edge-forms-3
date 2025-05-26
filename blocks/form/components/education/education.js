import { EducationRepeatable } from "./educationrepeatable.js";

function onElementAdded(el) {
    return new Promise((resolve) => {
        if (el.isConnected) {
            resolve(el);
            return;
        }

        const observer = new MutationObserver(() => {
            if (el.isConnected) {
                observer.disconnect();
                resolve(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

export default async function decorate(el) {

    onElementAdded(el).then(() => {
        const repeatablePanel = el.querySelector('.repeat-wrapper');
        const obj = new EducationRepeatable(repeatablePanel);

        obj.init();
    });

    return el;
}