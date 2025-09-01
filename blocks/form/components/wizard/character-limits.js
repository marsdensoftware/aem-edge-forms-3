import { onElementsAddedByClassName } from '../utils.js'

onElementsAddedByClassName('wizard', (wizardEl) => {
  function ensureTicker(input) {
    let ticker = input.parentElement.querySelector('.field-ticker');

    if (!ticker) {
      ticker = document.createElement('div');
      ticker.classList.add('field-ticker');

      input.parentElement.append(ticker);
    }

    return ticker;
  }

  const form = wizardEl.closest('form');

  ['input', 'change'].forEach((eventName) => {
    form.addEventListener(eventName, (e) => {
      const input = e.target;
      const { maxLength } = input;

      if (!maxLength || maxLength < 0) {
        return;
      }

      const { value } = input;
      let remaining = maxLength - value.length;

      // Prevent exceeding maxLength (extra safeguard)
      if (value.length > maxLength) {
        input.value = value.substring(0, maxLength);
        remaining = 0;
      }

      const ticker = ensureTicker(input);

      let text = input.closest('.field-wrapper').dataset.maxRemainingCharsMessage || '{remaining} characters remaining';
      text = text.replace('{remaining}', remaining);

      // Show ticker after 90% of max length
      if (value.length >= maxLength * 0.9) {
        ticker.style.display = 'block';
        ticker.textContent = text;
        ticker.classList.toggle('red', remaining === 0);
      } else {
        ticker.style.display = 'none';
      }

      // Always scroll to right so last input is visible
      input.scrollLeft = input.scrollWidth;
    });
  });
});
