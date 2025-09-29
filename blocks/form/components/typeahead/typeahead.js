/*eslint-disable*/
import { fetchRemoteSuggestions, SUGGESTION_LIMIT } from '../refdatautils.js';
function addSuggestionDiv() {
    const el = document.createElement('div');
    el.classList.add('suggestions');
    return el;
}
// Optional: Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    var _a, _b, _c;
    if (window.searchInput
        && !window.searchInput.contains(e.target)
        && window.suggestionsDiv) {
        window.suggestionsDiv.innerHTML = '';
        window.suggestionsDiv.style.display = 'none';
    }
    const el = e.target;
    if (el.classList.contains('typeahead__icon') && ((_a = el.closest('.typeahead')) === null || _a === void 0 ? void 0 : _a.classList.contains('has-input'))) {
        const inputEl = (_b = el.closest('.typeahead')) === null || _b === void 0 ? void 0 : _b.querySelector('input[type="text"]');
        if (inputEl) {
            inputEl.value = '';
        }
        (_c = el.closest('.typeahead')) === null || _c === void 0 ? void 0 : _c.classList.remove('has-input');
    }
});
/*
document.addEventListener('change', (event) => {
  const element = (event.target as Element).closest('.typeahead') as HTMLElement
  if (element) {
    const { datasource } = element.dataset
    const entries = datasources[datasource as keyof typeof datasources]
    const searchInput = element.querySelector('input[type="text"]') as HTMLInputElement
    const { value } = searchInput

    if (!entries.includes(value)) {
      // Dispatch custom event
      const customEvent = new CustomEvent('typeahead:invalid', {
        detail: {},
        bubbles: true,
      })
      searchInput.dispatchEvent(customEvent)

      customEvent.preventDefault()
    } else {
      // Dispatch custom event
      const customEvent = new CustomEvent('typeahead:valid', {
        detail: {},
        bubbles: true,
      })
      searchInput.dispatchEvent(customEvent)
    }

    if (value && value.trim().length > 0) {
      element.classList.add('has-input');
    } else {
      element.classList.remove('has-input');
    }
  }
})
*/
// Per-instance abort controller to avoid races
const typeaheadAbortMap = new WeakMap();
document.addEventListener('input', (event) => {
    const element = event.target.closest('.typeahead');
    if (element) {
        const searchInput = element.querySelector('input[name="text"]');
        window.searchInput = searchInput;
        const query = searchInput.value.toLowerCase();
        // Minimum 3 chars
        if (query.length < 3) {
            return;
        }
        const suggestionsDiv = element.querySelector('.suggestions');
        if (!suggestionsDiv) {
            return;
        }
        window.suggestionsDiv = suggestionsDiv;
        suggestionsDiv.innerHTML = '';
        const category = element.dataset.datasource;
        // Cancel any in-flight request
        const prev = typeaheadAbortMap.get(element);
        if (prev) {
            try {
                prev.abort();
            }
            catch (_) { /* noop */ }
        }
        const controller = new AbortController();
        typeaheadAbortMap.set(element, controller);
        fetchRemoteSuggestions(category, query, SUGGESTION_LIMIT, controller)
            .then((items) => {
            var _a;
            if (controller.signal.aborted)
                return;
            // If the user cleared the input during fetch, stop
            if (((_a = element.querySelector('input[type="text"]')) === null || _a === void 0 ? void 0 : _a.value.toLowerCase().length) < 3) {
                suggestionsDiv.style.display = 'none';
                suggestionsDiv.innerHTML = '';
                return;
            }
            items.forEach((item) => {
                // TODO: do something with the CODE as its the ID from the reference data and
                console.log(`typeahead reference search result:  ${item}`);
                const div = document.createElement('div');
                div.classList.add('suggestion');
                div.textContent = item.description;
                div.addEventListener('click', () => {
                    searchInput.value = item.description;
                    suggestionsDiv.innerHTML = '';
                    suggestionsDiv.style.display = 'none';
                    const customEvent = new CustomEvent('typeahead:valid', { bubbles: true, detail: item });
                    searchInput.dispatchEvent(customEvent);
                });
                suggestionsDiv.appendChild(div);
            });
            if (items.length > 0) {
                suggestionsDiv.style.display = 'block';
            }
            else {
                suggestionsDiv.style.display = 'none';
            }
        })
            .catch((err) => {
            if ((err === null || err === void 0 ? void 0 : err.name) === 'AbortError')
                return;
            suggestionsDiv.style.display = 'none';
            suggestionsDiv.innerHTML = '';
            console.error(err);
        });
    }
});
export default function decorate(element, field) {
    const { datasource } = field.properties;
    element.classList.add('typeahead');
    element.dataset.datasource = datasource;
    // Moved input into container so we can attached icon input
    const inputEl = element.querySelector('input');
    const container = document.createElement('div');
    const iconEl = document.createElement('span');
    iconEl.classList.add('typeahead__icon');
    container.className = 'typeahead__input';
    if (inputEl && inputEl.parentNode) {
        inputEl.parentNode.insertBefore(container, inputEl);
        container.appendChild(inputEl);
        container.append(iconEl);
    }
    // Add suggestion div
    const suggestionsDiv = addSuggestionDiv();
    container.appendChild(suggestionsDiv);
    return element;
}
