import { createButton } from '../../util.js';
import { i18n } from '../../../../i18n/index.js';
import './set-background-by-step.js';
import './character-limits.js'
import './english-proficiency.js'

export class WizardLayout {
  inputFields = 'input,textarea,select';

  constructor(includePrevBtn = true, includeNextBtn = true) {
    this.includePrevBtn = includePrevBtn;
    this.includeNextBtn = includeNextBtn;
  }

  // eslint-disable-next-line class-methods-use-this
  getSteps(panel) {
    return [...panel.children].filter((step) => step.tagName.toLowerCase() === 'fieldset');
  }

  assignIndexToSteps(panel) {
    const steps = this.getSteps(panel);
    panel.style.setProperty('--wizard-step-count', steps.length);
    steps.forEach((step, index) => {
      step.dataset.index = index;
      step.style.setProperty('--wizard-step-index', index);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getEligibleSibling(current, forward = true) {
    const direction = forward ? 'nextElementSibling' : 'previousElementSibling';

    for (let sibling = current[direction]; sibling; sibling = sibling[direction]) {
      if (sibling.dataset.visible !== 'false' && sibling.tagName === 'FIELDSET') {
        return sibling;
      }
    }
    return null;
  }

  /**
 * @param {FormElement | Fieldset} container
 * @returns return false, if there are invalid fields
 */
  validateContainer(container) {
    const fieldElements = [...container.querySelectorAll(this.inputFields)];
    const isValid = fieldElements.reduce((valid, fieldElement) => {
      const isHidden = fieldElement.closest('.field-wrapper')?.dataset?.visible === 'false';
      let isFieldValid = true;
      if (!isHidden) {
        isFieldValid = fieldElement.checkValidity();
      }
      return valid && isFieldValid;
    }, true);

    if (!isValid) {
      container.querySelector(':invalid')?.focus();
    }
    return isValid;
  }

  navigate(panel, forward = true) {
    const current = panel.querySelector('.current-wizard-step');
    const currentMenuItem = panel.querySelector('.wizard-menu-active-item');

    let valid = true;
    if (forward) {
      valid = this.validateContainer(current);
    }
    const navigateTo = valid ? this.getEligibleSibling(current, forward) : current;

    if (navigateTo && current !== navigateTo) {
      current.classList.remove('current-wizard-step');
      navigateTo.classList.add('current-wizard-step');
      // add/remove active class from menu item
      const navigateToMenuItem = panel.querySelector(`li[data-index="${navigateTo.dataset.index}"]`);
      currentMenuItem.classList.remove('wizard-menu-active-item');
      navigateToMenuItem.classList.add('wizard-menu-active-item');

      // ###SEP-NJ remember last step
      const stepNameField = panel.querySelector('input[name="stepname"]');
      if (stepNameField) {
        stepNameField.value = navigateTo.name;
      }

      // ###SEP-NJ End
      const event = new CustomEvent('wizard:navigate', {
        detail: {
          prevStep: { id: current.id, index: +current.dataset.index },
          currStep: { id: navigateTo.id, index: +navigateTo.dataset.index },
        },
        bubbles: false,
      });
      panel.dispatchEvent(event);
    }
  }

  static navigateTo(panel, stepName) {
    const destination = panel.querySelector(`:scope>fieldset[name="${stepName}"]`);
    if (!destination) {
      return false;
    }

    const current = panel.querySelector('.current-wizard-step');
    const currentMenuItem = panel.querySelector('.wizard-menu-active-item');

    current.classList.remove('current-wizard-step');
    destination.classList.add('current-wizard-step');
    // add/remove active class from menu item
    const navigateToMenuItem = panel.querySelector(`li[data-index="${destination.dataset.index}"]`);
    currentMenuItem.classList.remove('wizard-menu-active-item');
    navigateToMenuItem.classList.add('wizard-menu-active-item');

    const event = new CustomEvent('wizard:navigate', {
      detail: {
        prevStep: { id: current.id, index: +current.dataset.index },
        currStep: { id: destination.id, index: +destination.dataset.index },
      },
      bubbles: true,
    });

    panel.dispatchEvent(event);

    return true;
  }

  static handleMutation(panel, mutationsList) {
    mutationsList.forEach((mutation) => {
      const { type, target, attributeName } = mutation;
      const menuItems = panel.querySelector('.wizard-menu-items');
      // Check if the mutation is a change in attributes(data-visible)
      if (type === 'attributes' && attributeName === 'data-visible') {
        const element = mutation.target;
        const menuItem = panel.querySelector(`li[data-index="${element.dataset.index}"]`);
        menuItem.dataset.visible = element.dataset.visible;
      } else if (type === 'attributes' && attributeName === 'data-active') {
        // for active panel
        panel.querySelector('.current-wizard-step')?.classList.remove('current-wizard-step');
        const activePanel = panel.querySelector(`#${target?.id}`);
        activePanel?.classList.add('current-wizard-step');
        // for active menu item
        panel.querySelector('.wizard-menu-active-item')?.classList.remove('wizard-menu-active-item');
        menuItems.querySelector(`[data-index="${activePanel.dataset.index}"]`)?.classList.add('wizard-menu-active-item');
        target.querySelector('[data-active="true"]')?.focus();
      }
    });
  }

  static attachMutationObserver(panel) {
    const children = panel.querySelectorAll(':scope > .panel-wrapper');
    // Options for the observer (attributes to observe for)
    const config = { attributes: true, subtree: false };
    // Create an observer instance linked to the callback function
    const observer = new window.MutationObserver((mutationsList) => {
      WizardLayout.handleMutation(panel, mutationsList);
    });
    // Start observing each target node for configured mutations
    children.forEach((targetNode) => {
      observer.observe(targetNode, config);
    });
  }

  static createMenu(children) {
    const ul = document.createElement('ul');
    ul.className = 'wizard-menu-items';
    children.forEach((child, index) => {
      const li = document.createElement('li');
      li.innerHTML = child.querySelector('legend')?.innerHTML || '';
      li.className = 'wizard-menu-item';
      li.dataset.index = index;
      if (child.hasAttribute('data-visible')) {
        li.dataset.visible = child.dataset.visible;
      }
      ul.append(li);
    });
    return ul;
  }

  addButton(wrapper, panel, buttonDef, forward = true) {
    const button = createButton(buttonDef);
    button.classList.add(buttonDef.id);
    button.addEventListener('click', () => this.navigate(panel, forward));
    wrapper.append(button);
  }

  applyLayout(panel) {
    const children = panel.querySelectorAll(':scope > .panel-wrapper');
    if (children.length) {
      // create wizard menu
      const wizardMenu = WizardLayout.createMenu(Array.from(children));
      wizardMenu.querySelector('li').classList.add('wizard-menu-active-item');
      // Insert the menu before the first child of the wizard
      panel.insertBefore(wizardMenu, children[0]);
      WizardLayout.attachMutationObserver(panel);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'wizard-button-wrapper';
    if (this.includePrevBtn && children.length) {
      this.addButton(wrapper, panel, {
        label: { value: 'Back' }, fieldType: 'button', name: 'back', id: 'wizard-button-prev',
      }, false);
    }

    if (this.includeNextBtn && children.length) {
      this.addButton(wrapper, panel, {
        label: { value: 'Next' },
        fieldType: 'button',
        name: 'next',
        id: 'wizard-button-next',
      })
    }

    const resetBtn = panel.querySelector('.reset-wrapper')
    if (resetBtn) {
      wrapper.append(resetBtn)
    }

    const submitBtn = panel.querySelector('.submit-wrapper')
    if (submitBtn) {
      wrapper.append(submitBtn)
    }
    this.assignIndexToSteps(panel)
    panel.append(wrapper)
    panel.querySelector('fieldset')?.classList.add('current-wizard-step')
    panel.classList.add('wizard')
    // panel.classList.add('left');
  }

  init(panel) {
    // Add save button to go back to the calling page/step after save
    const def = {
      label: { value: i18n('Save changes') }, fieldType: 'button', name: 'save-changes', id: 'wizard-button-save-changes',
    };

    const saveBtn = createButton(def);
    saveBtn.classList.add(def.id);

    panel.querySelector('.wizard-button-wrapper').append(saveBtn);

    saveBtn.addEventListener('click', () => {
      // Save changes and go to the point of origin or review panel_summary
      const stepEl = panel.querySelector('.current-wizard-step');

      if (this.validateContainer(stepEl)) {
        const hash = window.location.hash.substring(1); // remove "#"
        const params = new URLSearchParams(hash);
        const returnTo = params.get('returnTo');

        switch (returnTo) {
        case 'homepage':
          window.location.href = 'https://www.google.com'
          break;
        default:
          WizardLayout.navigateTo(panel, 'panel_review');
          break;
        }

        panel.classList.remove('single-step');
      }
    });

    const stepNameField = panel.querySelector('input[name="stepname"]');

    if (stepNameField) {
      stepNameField.addEventListener('change', () => {
        const stepName = stepNameField.value;
        WizardLayout.navigateTo(panel, stepName);
      });
    }

    function navigateByHash() {
      const hash = window.location.hash.substring(1); // remove "#"
      const params = new URLSearchParams(hash);
      const stepName = params.get('step');
      if (stepName) {
        if (stepNameField) {
          stepNameField.value = stepName;
        }

        if (stepName === 'panel_review') {
          return;
        }

        if (WizardLayout.navigateTo(panel, stepName)) {
          panel.classList.add('single-step');
        }
      }
    }

    // Init from hash
    navigateByHash();

    window.addEventListener('hashchange', () => {
      navigateByHash();
    });
  }
}

const layout = new WizardLayout();

export default function wizardLayout(panel) {
  layout.applyLayout(panel);
  // ###SEP-NJ init wizard
  layout.init(panel);
  return panel;
}

export const navigate = layout.navigate.bind(layout);
export const validateContainer = layout.validateContainer.bind(layout);
