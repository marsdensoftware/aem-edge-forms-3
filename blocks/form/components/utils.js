export function onElementAdded(el) {
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