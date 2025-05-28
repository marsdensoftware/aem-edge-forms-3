import { EducationRepeatable } from "./educationrepeatable.js";

function onElementAdded(el, callback) {
    if (el.isConnected) {
        callback(el);
        return;
    }

    const observer = new MutationObserver(() => {
        if (el.isConnected) {
            observer.disconnect();
            callback(el);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

export default async function decorate(el) {

    onElementAdded(el, () => {
        const repeatablePanel = el.querySelector('.repeat-wrapper');
        const obj = new EducationRepeatable(repeatablePanel);

        obj.init();
    });

    return el;
}