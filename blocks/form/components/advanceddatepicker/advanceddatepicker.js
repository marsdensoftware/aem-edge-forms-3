class AdvancedDatepickerField {
    constructor(panel, model) {
        this.panel = panel;
        this.model = model;
        this.currentYear = new Date().getFullYear();
        this.defaultYearMin = this.currentYear - 20;
        this.defaultYearMax = this.currentYear;

        const dds = panel.querySelectorAll(':scope>.drop-down-wrapper');
        this.monthDD = dds[0];
        this.yearDD = dds[1];

        this.init();
    }

    parseNumber(str, defaultValue = 0) {
        const num = Number(str);
        return isNaN(num) ? defaultValue : num;
    }

    plusMinus(str) {
        return str && (str.charAt(0) === '+' || str.charAt(0) === '-');
    }

    init() {
        this.panel.classList.add('advanceddatepicker');
        this.panel.querySelector('legend')?.classList.add('p-large');
        this.panel.dataset.yearMax = this.model.properties.yearMax;
        this.panel.dataset.yearMin = this.model.properties.yearMin;
        this.panel.dataset.required = this.yearDD.required || this.monthDD.required;

        let yearMinS = this.model.properties.yearMin;
        let yearMaxS = this.model.properties.yearMax;

        let yearMin = this.parseNumber(yearMinS, this.defaultYearMin);
        let yearMax = this.parseNumber(yearMaxS, this.defaultYearMax);

        if (this.plusMinus(yearMinS)) {
            yearMin = this.currentYear + parseInt(yearMinS);
        }

        if (this.plusMinus(yearMaxS)) {
            yearMax = this.currentYear + parseInt(yearMaxS);
        }

        this.populateYears(yearMin, yearMax);
        this.populateMonths();
    }

    populateYears(yearMin, yearMax) {
        const options = this.yearDD.querySelectorAll('option:not([disabled])');
        if (options.length === 0) {
            for (let year = yearMin; year <= yearMax; year++) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                this.yearDD.appendChild(option);
            }
        }
    }

    populateMonths() {
        const options = this.monthDD.querySelectorAll('option:not([disabled])');
        if (options.length === 0) {
            for (let month = 1; month <= 12; month++) {
                const option = document.createElement('option');
                option.value = month;
                option.textContent = month;
                this.monthDD.appendChild(option);
            }
        }
    }
}

// Public method to decorate a single panel
export default function decorate(panel, model) {
    new AdvancedDatepickerField(panel, model);
    return panel;
}
