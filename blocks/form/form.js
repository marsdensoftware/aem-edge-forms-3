import { createOptimizedPicture } from '../../scripts/aem.js';
import transferRepeatableDOM, {
  insertAddButton, insertRemoveButton, createButton as createRepeatButton,
} from './components/repeat/repeat.js';
import { emailPattern, getSubmitBaseUrl, SUBMISSION_SERVICE } from './constant.js';
import GoogleReCaptcha from './integrations/recaptcha.js';
import componentDecorator from './mappings.js';
import { handleSubmit } from './submit.js';
import DocBasedFormToAF from './transform.js';
import {
  /* eslint-disable no-unused-vars */ // getId is used in commented-out code for NJ to review
  getId,
  checkValidation,
  createButton,
  createDropdownUsingEnum,
  createFieldWrapper,
  createHelpText,
  createLabel,
  createRadioOrCheckboxUsingEnum,
  extractIdFromUrl,
  getHTMLRenderType,
  getSitePageName,
  setConstraints,
  setPlaceholder,
  stripTags,
  createRadioOrCheckbox,
  createInput,
} from './util.js';

export const DELAY_MS = 0;
let captchaField;
let afModule;

const withFieldWrapper = (element) => (fd) => {
  const wrapper = createFieldWrapper(fd);
  // ### SEP-NJ Start set max remaining chars message
  if (fd?.properties?.maxRemainingCharsMessage) {
    wrapper.dataset.maxRemainingCharsMessage = fd.properties.maxRemainingCharsMessage;
  }
  // ### SEP-NJ End
  wrapper.append(element(fd));
  return wrapper;
};

// NONO TO CHECK AS THIS IS NOW IMPORTED
// function setPlaceholder(element, fd) {
//   if (fd.placeholder) {
//     element.setAttribute('placeholder', fd.placeholder);
//   }
// }

// NONO TO CHECK AS THIS IS NOW IMPORTED
// const constraintsDef = Object.entries({
//   'password|tel|email|text': [['maxLength', 'maxlength'], ['minLength', 'minlength'], 'pattern'],
//   'number|range|date': [['maximum', 'Max'], ['minimum', 'Min'], 'step'],
//   file: ['accept', 'Multiple'],
//   panel: [['maxOccur', 'data-max'], ['minOccur', 'data-min']],
// }).flatMap(([types, constraintDef]) => types.split('|')
//   .map((type) => [type, constraintDef.map((cd) => (Array.isArray(cd) ? cd : [cd, cd]))]));
//
// const constraintsObject = Object.fromEntries(constraintsDef);
//
// function setConstraints(element, fd) {
//   const renderType = getHTMLRenderType(fd);
//   const constraints = constraintsObject[renderType];
//   if (constraints) {
//     constraints
//       .filter(([nm]) => fd[nm])
//       .forEach(([nm, htmlNm]) => {
//         element.setAttribute(htmlNm, fd[nm]);
//       });
//   }
// }

// NONO TO CHECK AS THIS IS NOW IMPORTED
// function createInput(fd) {
//   const input = document.createElement('input');
//   input.type = getHTMLRenderType(fd);
//
//   // ###NJ Start Added spellcheck
//   if(fd.properties?.spellcheck){
//     input.setAttribute('spellcheck', true);
//   }
//   // ###NJ End Added spellcheck
//
//   setPlaceholder(input, fd);
//   setConstraints(input, fd);
//   return input;
// }

const createTextArea = withFieldWrapper((fd) => {
  const input = document.createElement('textarea');

  // ###NJ Start Added spellcheck
  if (fd.properties?.spellcheck) {
    input.setAttribute('spellcheck', true);
  }
  // ###NJ End Added spellcheck

  setPlaceholder(input, fd);
  // ###SEP-NJ Start Call setContraints to set contraints related properties
  setConstraints(input, fd);
  // ###SEP-NJ End
  return input;
});

const createSelect = withFieldWrapper((fd) => {
  const select = document.createElement('select');
  createDropdownUsingEnum(fd, select);
  // NONO TO CHECK
  // select.required = fd.required;
  // select.title = fd.tooltip ? stripTags(fd.tooltip, '') : '';
  // select.readOnly = fd.readOnly;
  // select.multiple = fd.type === 'string[]' || fd.type === 'boolean[]' || fd.type === 'number[]';
  // let ph;
  // if (fd.placeholder) {
  //   ph = document.createElement('option');
  //   ph.textContent = fd.placeholder;
  //   ph.setAttribute('disabled', '');
  //   ph.setAttribute('value', '');
  //   select.append(ph);
  // }
  // let optionSelected = false;
  //
  // const addOption = (label, value) => {
  //   const option = document.createElement('option');
  //   option.textContent = label instanceof Object ? label?.value?.trim() : label?.trim();
  //   option.value = (typeof value === 'string' ? value.trim() : value) || label?.trim();
  //   if (fd.value === option.value || (Array.isArray(fd.value) && fd.value.includes(option.value))) {
  //     option.setAttribute('selected', '');
  //     optionSelected = true;
  //   }
  //   select.append(option);
  //   return option;
  // };
  //
  // const options = fd?.enum || [];
  // const optionNames = fd?.enumNames ?? options;
  //
  // if (options.length === 1
  //   && options?.[0]?.startsWith('https://')) {
  //   const optionsUrl = new URL(options?.[0]);
  //   // using async to avoid rendering
  //   if (optionsUrl.hostname.endsWith('hlx.page')
  //   || optionsUrl.hostname.endsWith('hlx.live')) {
  //     fetch(`${optionsUrl.pathname}${optionsUrl.search}`)
  //       .then(async (response) => {
  //         const json = await response.json();
  //         const values = [];
  //         json.data.forEach((opt) => {
  //           addOption(opt.Option, opt.Value);
  //           values.push(opt.Value || opt.Option);
  //         });
  //       });
  //   }
  // } else {
  //   options.forEach((value, index) => addOption(optionNames?.[index], value));
  // }
  //
  // if (ph && optionSelected === false) {
  //   ph.setAttribute('selected', '');
  // }
  return select;
});

function createHeading(fd) {
  const wrapper = createFieldWrapper(fd);
  const heading = document.createElement('h2');
  heading.textContent = fd.value || fd.label.value;
  heading.id = fd.id;
  wrapper.append(heading);

  return wrapper;
}

// NONO TO CHECK AS THIS IS NOW IMPORTED
// function createRadioOrCheckbox(fd) {
//   const wrapper = createFieldWrapper(fd);
//   const input = createInput(fd);
//   const [value, uncheckedValue] = fd.enum || [];
//   input.value = value;
//   if (typeof uncheckedValue !== 'undefined') {
//     input.dataset.uncheckedValue = uncheckedValue;
//   }
//   wrapper.insertAdjacentElement('afterbegin', input);
//   return wrapper;
// }

function createLegend(fd) {
  return createLabel(fd, 'legend');
}

function createRepeatablePanel(wrapper, fd) {
  setConstraints(wrapper, fd);
  wrapper.dataset.repeatable = true;
  wrapper.dataset.index = fd.index || 0;
  if (fd.properties) {
    Object.keys(fd.properties).forEach((key) => {
      if (!key.startsWith('fd:')) {
        wrapper.dataset[key] = fd.properties[key];
      }
    });
  }
  if ((!fd.index || fd?.index === 0) && fd.properties?.variant !== 'noButtons') {
    insertAddButton(wrapper, wrapper);
    insertRemoveButton(wrapper, wrapper);
  }
}

function createFieldSet(fd) {
  const wrapper = createFieldWrapper(fd, 'fieldset', createLegend);
  wrapper.id = fd.id;
  wrapper.name = fd.name;
  if (fd.fieldType === 'panel') {
    wrapper.classList.add('panel-wrapper');
    // ###GKW Added option to add a theme class
    if (fd.properties?.wizardtheme) {
      wrapper.classList.add(fd.properties.wizardtheme);
    }
    if (fd.properties?.panelrole) {
      wrapper.classList.add(fd.properties.panelrole);
    }
    if (fd.properties?.stepgroup) {
      wrapper.dataset.stepgroup = fd.properties.stepgroup;
    }
    // ###GKW END
  }
  if (fd.repeatable === true) {
    createRepeatablePanel(wrapper, fd);
  }
  return wrapper;
}

function setConstraintsMessage(field, messages = {}) {
  Object.keys(messages).forEach((key) => {
    field.dataset[`${key}ErrorMessage`] = messages[key];
  });
}

function createRadioOrCheckboxGroup(fd) {
  const wrapper = createFieldSet({ ...fd });
  createRadioOrCheckboxUsingEnum(fd, wrapper);
  // NONO TO CHECK - GKW HAS COPIED IT ACROSS
  // const type = fd.fieldType.split('-')[0];
  // fd?.enum?.forEach((value, index) => {
  // const label = (typeof fd?.enumNames?.[index] === 'object' &&
  //   fd?.enumNames?.[index] !== null) ? fd?.enumNames[index].value : fd?.enumNames?.[index] || value;
  //   const id = getId(fd.name);
  //   const field = createRadioOrCheckbox({
  //     name: fd.name,
  //     id,
  //     label: { value: label },
  //     fieldType: type,
  //     enum: [value],
  //     required: fd.required,
  //   });
  //
  //   // ###SEP-NJ START Display description below field label
  //   // Wrap text inside label into a span
  //   // Get the original text content and clear the label
  //   const labelEl = field.querySelector('label');
  //   if(labelEl){
  //     const textContent = labelEl.textContent.trim();
  //     labelEl.textContent = '';
  //
  //     // Create and append the span.text
  //     const textSpan = document.createElement('span');
  //     textSpan.className = 'text';
  //     textSpan.textContent = textContent;
  //     labelEl.appendChild(textSpan);
  //
  //     const description = fd.properties?.enumDescriptions?.[index];
  //
  //     if(description){
  //       // Create and append the span.desc
  //       const descSpan = document.createElement('span');
  //       descSpan.className = 'desc';
  //       descSpan.textContent = description;
  //       labelEl.appendChild(descSpan);
  //       labelEl.classList.add('field-label--with-description');
  //     }
  //   }
  //   // ###SEP-NJ END Display description
  //
  //   const { variant, 'afs:layout': layout } = fd.properties;
  //   // ###SEP-NJ START Always show variant if defined
  //   if (variant) {
  //     wrapper.classList.add(`variant-${variant}`);
  //   }
  //   // ###SEP-NJ END
  //   if (layout?.orientation === 'horizontal') {
  //     wrapper.classList.add('horizontal');
  //   }
  //   if (layout?.orientation === 'vertical') {
  //     wrapper.classList.remove('horizontal');
  //   }
  //   field.classList.remove('field-wrapper', `field-${toClassName(fd.name)}`);
  //   const input = field.querySelector('input');
  //   input.id = id;
  //   input.dataset.fieldType = fd.fieldType;
  //   input.name = fd.name;
  //   input.checked = Array.isArray(fd.value) ? fd.value.includes(value) : value === fd.value;
  //   if ((index === 0 && type === 'radio') || type === 'checkbox') {
  //     input.required = fd.required;
  //   }
  //   if (fd.enabled === false || fd.readOnly === true) {
  //     input.setAttribute('disabled', 'disabled');
  //   }
  //   wrapper.appendChild(field);
  // });

  // ###SEP-NJ START Wrap radios in a container if bar display
  if (wrapper.classList.contains('variant-bar')) {
    const wrappers = wrapper.querySelectorAll('.radio-wrapper');

    const radiosWrapper = document.createElement('div');
    radiosWrapper.className = 'radios-wrapper';

    // Insert before the first .radio-wrapper
    wrappers[0].parentNode.insertBefore(radiosWrapper, wrappers[0]);

    // Move the all elements inside the new wrapper
    wrappers.forEach((el) => radiosWrapper.appendChild(el));
  }
  // ###SEP-NJ END

  wrapper.dataset.required = fd.required;
  if (fd.tooltip) {
    wrapper.title = stripTags(fd.tooltip, '');
  }
  setConstraintsMessage(wrapper, fd.constraintMessages);
  return wrapper;
}

function createPlainText(fd) {
  const paragraph = document.createElement('p');
  if (fd.richText) {
    paragraph.innerHTML = stripTags(fd.value);
  } else {
    paragraph.textContent = fd.value;
  }
  // ###SEF-NJ Added option to render a class
  if (fd.properties?.classes) {
    paragraph.classList.add(fd.properties.classes);
  }

  const wrapper = createFieldWrapper(fd);
  wrapper.id = fd.id;
  wrapper.replaceChildren(paragraph);
  return wrapper;
}

function addLinkSupport(field, fd) {
  if (fd.properties.url) {
    const picture = field.querySelector('picture');

    if (picture) {
      const link = document.createElement('a');
      link.href = `${fd.properties.url}`;
      link.className = 'image-link';
      link.target = fd.properties.urlOpenInNewTab ? '_blank' : '';

      // Move the picture inside the new anchor element
      picture.parentNode.insertBefore(link, picture);
      link.appendChild(picture);
    }
  }
}

function createImage(fd) {
  const field = createFieldWrapper(fd);
  field.id = fd?.id;
  const imagePath = fd.value || fd.properties['fd:repoPath'] || '';
  const altText = fd.altText || fd.name;
  field.append(createOptimizedPicture(imagePath, altText));

  // ###SEP-NJ START Add support for link url
  addLinkSupport(field, fd);
  // ###SEP-NJ END
  return field;
}

const fieldRenderers = {
  'drop-down': createSelect,
  'plain-text': createPlainText,
  checkbox: createRadioOrCheckbox,
  button: createButton,
  multiline: createTextArea,
  panel: createFieldSet,
  radio: createRadioOrCheckbox,
  'radio-group': createRadioOrCheckboxGroup,
  'checkbox-group': createRadioOrCheckboxGroup,
  image: createImage,
  heading: createHeading,
};

function colSpanDecorator(field, element) {
  // SEPD-4286 - START RESPONSIVE GRID COLSPAN CHANGES - consider moving the code into a separate
  // js file and importing it.
  // Get the default colspan
  const defaultColSpan = field['Column Span'] || field.properties?.colspan;
  const defaultOffset = field['Column Offset'] || field.properties?.['colspan-offset'];
  const defaultDisplay = field['Column Display'] || field.properties?.display;
  const defaultOrder = field['Column Order'] || field.properties?.['d-order'];

  // Get responsive colspans from properties
  const responsiveColSpans = {
    sm: field.properties?.['colspan-sm'],
    md: field.properties?.['colspan-md'],
    lg: field.properties?.['colspan-lg'],
    xl: field.properties?.['colspan-xl'],
    xxl: field.properties?.['colspan-xxl'],
  };

  // Get responsive offsets from properties
  const responsiveOffsets = {
    sm: field.properties?.['colspan-sm-offset'],
    md: field.properties?.['colspan-md-offset'],
    lg: field.properties?.['colspan-lg-offset'],
    xl: field.properties?.['colspan-xl-offset'],
    xxl: field.properties?.['colspan-xxl-offset'],
  };

  // Get the responsive display options from properties
  const responsiveDisplayOptions = {
    sm: field.properties?.['display-sm'],
    md: field.properties?.['display-md'],
    lg: field.properties?.['display-lg'],
    xl: field.properties?.['display-xl'],
    xxl: field.properties?.['display-xxl'],
  }

  // Get the responsive display orders from properties
  const responsiveDisplayOrders = {
    sm: field.properties?.['d-order-sm'],
    md: field.properties?.['d-order-md'],
    lg: field.properties?.['d-order-lg'],
    xl: field.properties?.['d-order-xl'],
    xxl: field.properties?.['d-order-xxl'],
  }

  // Get container classes from properties
  const containerClass = field.properties?.container;
  const rowClass = field.properties?.row;
  const reverseRowWrap = field.properties?.['flex-wrap-reverse']

  if (element) {
    // Add default colspan class if defined
    if (defaultColSpan) {
      element.classList.add(`col${defaultColSpan === 'split' ? '' : `-${defaultColSpan}`}`);
    }

    // set a default offset - ideally, we should delete the value from the jcr
    if (defaultOffset) {
      element.classList.add(`offset-${defaultOffset}`);
    }

    // Add the default display value
    if (defaultDisplay) {
      element.classList.add(`d-${defaultDisplay}`);
    }

    // Add the default order value
    if (defaultOrder) {
      element.classList.add(`order-${defaultOrder}`);
    }

    // Add responsive colspan classes if defined
    Object.entries(responsiveColSpans).forEach(([size, value]) => {
      if (value) {
        element.classList.add(`col-${size}${value === 'split' ? '' : `-${value}`}`);
      }
    });

    // Add responsive offset classes if defined
    Object.entries(responsiveOffsets).forEach(([size, value]) => {
      if (value) {
        element.classList.add(`offset-${size}-${value}`);
      }
    });

    // Add responsive display options classes if defined
    Object.entries(responsiveDisplayOptions).forEach(([size, value]) => {
      if (value) {
        element.classList.add(`d-${size}-${value}`);
      }
    });

    // Add responsive display order classes if defined
    Object.entries(responsiveDisplayOrders).forEach(([size, value]) => {
      if (value) {
        element.classList.add(`order-${size}-${value}`);
      }
    });

    // Add container class if defined
    if (containerClass) {
      element.classList.add(containerClass);
    }

    // Add row class if defined
    if (rowClass === true) {
      element.classList.add('row');
      if (reverseRowWrap) {
        element.classList.add('flex-wrap-reverse');
      }
    }
  }
  // SEPD-4286 - END RESPONSIVE GRID COLSPAN CHANGES
}

const handleFocus = (input, field) => {
  const editValue = input.getAttribute('edit-value');
  input.type = field.type;
  input.value = editValue;
};

const handleFocusOut = (input) => {
  const displayValue = input.getAttribute('display-value');
  input.type = 'text';
  input.value = displayValue;
};

function inputDecorator(field, element) {
  const input = element?.querySelector('input,textarea,select');
  if (input) {
    input.id = field.id;
    input.name = field.name;
    if (field.tooltip) {
      input.title = stripTags(field.tooltip, '');
    }
    input.readOnly = field.readOnly;
    input.autocomplete = field.autoComplete ?? 'off';
    input.disabled = field.enabled === false;
    if (field.fieldType === 'drop-down' && field.readOnly) {
      input.disabled = true;
    }
    const fieldType = getHTMLRenderType(field);
    if (['number', 'date', 'text', 'email'].includes(fieldType) && (field.displayFormat || field.displayValueExpression)) {
      field.type = fieldType;
      input.setAttribute('edit-value', field.value ?? '');
      input.setAttribute('display-value', field.displayValue ?? '');
      input.type = 'text';
      input.value = field.displayValue ?? '';
      // Handle mobile touch events to enable native date picker
      let isMobileTouch = false;
      input.addEventListener('touchstart', () => {
        isMobileTouch = true;
        input.type = field.type;
        // Set the edit value immediately to prevent empty field
        const editValue = input.getAttribute('edit-value');
        if (editValue) {
          input.value = editValue;
        }
      });

      input.addEventListener('focus', () => {
        // Only change type on desktop or if not already changed by touchstart
        if (!isMobileTouch && input.type !== field.type) {
          input.type = field.type;
        }
        handleFocus(input, field);
        // Reset mobile touch flag
        isMobileTouch = false;
      });
      input.addEventListener('blur', () => handleFocusOut(input));
    } else if (input.type !== 'file') {
      input.value = field.value ?? '';
      if (input.type === 'radio' || input.type === 'checkbox') {
        input.value = field?.enum?.[0] ?? 'on';
        input.checked = field.value === input.value;
      }
    } else {
      input.multiple = field.type === 'file[]';
    }
    if (field.required) {
      input.setAttribute('required', 'required');
    }
    if (field.description) {
      input.setAttribute('aria-describedby', `${field.id}-description`);
    }
    if (field.minItems) {
      input.dataset.minItems = field.minItems;
    }
    if (field.maxItems) {
      input.dataset.maxItems = field.maxItems;
    }
    if (field.maxFileSize) {
      input.dataset.maxFileSize = field.maxFileSize;
    }
    if (field.default !== undefined) {
      input.setAttribute('value', field.default);
    }
    if (input.type === 'email') {
      input.pattern = emailPattern;
    }
    setConstraintsMessage(element, field.constraintMessages);
    element.dataset.required = field.required;
  }
}

function decoratePanelContainer(panelDefinition, panelContainer) {
  if (!panelContainer) return;

  const isPanelWrapper = (container) => container.classList?.contains('panel-wrapper');

  const shouldAddLabel = (container, panel) => panel.label && !container.querySelector(`legend[for=${container.dataset.id}]`);

  if (isPanelWrapper(panelContainer)) {
    if (shouldAddLabel(panelContainer, panelDefinition)) {
      const legend = createLegend(panelDefinition);
      if (legend) {
        panelContainer.insertAdjacentElement('afterbegin', legend);
      }
    }

    const form = panelContainer.closest('form');
    const isEditMode = form && form.classList.contains('edit-mode');
    const isRepeatable = panelDefinition.repeatable === true || panelContainer.dataset.repeatable === 'true';

    if (isEditMode && isRepeatable) {
      const hasAddButton = panelContainer.querySelector('.repeat-actions .item-add');
      const hasRemoveButton = panelContainer.querySelector('.item-remove');

      if (!hasAddButton) {
        let repeatActions = panelContainer.querySelector('.repeat-actions');
        if (!repeatActions) {
          repeatActions = document.createElement('div');
          repeatActions.className = 'repeat-actions';
          const legend = panelContainer.querySelector('legend');
          if (legend) {
            legend.insertAdjacentElement('afterend', repeatActions);
          } else {
            panelContainer.insertAdjacentElement('afterbegin', repeatActions);
          }
        }
        const addButton = createRepeatButton('Add', 'add');
        repeatActions.appendChild(addButton);
      }

      if (!hasRemoveButton) {
        const removeButton = createRepeatButton('Delete', 'remove');
        panelContainer.appendChild(removeButton);
      }
    }
  }
}

function renderField(fd) {
  const fieldType = fd?.fieldType?.replace('-input', '') ?? 'text';
  const renderer = fieldRenderers[fieldType];
  let field;
  if (typeof renderer === 'function') {
    field = renderer(fd);
  } else {
    field = createFieldWrapper(fd);
    field.append(createInput(fd));
  }
  if (fd.description) {
    const helpEl = createHelpText(fd);
    field.classList.add('with-description');

    // ###SEP-NJ START: add help text below label / legend
    const labelEl = field.querySelector('label, legend');
    if (labelEl && labelEl.nextSibling) {
      const newHelpEl = helpEl.cloneNode(true);
      newHelpEl.className = 'field-description-2';
      field.insertBefore(newHelpEl, labelEl.nextSibling);
      helpEl.textContent = '';
      fd.description = '';
      field.append(helpEl);
    } else {
      field.append(helpEl);
    }
    // ###SEP-NJ END: add help text below label / legend
    field.dataset.description = fd.description; // In case overriden by error message
  }
  if (fd.fieldType !== 'radio-group' && fd.fieldType !== 'checkbox-group' && fd.fieldType !== 'captcha') {
    inputDecorator(fd, field);
  }
  return field;
}

export async function generateFormRendition(panel, container, formId, getItems = (p) => p?.items) {
  const items = getItems(panel) || [];
  const promises = items.map(async (field) => {
    field.value = field.value ?? '';
    const { fieldType } = field;
    if (fieldType === 'captcha') {
      captchaField = field;
      const element = createFieldWrapper(field);
      element.textContent = 'CAPTCHA';
      return element;
    }
    const element = renderField(field);
    if (field.appliedCssClassNames) {
      element.className += ` ${field.appliedCssClassNames}`;
    }
    colSpanDecorator(field, element);
    if (field?.fieldType === 'panel') {
      await generateFormRendition(field, element, formId, getItems);
      return element;
    }
    await componentDecorator(element, field, container, formId);
    return element;
  });

  const children = await Promise.all(promises);
  container.append(...children.filter((_) => _ != null));
  decoratePanelContainer(panel, container);
  await componentDecorator(container, panel, null, formId);
}

function enableValidation(form) {
  form.querySelectorAll('input,textarea,select').forEach((input) => {
    input.addEventListener('invalid', (event) => {
      checkValidation(event.target);
    });
  });

  form.addEventListener('change', (event) => {
    checkValidation(event.target);
  });
}

function isDocumentBasedForm(formDef) {
  return formDef?.[':type'] === 'sheet' && formDef?.data;
}

async function createFormForAuthoring(formDef) {
  const form = document.createElement('form');
  await generateFormRendition(formDef, form, formDef.id, (container) => {
    if (container[':itemsOrder'] && container[':items']) {
      return container[':itemsOrder'].map((itemKey) => container[':items'][itemKey]);
    }
    return [];
  });
  return form;
}

export async function createForm(formDef, data, source = 'aem') {
  const { action: formPath } = formDef;
  const form = document.createElement('form');
  form.dataset.action = formPath;
  form.dataset.source = source;
  form.noValidate = true;
  if (formDef.appliedCssClassNames) {
    form.className = formDef.appliedCssClassNames;
  }
  const formId = extractIdFromUrl(formPath); // formDef.id returns $form after getState()
  await generateFormRendition(formDef, form, formId);

  let captcha;
  if (captchaField) {
    let config = captchaField?.properties?.['fd:captcha']?.config;
    if (!config) {
      config = {
        siteKey: captchaField?.value,
        uri: captchaField?.uri,
        version: captchaField?.version,
      };
    }
    const pageName = getSitePageName(captchaField?.properties?.['fd:path']);
    captcha = new GoogleReCaptcha(config, captchaField.id, captchaField.name, pageName);
    captcha.loadCaptcha(form);
  }

  enableValidation(form);
  transferRepeatableDOM(form, formDef, form, formId);

  if (afModule && typeof Worker === 'undefined') {
    window.setTimeout(async () => {
      afModule.loadRuleEngine(formDef, form, captcha, generateFormRendition, data);
    }, DELAY_MS);
  }

  form.addEventListener('reset', async () => {
    const response = await createForm(formDef);
    if (response?.form) {
      document.querySelector(`[data-action="${form?.dataset?.action}"]`)?.replaceWith(response?.form);
    }
  });

  form.addEventListener('submit', (e) => {
    handleSubmit(e, form, captcha);
  });

  return {
    form,
    captcha,
    generateFormRendition,
    data,
  };
}

function cleanUp(content) {
  const formDef = content.replaceAll('^(([^<>()\\\\[\\\\]\\\\\\\\.,;:\\\\s@\\"]+(\\\\.[^<>()\\\\[\\\\]\\\\\\\\.,;:\\\\s@\\"]+)*)|(\\".+\\"))@((\\\\[[0-9]{1,3}\\\\.[0-9]{1,3}\\\\.[0-9]{1,3}\\\\.[0-9]{1,3}])|(([a-zA-Z\\\\-0-9]+\\\\.)\\+[a-zA-Z]{2,}))$', '');
  return formDef?.replace(/\x83\n|\n|\s\s+/g, '');
}
/*
  Newer Clean up - Replace backslashes that are not followed by valid json escape characters
  function cleanUp(content) {
    return content.replace(/\\/g, (match, offset, string) => {
      const prevChar = string[offset - 1];
      const nextChar = string[offset + 1];
      const validEscapeChars = ['b', 'f', 'n', 'r', 't', '"', '\\'];
      if (validEscapeChars.includes(nextChar) || prevChar === '\\') {
        return match;
      }
      return '';
    });
  }
*/

function decode(rawContent) {
  const content = rawContent.trim();
  if (content.startsWith('"') && content.endsWith('"')) {
    // In the new 'jsonString' context, Server side code comes as a string with escaped characters,
    // hence the double parse
    return JSON.parse(JSON.parse(content));
  }
  return JSON.parse(cleanUp(content));
}

function extractFormDefinition(block) {
  let formDef;
  const container = block.querySelector('pre');
  const codeEl = container?.querySelector('code');
  const content = codeEl?.textContent;
  if (content) {
    formDef = decode(content);
  }
  return { container, formDef };
}

export async function fetchForm(pathname) {
  // get the main form
  let data;
  let path = pathname;
  if (path.startsWith(window.location.origin) && !path.includes('.json')) {
    if (path.endsWith('.html')) {
      path = path.substring(0, path.lastIndexOf('.html'));
    }
    path += '/jcr:content/root/section/form.html';
  }
  let resp = await fetch(path);

  if (resp?.headers?.get('Content-Type')?.includes('application/json')) {
    data = await resp.json();
  } else if (resp?.headers?.get('Content-Type')?.includes('text/html')) {
    resp = await fetch(path);
    data = await resp.text().then((html) => {
      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        if (doc) {
          return extractFormDefinition(doc.body).formDef;
        }
        return doc;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Unable to fetch form definition for path', pathname, path);
        return null;
      }
    });
  }
  return data;
}

function addRequestContextToForm(formDef) {
  if (formDef && typeof formDef === 'object') {
    formDef.properties = formDef.properties || {};

    // Add URL parameters
    try {
      const urlParams = new URLSearchParams(window?.location?.search || '');
      if (!formDef.properties.queryParams) {
        formDef.properties.queryParams = {};
      }
      urlParams?.forEach((value, key) => {
        formDef.properties.queryParams[key?.toLowerCase()] = value;
      });
    } catch (e) {
      console.warn('Error reading URL parameters:', e);
    }

    // Add cookies
    try {
      const cookies = document?.cookie.split(';');
      formDef.properties.cookies = {};
      cookies?.forEach((cookie) => {
        if (cookie.trim()) {
          const [key, value] = cookie.trim().split('=');
          formDef.properties.cookies[key.trim()] = value || '';
        }
      });
    } catch (e) {
      console.warn('Error reading cookies:', e);
    }
  }
}

export default async function decorate(block) {
  let container = block.querySelector('a[href]');
  let formDef;
  let pathname;
  if (container) {
    ({ pathname } = new URL(container.href));
    formDef = await fetchForm(container.href);
  } else {
    ({ container, formDef } = extractFormDefinition(block));
  }
  let source = 'aem';
  let rules = true;
  let form;
  if (formDef) {
    const submitProps = formDef?.properties?.['fd:submit'];
    const actionType = submitProps?.actionName || formDef?.properties?.actionType;
    const spreadsheetUrl = submitProps?.spreadsheet?.spreadsheetUrl
      || formDef?.properties?.spreadsheetUrl;

    if (actionType === 'spreadsheet' && spreadsheetUrl) {
      // Check if we're in an iframe and use parent window path if available
      const iframePath = window.frameElement ? window.parent.location.pathname
        : window.location.pathname;
      formDef.action = SUBMISSION_SERVICE + btoa(pathname || iframePath);
    } else {
      formDef.action = getSubmitBaseUrl() + (formDef.action || '');
    }
    if (isDocumentBasedForm(formDef)) {
      const transform = new DocBasedFormToAF();
      formDef = transform.transform(formDef);
      source = 'sheet';
      const response = await createForm(formDef);
      form = response?.form;
      const docRuleEngine = await import('./rules-doc/index.js');
      docRuleEngine.default(formDef, form);
      rules = false;
    } else {
      afModule = await import('./rules/index.js');
      addRequestContextToForm(formDef);
      if (afModule && afModule.initAdaptiveForm && !block.classList.contains('edit-mode')) {
        form = await afModule.initAdaptiveForm(formDef, createForm);
      } else {
        form = await createFormForAuthoring(formDef);
      }
    }
    form.dataset.redirectUrl = formDef.redirectUrl || '';
    form.dataset.thankYouMsg = formDef.thankYouMsg || '';
    form.dataset.action = formDef.action || pathname?.split('.json')[0];
    form.dataset.source = source;
    form.dataset.rules = rules;
    form.dataset.id = formDef.id;
    if (source === 'aem' && formDef.properties && formDef.properties['fd:path']) {
      form.dataset.formpath = formDef.properties['fd:path'];
    }
    container.replaceWith(form);
  }
}
