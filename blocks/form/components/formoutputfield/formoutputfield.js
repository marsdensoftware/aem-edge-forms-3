import { onElementAdded } from '../utils.js'

const renderers = {
  'list': function(values) {
    const result = document.createElement('ul');
    values.forEach(value => {
      const li = document.createElement('li');
      li.textContent = value;
      result.appendChild(li);
    });

    return result;
  }
};

export default function decorate(el, fd) {
  const titleEl = document.createElement('h6');
  const { fieldName, renderer = 'list' } = fd.properties;
  const title = fd.label?.value;
  const renderFunction = renderers[renderer];

  titleEl.innerHTML = title;

  el.append(titleEl);

  const outputEl = document.createElement('div');
  el.append(outputEl);

  onElementAdded(el).then((connectedEl) => {

    const form = connectedEl.closest('form');

    // Listen for input events on the form (event delegation)
    form.addEventListener('change', function(e) {
      if (e.target.name == fieldName) {
        updateDisplay();
      }
    });

    // Function to update the display
    function updateDisplay() {
      const values = Array.from(form.querySelectorAll(`input[name="${fieldName}"]`))
        .map(input => input.value.trim())
        .filter(value => value !== '');

      const output = renderFunction(values);

      outputEl.innerHTML = '';
      outputEl.append(output);
    }
  });

  return el;
}

