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

export function isNo(field) {
    const value = field.value;
    if (!value) return true;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'no' || normalized === 'false' || normalized === '0';
    }
}