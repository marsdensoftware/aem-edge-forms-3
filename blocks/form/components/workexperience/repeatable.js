/* eslint-disable max-classes-per-file */
import { ConditionalRepeatable } from '../repeatable-panel/default/default.js'
import {
  isNo, getDurationString, DefaultFieldConverter, isAfter,
} from '../utils.js'
import { i18n } from '../../../../i18n/index.js'
import { toggle } from '../advanceddatepicker/advanceddatepicker.js'
import { FIELD_NAMES, sorter, STILL_WORKING_STATUS } from './fieldnames.js';
// import { dispatchToast } from '../toast-container/toast-container.js';

class Converter extends DefaultFieldConverter {
  convert(element) {
    const result = super.convert(element)

    // Customize rendering for completion-year, completion status
    const startMonth = result[FIELD_NAMES.START_OF_WORK_MONTH]?.value;
    if (!startMonth) {
      return result;
    }
    const stillWorking = result[FIELD_NAMES.STILL_WORKING];
    const startYear = result[FIELD_NAMES.START_OF_WORK_YEAR].value;
    let endMonth;
    let endYear;
    let workperiod = `${i18n(`month_${result[FIELD_NAMES.START_OF_WORK_MONTH].displayValue}`)} ${result[FIELD_NAMES.START_OF_WORK_YEAR].displayValue}`;
    let endofwork;
    if (stillWorking?.value === STILL_WORKING_STATUS.NO) {
      // No longer working
      endofwork = `${i18n(`month_${result[FIELD_NAMES.END_OF_WORK_MONTH].displayValue}`)} ${result[FIELD_NAMES.END_OF_WORK_YEAR].displayValue}`;
      endMonth = result[FIELD_NAMES.END_OF_WORK_MONTH].value;
      endYear = result[FIELD_NAMES.END_OF_WORK_YEAR].value;
    } else {
      // Still working
      const now = new Date();

      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      endofwork = i18n('present');
      endMonth = currentMonth;
      endYear = currentYear;
    }

    workperiod += ` - ${endofwork} (${getDurationString(startMonth, startYear, endMonth, endYear)})`;

    const newResult = {};
    newResult[FIELD_NAMES.JOB_TITLE] = result[FIELD_NAMES.JOB_TITLE];
    newResult[FIELD_NAMES.EMPLOYER_NAME] = result[FIELD_NAMES.EMPLOYER_NAME];
    if (result[FIELD_NAMES.TYPE_OF_WORK_EXPERIENCE].value !== FIELD_NAMES.PAID_WORK) {
      // Not paid work
      newResult[FIELD_NAMES.TYPE_OF_WORK_EXPERIENCE] = result[FIELD_NAMES.TYPE_OF_WORK_EXPERIENCE];
    }
    newResult.workperiod = { value: workperiod, displayValue: workperiod };

    return newResult;
  }
}

export class WorkExperienceRepeatable extends ConditionalRepeatable {
  static PAID_WORK = '1';

  constructor(repeatablePanel, properties) {
    super(repeatablePanel, properties, 'workexperience', new Converter(), sorter);
  }

  _init(entry) {
    super._init(entry);

    const typeOfWorkExperience = entry.querySelector(`.field-${FIELD_NAMES.TYPE_OF_WORK_EXPERIENCE}>select`);

    const isFirst = this._isFirstEntry(entry);

    // Make type of work experience visible if not first entry
    typeOfWorkExperience.parentElement.dataset.visible = !isFirst;

    // Show below fields if it is first. Or until a type of work experience has been selected.
    entry.querySelector(`[name="${FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = isFirst;

    typeOfWorkExperience.addEventListener('change', () => {
      // Show fields below now that a type of work has been selected
      entry.querySelector(`[name="${FIELD_NAMES.FIELDS_CONTAINER}"]`).dataset.visible = true;
    });

    // Disable/Hide endofwork to prevent validation
    WorkExperienceRepeatable._toggleFinishDate(entry);

    WorkExperienceRepeatable._bindEvents(entry);
  }

  static _toggleFinishDate(entry, visible) {
    const panel = entry.querySelector(`fieldset[name="${FIELD_NAMES.END_OF_WORK}"]`);

    toggle(panel, visible);
  }

  _resetChanges(entry) {
    super._resetChanges(entry);

    WorkExperienceRepeatable._toggleFinishDate(entry);
  }

  _onItemAdded(entry) {
    this._init(entry);

    super._onItemAdded(entry);
  }

  _validate(entry) {
    let valid = super._validate(entry);

    if (!valid) {
      return false;
    }

    const data = new DefaultFieldConverter().convert(entry);

    const stillWorking = data[FIELD_NAMES.STILL_WORKING];
    if (stillWorking?.value === STILL_WORKING_STATUS.NO) {
      // Completed
      const finishMonth = data[FIELD_NAMES.END_OF_WORK_MONTH]?.value;
      const finishYear = data[FIELD_NAMES.END_OF_WORK_YEAR]?.value;
      const startMonth = data[FIELD_NAMES.START_OF_WORK_MONTH]?.value;
      const startYear = data[FIELD_NAMES.START_OF_WORK_YEAR]?.value;

      if (finishYear && finishMonth) {
        valid = isAfter(startYear, startMonth, finishYear, finishMonth);

        const endOfWork = entry.querySelector(`fieldset[name="${FIELD_NAMES.END_OF_WORK}"]`);
        if (!valid) {
          endOfWork.querySelector('.field-description-2').textContent = 'Finish date must be after start date!';
          endOfWork.classList.add('field-invalid');
        } else {
          // Clear validation
          endOfWork.classList.remove('field-invalid');
          endOfWork.querySelector('.field-description-2').textContent = '';
        }
      }
    }

    return valid;
  }

  /* eslint-disable class-methods-use-this */
  static _bindEvents(entry) {
    entry.querySelector(`fieldset[name="${FIELD_NAMES.END_OF_WORK}"]`).addEventListener('change', () => {
      this._validate(entry);
    })

    // Register change on still-working field to show hide endofwork
    const stillWorkingRadios = entry.querySelectorAll(`fieldset[name="${FIELD_NAMES.STILL_WORKING}"] input[type="radio"]`);

    stillWorkingRadios.forEach((radio) => {
      radio.addEventListener('change', (event) => {
        // endofwork visibility
        const visible = isNo(event.target);
        WorkExperienceRepeatable._toggleFinishDate(entry, visible);
      });
    });
  }
  /* eslint-enable-next class-methods-use-this */

  _save(entry) {
    // Before save
    if (this._isFirstEntry(entry)) {
      const selectedRadio = this._conditionField.querySelector('input[type="radio"]:checked');
      if (selectedRadio) {
        const { value } = selectedRadio;
        // Copy radio value into type of work field. Because it is not visible initially for the
        // first entry
        const typeOfWorkExperience = entry.querySelector(`.field-${FIELD_NAMES.TYPE_OF_WORK_EXPERIENCE}`);

        window.myForm.getElement(typeOfWorkExperience.dataset.id).value = value;
      }
    }

    super._save(entry);
    //
    // // dispatch toast event with the max selection message (error state)
    // dispatchToast({
    //   type: 'success',
    //   toastTitle: 'Work experience added successfully.',
    //   toastMessage: 'You can 3 more work experience.',
    //   dismissible: true,
    //   timeoutMs: undefined,
    //   strategy: 'stack',
    //   maxToasts: 3,
    // });
    // After save
  }
}
