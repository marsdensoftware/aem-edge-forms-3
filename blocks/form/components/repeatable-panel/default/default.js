import { validateContainer } from '../../wizard/wizard.js'
import { loadCSS } from '../../../../../scripts/aem.js'
import { isNo, DefaultFieldConverter } from '../../utils.js'
import { updateOrCreateInvalidMsg } from '../../../../form/util.js'
import { i18n } from '../../../../../i18n/index.js'
import { Modal } from '../../modal/modal.js'

class RepeatModal extends Modal {
  constructor(yesCallback, noCallback) {
    super();

    this._yesCallback = yesCallback;
    this._noCallback = noCallback;
  }

  showModal() {
    super.showModal();

    this.dialog.addEventListener('close', () => {
      this.panel.dataset.visible = false;
    });

    this.panel.dataset.visible = true;

    this.dialog.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  hideModal() {
    this.dialog.close();
    this.panel.dataset.visible = false;
  }

  decorate(panelEl) {
    super.decorate(panelEl);

    // Register events on yes no buttons if any
    const btnYes = panelEl.querySelector('button[name="btnYes"]');
    btnYes?.addEventListener('click', () => {
      this?._yesCallback();
      this.hideModal();
    });

    const btnNo = panelEl.querySelector('button[name="btnNo"]');
    btnNo?.addEventListener('click', () => {
      this?._noCallback();
      this.hideModal();
    });
  }
}

export class RepeatablePanel {

  #overview;
  #converter;
  #sorterFn;

  constructor(el, properties, name, converter, sorterFn) {
    this._repeatablePanel = el.querySelector('.repeat-wrapper');

    const cancelModalEl = el.querySelector('fieldset[name="cancelModal"]');
    this._cancelModal = this._initModal(cancelModalEl, this._yesCancel.bind(this), this._noCancel.bind(this));

    const deleteModalEl = el.querySelector('fieldset[name="deleteModal"]');
    this._deleteModal = this._initModal(deleteModalEl, this._yesDelete.bind(this), this._noDelete.bind(this));
    this._name = name;

    if (!this._repeatablePanel) {
      throw new Error('No repeatable panel found');
    }

    this._addedTitle = properties.addedTitle;
    this._cardTitle = properties.cardTitle;

    // Load css
    loadCSS(`${window.hlx.codeBasePath}/blocks/form/components/repeatable-panel/repeatable-panel.css`)

    this._repeatablePanel.classList.add('panel-repeatable-panel');

    this.#converter = converter || new DefaultFieldConverter();
    this.#sorterFn = sorterFn;

    // create overview
    this.#overview = document.createElement('div');
    this.#overview.dataset.visible = false;
    this.#overview.classList.add('overview');

    if (this._addedTitle) {
      const addedTitleContainer = document.createElement('div');
      addedTitleContainer.classList.add('overview-title');
      addedTitleContainer.innerHTML = this._addedTitle;
      this.#overview.append(addedTitleContainer);
    }

    const content = document.createElement('div');
    content.classList.add('repeatable-entries');
    this.#overview.append(content);

    this._repeatablePanel.prepend(this.#overview);

    const form = this._repeatablePanel.closest('form');

    form.addEventListener('item:add', (event) => {
      const added = event.detail.item.el;
      // Check that added belongs to the current repeatable
      if (this._repeatablePanel.contains(added)) {
        this._onItemAdded(added);
      }
    });

    form.addEventListener('item:remove', (event) => {
      const removed = event.detail.item.el;
      // At this point the element is no longer in the dom
      const {id} = removed.dataset;
      const repeatableEntry = this._repeatablePanel.querySelector(`.repeatable-entry[data-id="${id}"]`);
      if (repeatableEntry) {
        // Find matching overview entry and remove
        this._delete(repeatableEntry);
      }
    });

    const entries = this._repeatablePanel.querySelectorAll('[data-repeatable]');
    entries.forEach(entry => {
      this._init(entry);
    });
  }

  _initModal(panelEl, yesCallback, noCallback) {
    if (panelEl) {
      const modal = new RepeatModal(yesCallback, noCallback);
      modal.decorate(panelEl);

      return modal;
    }
    return null;

  }

  _yesCancel(entry) {
    const currentEntry = entry || this._repeatablePanel.querySelector('[data-repeatable].current');
    this._resetChanges(currentEntry);
    this._toggleEditMode(currentEntry, false);

    if (!currentEntry.classList.contains('saved') && !this._isFirstEntry(currentEntry)) {
      // Unsaved and not first one --> Delete
      this.#triggerDeletion(currentEntry);
    }
  }

  _noCancel() {

  }

  _yesDelete(entry) {
    const currentEntry = entry || this._repeatablePanel.querySelector('[data-repeatable].current');
    this._clearFields(currentEntry);
    this._toggleEditMode(currentEntry, false);

    if (this._isFirstEntry(currentEntry)) {
      // Remove saved flag. We do not delete the first entry
      currentEntry.classList.remove('saved');
      // Disable to prevent validation
      currentEntry.disabled = true;
      currentEntry.dataset.savedData = '';
      this._renderOverview();
    }
    else {
      this.#triggerDeletion(currentEntry);
    }

    // trigger change
    this.#dispatchChange();
  }

  _noDelete() {

  }

  _init(entry) {
    // Can be overriden in sub classes to perform entry initialization, event bindings, etc...
    console.log(`Initializing ${entry.id}`);
  }

  _onItemAdded(entry) {
    // make unique
    this._makeUnique(entry);
    this._toggleEditMode(entry, true);
  }

  _makeUnique(el) {
    // TODO NJ: Remove after bug fixed by Adobe
    const index = new Date().getTime();// Array.from(el.parentNode.children).indexOf(el);
    el.dataset.id = el.dataset.id + '-' + index;
    // Update IDs and labels
    const inputs = el.querySelectorAll('[data-id]');

    inputs.forEach((input) => {
      input.dataset.id = input.dataset.id + '-' + index;
      if (input.querySelector('input')) {
        input.querySelector('input').id = input.dataset.id;
      }
      if (input.querySelector('label')) {
        input.querySelector('label').htmlFor = input.dataset.id;
      }

    });
  }

  _toggleEditMode(entry, visible) {
    const panel = entry.closest('.panel-repeatable-panel');
    if (visible) {
      // Remove disable flag to enable validation
      entry.disabled = false;
      entry.classList.add('current');
      panel.classList.add('editing');
    }
    else {
      entry.classList.remove('current');
      panel.classList.remove('editing');
    }

    this._toggleWizardButtons(!visible);
    this._ensureButtonBar(entry);
  }

  _toggleWizardButtons(visible) {
    const wizardButtonWrapper = this._repeatablePanel.closest('.wizard')?.querySelector('.wizard-button-wrapper');
    if (!wizardButtonWrapper) {
      return;
    }
    if (visible) {
      // show wizard buttons
      wizardButtonWrapper.style.display = 'grid';
    }
    else {
      // hide wizard buttons
      wizardButtonWrapper.style.display = 'none';
    }
  }

  _isFirstEntry(entry) {
    return Array.from(this._repeatablePanel.querySelectorAll('[data-repeatable]')).indexOf(entry) == 0;
  }

  _validate(entry) {
    // Can be used in subclasses to perform custom validations
    return entry != undefined;
  }

  _ensureButtonBar(entry) {
    let buttonBar = entry.querySelector('.button-bar');
    if (buttonBar) {
      return;
    }

    buttonBar = document.createElement('div');
    buttonBar.className = 'button-bar';
    entry.appendChild(buttonBar);

    const saveBtnLabel = entry.dataset.repeatSaveButtonLabel || i18n('Save');
    const saveBtn = this._createButton(saveBtnLabel);
    saveBtn.classList.add('btn-save')

    saveBtn.addEventListener('click', () => {
      // Validate
      const valid = validateContainer(entry) && this._validate(entry);

      if (valid) {
        // Save
        this._save(entry);
      }
    });

    const cancelBtnLabel = entry.dataset.repeatCancelButtonLabel || i18n('Cancel');
    const cancelBtn = this._createButton(cancelBtnLabel);
    cancelBtn.classList.add('btn-cancel', 'link');

    cancelBtn.addEventListener('click', () => {
      if (this._hasChanges(entry)) {
        this._cancelModal ? this._cancelModal.showModal() : this._yesCancel(entry);
      }
      else {
        this._yesCancel(entry);
      }
    });

    const deleteBtnLabel = this._repeatablePanel.dataset.repeatDeleteButtonLabel || i18n('Delete');
    const deleteBtn = this._createButton(deleteBtnLabel);
    deleteBtn.classList.add('btn-delete', 'link');

    deleteBtn.addEventListener('click', () => {
      this._deleteModal ? this._deleteModal.showModal() : this._yesDelete(entry);
    });

    buttonBar.appendChild(cancelBtn);
    buttonBar.appendChild(deleteBtn);
    buttonBar.appendChild(saveBtn);
  }

  /**
   * Remove a repeatable entry from the overview
   */
  _delete(repeatableEntry) {
    repeatableEntry.remove();
  }

  _save(entry) {
    entry.classList.add('saved');
    this._toggleEditMode(entry, false);

    this._entryModified(entry);

    this.#dispatchChange();

    this._renderOverview();
  }

  #dispatchChange() {
    // Trigger event with name of the repeatable as parameter and values
    const entries = this.#getSavedEntries();
    const params = { detail: { name: this._name, entries: entries } };
    const event = new CustomEvent('repeatableChanged', params);

    const form = this._repeatablePanel.closest('form');

    form.dispatchEvent(event);
  }

  _hasChanges(entry) {

    function deepEqual(a, b) {
      if (a === b) return true;

      if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null)
        return false;

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
          return false;
        }
      }

      return true;
    }

    const savedData = JSON.parse(entry.dataset.savedData || '{}');
    const currentData = new DefaultFieldConverter().convert(entry);

    return !deepEqual(savedData, currentData);
  }

  _resetChanges(entry) {
    if (!this._hasChanges(entry)) {
      return;
    }
    const inputs = entry.querySelectorAll('input, select, textarea');

    if (entry.classList.contains('saved')) {
      // Saved entry, reset to previous saved values
      const savedData = JSON.parse(entry.dataset.savedData);

      inputs.forEach(input => {
        const savedInputData = savedData[input.name];
        if (!savedInputData) {
          return;
        }
        const value = savedInputData.value ? savedInputData.value : undefined;
        const values = savedInputData.values ? savedInputData.values : [];

        switch (input.type) {
        case 'checkbox':
        case 'radio':
          input.checked = values.includes(input.value) || input.value == value;
          break;
        case 'select':
          for (const option of input.options) {
            option.selected = values.includes(option.value) || option.value == value;
          }
          break;
        default:
          input.value = value;
          break;
        }
      });
    }
    else {
      // Unsaved --> Clear all fields
      this._clearFields(entry);
    }
  }

  _clearFields(entry) {
    const inputs = entry.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }

      updateOrCreateInvalidMsg(input);
    });
  }

  #fieldToNameValues(element) {
    const result = this.#converter.convert(element);

    return result;
  }

  #entryToReadableString(entry) {
    let nameValues = this.#fieldToNameValues(entry)
    const entries = [];
    const classPrefix = 'repeatable';

    // Save original values to be used later to restore
    entry.dataset.savedData = JSON.stringify(new DefaultFieldConverter().convert(entry));

    if (this._cardTitle) {
      // Add card title as first entry
      nameValues = {
        cardTitle: {
          'value': this._cardTitle,
          'displayValue': this._cardTitle
        },
        ...nameValues
      };
    }

    Object.entries(nameValues).forEach(([name, data]) => {
      if (!data) {
        return;
      }
      const {value} = data;
      const {displayValue} = data;

      if (value) {
        const result = document.createElement('div');
        result.classList.add(`${classPrefix}-entry__${name}`);
        result.dataset.value = value;
        result.dataset.name = name;
        result.innerHTML = displayValue;

        entries.push(result);
      }

      const {values} = data;
      const {displayValues} = data;
      if (values) {
        const result = document.createElement('div');
        result.classList.add(`${classPrefix}-entry__${name}`);
        result.dataset.values = values;
        result.innerHTML = displayValues.join(', ');

        entries.push(result);
      }
    });

    return entries;
  }

  _renderEntry(entry) {
    const readable = this.#entryToReadableString(entry);

    const result = document.createElement('div');
    result.classList.add(`${this._name}-entry`, 'repeatable-entry');
    result.dataset.id = entry.dataset.id;

    const editLink = document.createElement('a');
    editLink.classList.add('repeatable-entry__edit');
    editLink.textContent = 'Edit';
    editLink.href = '#';
    result.append(editLink);

    editLink.addEventListener('click', (e) => {
      this._toggleEditMode(entry, true);

      e.preventDefault();
    });

    readable.forEach(r => {
      result.append(r);
    });

    return result;
  }

  #triggerDeletion(entry) {
    // Trigger click on framework item remove button
    entry?.querySelector('.item-remove')?.click();
  }

  init() {
    this._renderOverview();
  }

  _entryModified(entry) {
    // Find existing rendered entry
    const dataId = entry.dataset.id;
    const e = this._repeatablePanel.querySelector(`.repeatable-entry[data-id="${dataId}"]`);

    const content = this._renderEntry(entry);

    if (!e) {
      // Create
      this.#overview.querySelector('.repeatable-entries').append(content);
      this.#overview.dataset.visible = true;
    }
    else {
      // Update
      e.replaceWith(content);
    }
  }

  #getSavedEntries() {
    const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');
    const result = [];

    savedEntries.forEach((entry) => {
      const data = new DefaultFieldConverter().convert(entry);
      result.push(data);
    });

    return result;
  }

  _renderOverview() {
    let savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');

    if (savedEntries.length > 0) {
      if (this.#sorterFn) {
        savedEntries = Array.from(savedEntries).sort(this.#sorterFn);
      }

      const content = this.#overview.querySelector('.repeatable-entries');

      // Clear content
      content.innerHTML = '';

      savedEntries.forEach((entry) => {
        content.append(this._renderEntry(entry));
      });
      this.#overview.dataset.visible = true;
    }
    else {
      this.#overview.dataset.visible = false;
    }
  }

  _createButton(label) {
    const button = document.createElement('button');
    button.classList.add('button');
    button.type = 'button';
    const text = document.createElement('span');
    text.textContent = label;
    button.append(document.createElement('i'), text);

    return button;
  }
}

/**
 * Repeatable that is displayed when a condition is fullfiled, based on a radio group
 */
export class ConditionalRepeatable extends RepeatablePanel {
  // A field with many options with one that yields no,0,false as value
  _conditionField;

  constructor(el, properties, name, converter, sorterFn) {
    super(el, properties, name, converter, sorterFn);

    // Add class
    this._repeatablePanel.classList.add('panel-repeatable-panel__conditional');

    // Add class
    this._repeatablePanel.classList.add(`panel-repeatable-panel__${name}`);

    this._conditionField = this._repeatablePanel.closest(`.field-${name}`).querySelector(`.field-${name}-selection`);
    if (this._conditionField) {
      const radios = this._conditionField.querySelectorAll(`input[name="${name}-selection"]`);

      // register click on radios
      radios.forEach(radio => {
        radio.addEventListener('change', () => {
          const entry = this._repeatablePanel.querySelector(':scope>[data-repeatable]:not(.saved)')

          if (isNo(radio)) {
            // hide repeatable panel
            this._repeatablePanel.style.display = 'none';
            // Show wizard buttons
            super._toggleWizardButtons(true);

            // TODO Clear all edits?
            if (entry) {
              this._clearFields(entry);
            }

            // prevent validation
            this._repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
          }
          else {
            // show repeatable panel
            this._repeatablePanel.style.display = 'block';
            // enable validation
            this._repeatablePanel.closest(`.field-${name}-options-content`).disabled = false;

            if (entry) {
              // Edit first entry if any
              this._toggleEditMode(entry, true);
            }
          }
        });
      });
      // prevent validation
      this._repeatablePanel.closest(`.field-${name}-options-content`).disabled = true;
    }
  }

  _yesCancel(entry) {
    super._yesCancel(entry);

    this._updateCondition();
  }

  _save(entry) {
    super._save(entry);

    this._updateCondition();
  }

  _updateCondition() {
    const savedEntries = this._repeatablePanel.querySelectorAll('[data-repeatable].saved');
    if (savedEntries.length > 0) {
      // Hide question
      this._conditionField.setAttribute('data-visible', false);
    }
    else {
      // reset selection & condition field
      const radios = this._conditionField.querySelectorAll('input[type="radio"]');

      radios?.forEach(radio => { radio.checked = false; });
      // Show condition field
      this._conditionField.setAttribute('data-visible', true);
      // hide repeatable panel
      this._repeatablePanel.style.display = 'none';
    }
  }

  _delete(repeatableEntry) {
    super._delete(repeatableEntry);
    this._updateCondition();
  }
}
