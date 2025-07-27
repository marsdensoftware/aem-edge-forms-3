import { ConditionalRepeatable } from '../repeatable-panel/default/default.js'
import { FIELD_NAMES } from './fieldnames.js'
import { DefaultFieldConverter } from '../utils.js'

class Converter extends DefaultFieldConverter {
  convert(element) {
    const result = super.convert(element)

    // Customize rendering for completion-year, completion status
    const completionStatus = result[FIELD_NAMES.COMPLETION_STATUS]
    if (completionStatus?.value == '0') {
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
    super(repeatablePanel, properties, 'education', new Converter())
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
    panel?.setAttribute('data-visible', false)

    completionStatusRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        panel?.setAttribute('data-visible', radio.value === '0')
      })
    })
  }

  _onItemAdded(entry) {
    this._init(entry)

    super._onItemAdded(entry)
  }
}
