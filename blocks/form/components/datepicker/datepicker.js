export function handleTabNavigation(panel, index) {
    const tabs = panel.querySelectorAll(':scope > fieldset');
    const navItems = panel.querySelectorAll(':scope > .navitems > li');
    tabs.forEach((otherTab, i) => {
        var _a, _b;
        if (i === index) {
            otherTab.classList.add('formtab-current');
            (_a = navItems[i]) === null || _a === void 0 ? void 0 : _a.classList.add('navitem-current');
        }
        else {
            otherTab.classList.remove('formtab-current');
            (_b = navItems[i]) === null || _b === void 0 ? void 0 : _b.classList.remove('navitem-current');
        }
    });
}
export default function decorate(panel, model) {
    const currentYear = new Date().getFullYear();
    const defaultYearMin = currentYear - 45;
    const defaultYearMax = currentYear;
    let yearMax = defaultYearMax;
    let yearMin = defaultYearMin;

    try {
        yearMin = parseInt(model.properties.yearMin);
    }
    catch (e) { }

    try {
        yearMax = parseInt(model.properties.yearMax);
    }
    catch (e) { }

    if ('' + yearMin.charAt(0) == '+' || '' + yearMin.charAt(0) == '-') {
        yearMin = currentYear + parseInt(yearMin)
    }

    if ('' + yearMax.charAt(0) == '+' || '' + yearMax.charAt(0) == '-') {
        yearMax = currentYear + parseInt(yearMax)
    }

    // Populate year if empty
    const yearDD = panel.querySelector('[name="year"]');
    if (yearDD.options.length === 0) {
        for (let year = yearMin; year <= yearMax; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearDD.appendChild(option);
        }
    }

    // Populate months if empty
    const monthDD = panel.querySelector('[name="month"]');
    if (monthDD.options.length === 0) {
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            monthDD.appendChild(option);
        }
    }

    return panel;
}
