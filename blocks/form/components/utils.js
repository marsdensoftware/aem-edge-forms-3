import { i18n } from '../../../i18n/index.js';

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

export function onPageLoad(callback) {
    if (document.readyState === 'complete') {
        // Page is already fully loaded
        callback();
    } else {
        // Wait for the full load event
        window.addEventListener('load', callback);
    }
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