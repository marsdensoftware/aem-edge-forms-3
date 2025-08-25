/* eslint-disable class-methods-use-this */
import { i18n } from '../../../i18n/index.js';

export class DefaultFieldConverter {
  _collectFields(root) {
    const result = [];

    function traverse(node) {
      if (!node.items || !Array.isArray(node.items)) return;

      for (const child of node.items) {
        if (child.isContainer) {
          traverse(child); // go deeper
        } else {
          result.push(child); // collect non-container
        }
      }
    }

    traverse(root);
    return result;
  }

  convert(entry, fieldName) {
    const dataModel = myForm.getElement(entry.id);
    const fields = this._collectFields(dataModel);

    return this._convertInternal(fields, fieldName);
  }

  convertSingle(item) {
    const {
      name, value, enumNames, type,
    } = item;

    const displayValues = [];
    let values;

    let displayValue = '';

    if (!value) {
      return { value: '', displayValue: '' };
    }

    if (enumNames) {
      if (type.endsWith('[]')) {
        values = value;
        values.forEach((val) => {
          const index = item.enum.indexOf(val);
          displayValues.push(enumNames[index]);
        });

        return { values, displayValues };
      }
      const index = item.enum.indexOf(value);
      displayValue = item.fieldType == 'checkbox' ? item?.label.value : enumNames[index];
      return { value, displayValue };
    }
    displayValue = value;
    return { value, displayValue };
  }

  _convertSearchBox(item) {
    function getDisplayText(input) {
      const labelEl = input.parentElement.querySelector('label');
      let result = '';

      if (!labelEl) {
        return result;
      }

      // First check text inside label
      const textEl = labelEl.querySelector(':scope>.text');
      if (textEl) {
        result = textEl.textContent.trim();

        // Check description
        const descEl = labelEl.querySelector(':scope>.desc');
        if (descEl) {
          result += ` - ${descEl.textContent.trim()}`;
        }
      } else {
        result = labelEl.textContent.trim();
      }

      return result;
    }

    const entry = document.getElementById(item.id).closest('.search-box');

    const inputs = Array.from(entry.querySelectorAll('input, select, textarea'));

    const result = {};

    inputs.forEach((input) => {
      const { value } = input;
      let displayValue = value;
      const { name } = input;

      const { type } = input;

      // ignore text input from search-box component
      if (type === 'text' && input.parentElement.classList.contains('search-box__input')) {
        return;
      }

      if (input.tagName === 'SELECT') {
        displayValue = input.options[input.selectedIndex]?.text.trim() || '';
      } else if (type === 'checkbox' || type === 'radio') {
        // Ignore not checked
        if (!input.checked) {
          return;
        }

        displayValue = input.checked ? getDisplayText(input) : '';
      }

      if (value) {
        if (result[name]) {
          // multi values
          const e = result[name];
          if (!e.values) {
            e.values = [];
            e.values.push(e.value);
            delete e.value;
            e.displayValues = [];
            e.displayValues.push(e.displayValue);
            delete e.displayValue;
          }
          e.values.push(value);
          e.displayValues.push(displayValue);
        } else {
          result[name] = { value, displayValue };
        }
      }
    });

    return result;
  }

  _convertInternal(items, fieldName) {
    const result = {};

    /* eslint-disable no-param-reassign */
    if (fieldName) {
      items = items.filter((item) => item.name == fieldName);
    }

    // ignore plain-text, image component
    items = items.filter((item) => item.fieldType != 'plain-text' && item.fieldType != 'image');
    /* eslint-enable no-param-reassign */

    items.forEach((item) => {
      if (item[':type'] == 'search-box') {
        // convert search box
        Object.assign(result, this._convertSearchBox(item));
      } else {
        result[item.name] = this.convertSingle(item);
      }
    });

    return result;
  }
}

export function onElementAdded(el) {
  return new Promise((resolve) => {
    if (el.isConnected) {
      resolve(el);
      return;
    }

    const observer = new MutationObserver(() => {
      if (el.isConnected) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

export function onElementsAddedByClassName(className, callback) {
  // Track elements already seen to avoid duplicates
  const seen = new WeakSet();

  // Call callback on any existing matching elements
  document.querySelectorAll(`.${className}`).forEach((el) => {
    if (!seen.has(el)) {
      seen.add(el);
      callback(el);
    }
  });

  // Set up the MutationObserver
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Check if node matches or contains matching elements
            if (node.classList.contains(className) && !seen.has(node)) {
              seen.add(node);
              callback(node);
            }
            node.querySelectorAll?.(`.${className}`)?.forEach((el) => {
              if (!seen.has(el)) {
                seen.add(el);
                callback(el);
              }
            });
          }
        });
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export function getDurationString(startMonthStr, startYearStr, endMonthStr, endYearStr) {
  const startMonth = parseInt(startMonthStr, 10);
  const startYear = parseInt(startYearStr, 10);
  const endMonth = parseInt(endMonthStr, 10);
  const endYear = parseInt(endYearStr, 10);

  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearStr = years > 0 ? `${years} ${i18n('year')}${years > 1 ? 's' : ''}` : '';
  const monthStr = months > 0 ? `${months} ${i18n('month')}${months > 1 ? 's' : ''}` : '';

  if (yearStr && monthStr) return `${yearStr} ${monthStr}`;
  return yearStr || monthStr || `0 ${i18n('months')}`;
}

export function isNo(field) {
  const { value } = field;
  if (!value) return true;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'no' || normalized === 'false' || normalized === '0';
  }
  return false;
}
