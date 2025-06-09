import { en } from './en.js';

const translations = { en };

// Default language
let currentLang = 'en';

export function setLang(lang) {
    if (translations[lang]) {
        currentLang = lang;
    }
}

export function i18n(key, vars = {}) {
    const translation = translations[currentLang][key] || key;
    return translation.replace(/\{(\w+)\}/g, (_, v) => vars[v] || '');
}
