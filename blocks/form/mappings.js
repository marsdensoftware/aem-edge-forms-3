import { loadCSS } from '../../scripts/aem.js'

let customComponents = [
  'radio-group',
  'formhero',
  'formwelcome',
  'formcontextualhelp',
  'formoutputfield',
  'typeahead',
  'repeatable-panel',
  'formtabs',
  'education',
  'languagepanel',
  'workexperience',
  'driverlicence',
  'advanceddatepicker',
  'summary',
  'search-box',
  'icon-radio-group',
  'extended-checkbox',
  'extended-checkbox-container',
  'range',
  'toast',
  'toast-container',
]

const OOTBComponentDecorators = [
  'file-input',
  'wizard',
  'modal',
  'tnc',
  'toggleable-link',
  'rating',
  'datetime',
  'list',
  'location',
  'accordion',
  'password',
  'file',
  'repeat',
]

export function setCustomComponents(components) {
  customComponents = components;
}

export function getOOTBComponents() {
  return OOTBComponentDecorators;
}

export function getCustomComponents() {
  return customComponents;
}

/**
 * Loads a component from the components directory
 * @param {string} componentName - The name of the component to load
 * @param {HTMLElement} element - The DOM element to decorate
 * @param {Object} fd - The form definition object
 * @param {HTMLElement} container - The container element
 * @param {string} formId - The form ID
 * @returns {Promise<HTMLElement>} The decorated element
 */
// ### SEP-NJ: Map to keep track of loaded scripts
const map = {};

async function loadComponent(componentName, element, fd, container, formId) {
  const status = element.dataset.componentStatus;
  if (status !== 'loading' && status !== 'loaded') {
    element.dataset.componentStatus = 'loading';
    const { blockName } = element.dataset;

    // ### SEP-NJ: Start load script only once
    if (map[componentName]) {
      await map[componentName](element, fd, container, formId);
      element.dataset.componentStatus = 'loaded';
      return element;
    }
    // ### SEP-NJ: End

    try {
      loadCSS(`${window.hlx.codeBasePath}/blocks/form/components/${componentName}/${componentName}.css`);
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(
              `${window.hlx.codeBasePath}/blocks/form/components/${componentName}/${componentName}.js`
            );
            if (mod.default) {
              map[componentName] = mod.default;
              await mod.default(element, fd, container, formId);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log(`failed to load component for ${blockName}`, error)
            console.log('component details: ', {
              componentName, blockName, fdId: fd?.id, fdName: fd?.name, fdItems: fd?.items,
            })
          }
          resolve();
        })();
      });
      await Promise.all([decorationComplete]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`failed to load component ${blockName}`, error);
      console.log('component details: ', {
        componentName, blockName, fdId: fd?.id, fdName: fd?.name, fdItems: fd?.items,
      })
    }
    element.dataset.componentStatus = 'loaded';
  }
  return element;
}

/**
 * returns a decorator to decorate the field definition
 *
 * */
export default async function componentDecorator(element, fd, container, formId) {
  const { ':type': type = '', fieldType } = fd;
  if (fieldType === 'file-input') {
    await loadComponent('file', element, fd, container, formId);
  }

  if (type.endsWith('wizard')) {
    await loadComponent('wizard', element, fd, container, formId);
  }

  if (getCustomComponents().includes(type) || getOOTBComponents().includes(type)) {
    await loadComponent(type, element, fd, container, formId);
  }

  return null;
}
