/* eslint-disable max-classes-per-file */
import { ConditionalRepeatable } from '../repeatable-panel/default/default.js'
import { FIELD_NAMES, sorter, COMPLETION_STATUS } from './fieldnames.js'
import { DefaultFieldConverter } from '../utils.js'
import { dispatchToast } from '../toast-container/toast-container.js';

class Converter extends DefaultFieldConverter {
  convert(element) {
    const result = super.convert(element)

    // Customize rendering for completion-year, completion status
    const completionStatus = result[FIELD_NAMES.COMPLETION_STATUS]
    if (completionStatus?.value === COMPLETION_STATUS.COMPLETED) {
      // Completed
      const year = result[FIELD_NAMES.FINISH_YEAR]
      completionStatus.displayValue += ` ${year.displayValue}`
    }

    // Delete start and finish
    delete result[FIELD_NAMES.FINISH_MONTH]
    delete result[FIELD_NAMES.FINISH_YEAR]
    delete result[FIELD_NAMES.START_MONTH]
    delete result[FIELD_NAMES.START_YEAR]

    return result
  }
}

export class EducationRepeatable extends ConditionalRepeatable {
  constructor(repeatablePanel, properties) {
    super(repeatablePanel, properties, 'education', new Converter(), sorter)
  }

  _init(entry) {
    super._init(entry)
    // Register listener on completion status
    const completionStatusRadios = entry.querySelectorAll(
      `input[name="${FIELD_NAMES.COMPLETION_STATUS}"]`,
    )
    const panel = entry.querySelector(
      `[name="${FIELD_NAMES.FINISH_DATEPICKER}"]`,
    )
    // Defaults to hidden, as there is no option of this in
    // UE for advanced date picker.
    // Disable/Hide completion date to prevent validation

    panel.disabled = true;
    panel.dataset.visible = false;

    completionStatusRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        const visible = radio.value === COMPLETION_STATUS.COMPLETED;
        panel.dataset.visible = visible;
        panel.disabled = !visible;

        panel.querySelectorAll('.field-invalid').forEach((field) => {
          field.classList.remove('field-invalid');
        });
      });
    });
  }

  _onItemAdded(entry) {
    this._init(entry)

    super._onItemAdded(entry)
  }

  _save(entry) {
    super._save(entry)

    dispatchToast({
      type: 'success',
      toastTitle: 'Education added successfully.',
      dismissible: true,
      timeoutMs: undefined,
      strategy: 'stack',
      maxToasts: 3,
    })
  }
}
