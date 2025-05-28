export function onElementAdded(el, callback) {
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