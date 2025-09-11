import { onElementsAddedByClassName } from '../utils.js'

onElementsAddedByClassName('field-cb-english-proficiency', (fieldEl) => {
  fieldEl.addEventListener('change', (e) => {
    // Can't speak or understand english
    if (e.target.checked) {
      if (e.target.value === '4') {
        // Reset other values
        fieldEl.querySelectorAll('input:not([value="4"])').forEach((item) => {
          item.checked = false;
        });
      } else {
        // reset option 4
        fieldEl.querySelector('input[value="4"]').checked = false;
      }
    }
  });
});
