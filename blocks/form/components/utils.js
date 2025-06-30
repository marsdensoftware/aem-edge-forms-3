import { i18n } from '../../../i18n/index.js';

export class DefaultFieldConverter {

    constructor() {
    }

    convert(entry) {
        function getLabelText(input) {
            // First check text inside label
            let label = input.parentElement.querySelector('label>.text');
            if (!label) {
                // Fallback to label
                label = input.parentElement.querySelector('label');
            }

            return label.textContent.trim()
        }

        const inputs = entry.querySelectorAll('input, select, textarea');
        const result = {};

        inputs.forEach(input => {
            const value = input.value;;
            let displayValue = value;
            const name = input.name;

            const type = input.type;

            if (input.tagName === 'SELECT') {
                displayValue = input.options[input.selectedIndex]?.text.trim() || '';
            }
            else if (type === 'checkbox' || type === 'radio') {
                // Ignore not checked
                if (!input.checked) {
                    return;
                }

                displayValue = input.checked ? getLabelText(input) : '';
            }

            if (value) {
                if (result[name]) {
                    // multi values
                    const e = result[name];
                    if (!e.values) {
                        e.values = [];
                        e.values.push(e.value);
                        delete e.value;
                        e.displayValues = [];
                        e.displayValues.push(e.displayValue);
                        delete e.displayValue;
                    }
                    e.values.push(value);
                    e.displayValues.push(displayValue);
                }
                else {
                    result[name] = { 'value': value, 'displayValue': displayValue };
                }
            }
        });

        return result;
    }
}

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

export function onElementsAddedByClassName(className, callback) {
    // Track elements already seen to avoid duplicates
    const seen = new WeakSet();

    // Call callback on any existing matching elements
    document.querySelectorAll(`.${className}`).forEach(el => {
        if (!seen.has(el)) {
            seen.add(el);
            callback(el);
        }
    });

    // Set up the MutationObserver
    const observer = new MutationObserver(mutationsList => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        // Check if node matches or contains matching elements
                        if (node.classList.contains(className) && !seen.has(node)) {
                            seen.add(node);
                            callback(node);
                        }
                        node.querySelectorAll?.(`.${className}`)?.forEach(el => {
                            if (!seen.has(el)) {
                                seen.add(el);
                                callback(el);
                            }
                        });
                    }
                });
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}


export function getDurationString(startMonthStr, startYearStr, endMonthStr, endYearStr) {
    const startMonth = parseInt(startMonthStr, 10);
    const startYear = parseInt(startYearStr, 10);
    const endMonth = parseInt(endMonthStr, 10);
    const endYear = parseInt(endYearStr, 10);

    const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const yearStr = years > 0 ? `${years} ${i18n('year')}${years > 1 ? 's' : ''}` : '';
    const monthStr = months > 0 ? `${months} ${i18n('month')}${months > 1 ? 's' : ''}` : '';

    if (yearStr && monthStr) return `${yearStr} ${monthStr}`;
    return yearStr || monthStr || `0 ${i18n('months')}`;
}


export function isNo(field) {
    const value = field.value;
    if (!value) return true;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === 'no' || normalized === 'false' || normalized === '0';
    }
}