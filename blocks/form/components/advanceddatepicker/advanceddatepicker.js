/* eslint-disable class-methods-use-this */
import { i18n } from '../../../../i18n/index.js';
import { updateOrCreateInvalidMsg } from '../../util.js'

class AdvancedDatepickerField {
  constructor(panel, model) {
    this.panel = panel;
    this.model = model;
    this.currentYear = new Date().getFullYear();
    this.defaultYearMin = this.currentYear - 20;
    this.defaultYearMax = this.currentYear;

    const dds = panel.querySelectorAll(':scope>.drop-down-wrapper>select');
    [this.monthDD, this.yearDD] = dds;

    this.init();
  }

  parseNumber(str, defaultValue = 0) {
    const num = Number(str);
    return Number.isNaN(num) ? defaultValue : num;
  }

  plusMinus(str) {
    return str && (str.charAt(0) === '+' || str.charAt(0) === '-');
  }

  init() {
    const descriptionEl = document.createElement('div');
    descriptionEl.classList.add('field-description-2');
    this.panel.append(descriptionEl);

    this.panel.classList.add('advanceddatepicker');
    this.panel.dataset.yearMax = this.model.properties.yearMax;
    this.panel.dataset.yearMin = this.model.properties.yearMin;
    this.panel.dataset.required = this.yearDD.required || this.monthDD.required;

    const yearMinS = this.model.properties.yearMin;
    const yearMaxS = this.model.properties.yearMax;

    let yearMin = this.parseNumber(yearMinS, this.defaultYearMin);
    let yearMax = this.parseNumber(yearMaxS, this.defaultYearMax);

    if (this.plusMinus(yearMinS)) {
      yearMin = this.currentYear + parseInt(yearMinS, 10);
    }

    if (this.plusMinus(yearMaxS)) {
      yearMax = this.currentYear + parseInt(yearMaxS, 10);
    }

    this.populateYears(yearMin, yearMax);
    this.populateMonths();
  }

  populateYears(yearMin, yearMax) {
    const options = this.yearDD.querySelectorAll('option:not([disabled])');
    if (options.length === 0) {
      for (let year = yearMin; year <= yearMax; year += 1) {
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
      for (let month = 1; month <= 12; month += 1) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = i18n(`month_${month}`);
        this.monthDD.appendChild(option);
      }
    }
  }
}

export function toggle(panel, visible) {
  if (visible) {
    panel.dataset.visible = visible;
    panel.disabled = !visible;

    panel.classList.remove('field-invalid');

    panel.querySelectorAll('select').forEach((select) => {
      select.closest('.field-wrapper').dataset.visible = true;
    });
  } else {
    panel.disabled = true;
    panel.dataset.visible = false;

    panel.querySelectorAll('select').forEach((select) => {
      select.closest('.field-wrapper').classList.remove('field-invalid');
      select.closest('.field-wrapper').dataset.visible = false;
      updateOrCreateInvalidMsg(select);
    });
  }
}

// Public method to decorate a single panel
export default function decorate(panel, model) {
  /* eslint-disable-next-line no-new */
  new AdvancedDatepickerField(panel, model);
  return panel;
}
