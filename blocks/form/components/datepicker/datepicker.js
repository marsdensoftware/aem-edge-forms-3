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
    function parseNumber(str, defaultValue = 0) {
        const num = Number(str);
        return isNaN(num) ? defaultValue : num;
    }
    
    const currentYear = new Date().getFullYear();
    const defaultYearMin = currentYear - 45;
    const defaultYearMax = currentYear;
    
    let yearMax = parseNumber(model.properties.yearMax,defaultYearMax);
    let yearMin = parseNumber(model.properties.yearMin,defaultYearMin);
    
    let yearMinS = model.properties.yearMin;
    let yearMaxS = model.properties.yearMax;

    if (yearMinS.charAt(0) == '+' || '' + yearMinS.charAt(0) == '-') {
        yearMin = currentYear + parseInt(yearMinS)
    }

    if (yearMaxS.charAt(0) == '+' || yearMaxS.charAt(0) == '-') {
        yearMax = currentYear + parseInt(yearMaxS)
    }

    // Populate year if empty
    const yearDD = panel.querySelector('[name="year"]');
    let options = yearDD.querySelectorAll('option:not([disabled])');
    if (options.length === 0) {
        for (let year = yearMin; year <= yearMax; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearDD.appendChild(option);
        }
    }

    // Populate months if empty
    const monthDD = panel.querySelector('[name="month"]');
    options = monthDD.querySelectorAll('option:not([disabled])');
    if (options.length === 0) {
        for (let month = 1; month <= 12; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            monthDD.appendChild(option);
        }
    }

    return panel;
}
