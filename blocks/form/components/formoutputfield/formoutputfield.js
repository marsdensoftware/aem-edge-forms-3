import { onElementAdded, DefaultFieldConverter } from '../utils.js'

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
    const form = connectedEl.closest('form');

    // Function to update the display
    function updateDisplay() {
      const nameValues = new DefaultFieldConverter().convert(form, fieldName);
      outputEl.innerHTML = '';

      if (nameValues[fieldName] && nameValues[fieldName].value) {
        nameValues[fieldName].values = [nameValues[fieldName].value];
        nameValues[fieldName].displayValues = [nameValues[fieldName].displayValue];

        delete nameValues[fieldName].value;
        delete nameValues[fieldName].displayValue;
      }

      if (nameValues[fieldName].values) {
        const output = renderFunction(nameValues[fieldName].displayValues);

        outputEl.append(output);
      } else {
        connectedEl.dataset.visible = false;
      }
    }

    // Listen for input events on the form (event delegation)
    form.addEventListener('change', (e) => {
      if (e.target.name === fieldName) {
        updateDisplay();
      }
    });
  });

  return el;
}
