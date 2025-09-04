import { onElementAdded, DefaultFieldConverter, waitForVar } from '../utils.js'

const renderers = {
  list: (values) => {
    const result = document.createElement('ul');
    values.forEach((value) => {
      const li = document.createElement('li');
      li.textContent = value;
      result.appendChild(li);
    });

    return result;
  },
};

export default function decorate(el, fd) {
  const titleEl = document.createElement('h6');
  const { fieldName, renderer = 'list' } = fd.properties;
  const title = fd.label?.value;
  const renderFunction = renderers[renderer];

  titleEl.innerHTML = title;

  el.append(titleEl);
  el.classList.add('formoutputfield');

  const outputEl = document.createElement('div');
  el.append(outputEl);

  onElementAdded(el).then((connectedEl) => {
    connectedEl.closest('form');
    const values = {};

    // Function to update the display
    function updateDisplay() {
      outputEl.innerHTML = '';

      const displayValues = Object.values(values).map(
        (val) => val.displayValue || val.displayValues,
      );

      if (displayValues.length > 0) {
        const output = renderFunction(displayValues);

        outputEl.append(output);
      } else {
        connectedEl.dataset.visible = false;
      }
    }

    (async () => {
      const myForm = await waitForVar('myForm');

      // Subscribe to fieldChanged event on the form datamodel
      myForm.subscribe((e) => {
        const { field } = e.payload;
        if (field.name === fieldName) {
          const dataModel = window.myForm.getElement(field.id);
          values[field.id] = new DefaultFieldConverter().convertSingle(dataModel);
          updateDisplay();
        }
      }, 'fieldChanged');
    })();
  });

  return el;
}
