import { ConditionalRepeatable } from '../repeatable-panel/default/default.js';

export class LanguagePanelRepeatable extends ConditionalRepeatable {
  static FIELD_NAMES = {
    PROFICIENCY: 'proficiency',
    LANGUAGE: 'language',
    CODE: 'code',
  };

  constructor(repeatablePanel, properties) {
    super(repeatablePanel, properties, 'languagepanel');

    // Register typeahead valid listener
    /*
    document.addEventListener('typeahead:valid', (event) => {
      // Check if the change happens on language field within this repeatable
      const { target } = event;
      if (this._repeatablePanel.contains(target)) {
        const proficiency = target.closest('fieldset')
          .querySelector(`[name="${LanguagePanelRepeatable.FIELD_NAMES.PROFICIENCY}"]`);
        if (proficiency) {
          proficiency.style.display = 'block';
        }
      }
    });

    // Register typeahead invalid listener
    document.addEventListener('typeahead:invalid', (event) => {
      // Check if the change happens on language field within this repeatable
      const { target } = event;
      if (this._repeatablePanel.contains(target)) {
        const proficiency = target.closest('fieldset')
          .querySelector(`[name="${LanguagePanelRepeatable.FIELD_NAMES.PROFICIENCY}"]`);
        if (proficiency) {
          proficiency.style.display = 'none';
        }
      }
    });
    */
  }

  _clearFields(entry) {
    super._clearFields(entry);
    const proficiency = entry.querySelector(`[name="${LanguagePanelRepeatable.FIELD_NAMES.PROFICIENCY}"]`);
    if (proficiency) {
      proficiency.style.display = 'none';
    }
  }

  _init(entry) {
    super._init(entry);

    const languageField = entry.querySelector(`[name="${LanguagePanelRepeatable.FIELD_NAMES.LANGUAGE}"]`);
    const codeFieldset = entry.querySelector(`[name="${LanguagePanelRepeatable.FIELD_NAMES.CODE}"]`);

    // Register typeahead valid listener
    languageField?.addEventListener('typeahead:valid', (event) => {
      const { target } = event;
      const { code, proficiencyCodes } = event.detail;

      console.log('detail: ', event.detail);

      const proficiency = target.closest('fieldset').querySelector(`[name="${LanguagePanelRepeatable.FIELD_NAMES.PROFICIENCY}"]`);
      if (proficiency) {
        /* eslint-disable-next-line no-undef */
        myForm.getElement(proficiency.id).value = ''
        proficiency.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
          cb.parentElement.dataset.visible = proficiencyCodes.includes(cb.value);
        });
        proficiency.style.display = 'block';
      }

      // Set code
      const codeField = codeFieldset?.querySelector('input[type="checkbox"]');
      if (codeField) {
        codeField.value = code;
      }
    });

    // Register typeahead invalid listener
    languageField?.addEventListener('typeahead:invalid', (event) => {
      // Check if the change happens on language field within this repeatable
      const { target } = event;
      const proficiency = target.closest('fieldset').querySelector(`[name="${LanguagePanelRepeatable.FIELD_NAMES.PROFICIENCY}"]`);
      if (proficiency) {
        proficiency.style.display = 'none';
      }

      // Clear code
      const codeField = codeFieldset.querySelector('input[type="text"]');
      codeField.value = undefined;
    });
  }

  _onItemAdded(entry) {
    this._init(entry)

    super._onItemAdded(entry)
  }
}
