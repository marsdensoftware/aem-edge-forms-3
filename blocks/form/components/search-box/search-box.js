function addSuggestionDiv() {
    const el = document.createElement('div');
    el.classList.add('suggestions');
    return el;
}

function addSelectedCardsDiv() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('selected-cards-wrapper');

  const heading = document.createElement('h3');
  heading.classList.add('selected-cards-heading');
  heading.textContent = 'Selected locations';
  wrapper.appendChild(heading);

  const cardsDiv = document.createElement('div');
  cardsDiv.classList.add('selected-cards');
  wrapper.appendChild(cardsDiv);

  return wrapper;

}

function createSelectedCard(item, selectedCardsDiv, searchInput) {
    const card = document.createElement('div');
    card.classList.add('selected-card');

    const text = document.createElement('div');
    text.textContent = item;

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.setAttribute('aria-label', `Remove ${item}`);
    removeBtn.textContent = '×';

    removeBtn.addEventListener('click', () => {
        card.remove();
        // Trigger a change event to update any validation
        const event = new Event('change', { bubbles: true });
        searchInput.dispatchEvent(event);
    });

    card.appendChild(text);
    card.appendChild(removeBtn);
    selectedCardsDiv.appendChild(card);
}

const courses = [
    "Marketing management",
    "Financial management",
    "Financial statements",
    "Business process modelling",
    "Company policies",
    "Develop company strategies",
    "Plan medium to long term objectives",
    "Define organisational standards",
    "Assume responsibility for the management of a business",
    "Build trust"
];

const languages = ['Te Reo', 'French', 'German', 'Portuguese', 'Hebrew'];

const datasources = {
    'courses': courses,
    'languages': languages
};

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (window.searchInput && !window.searchInput.contains(e.target)) {
        window.suggestionsDiv.innerHTML = '';
        window.suggestionsDiv.style.display = 'none';
    }
});

document.addEventListener('input', (event) => {
    const element = event.target.closest('.search-box');
    if (element) {
        const searchInput = element.querySelector('input[type="text"]');
        window.searchInput = searchInput;
        const query = searchInput.value.toLowerCase();

        if (query.length < 3) {
            return;
        }

        const suggestionsDiv = element.querySelector('.suggestions');
        window.suggestionsDiv = suggestionsDiv;
        suggestionsDiv.innerHTML = '';

        const datasource = element.dataset.datasource;
        const entries = datasources[datasource];
        const selectedCardsDiv = element.querySelector('.selected-cards');

        const filtered = entries.filter(entry =>
            entry.toLowerCase().includes(query) &&
            !Array.from(selectedCardsDiv.children)
                .some(card => card.firstChild.textContent === entry)
        );

        filtered.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('suggestion');
            div.textContent = item;
            div.addEventListener('click', () => {
                searchInput.value = '';
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
                createSelectedCard(item, selectedCardsDiv, searchInput);
            });
            suggestionsDiv.appendChild(div);
        });

        if (filtered.length > 0) {
            suggestionsDiv.style.display = 'block';
        }
    }
});

export default function decorate(element, field, container) {
    const datasource = field.properties.datasource;

    element.classList.add('search-box', 'text-wrapper__icon-search');
    element.dataset.datasource = datasource;

    // Add suggestion div
    const suggestionsDiv = addSuggestionDiv();
    element.appendChild(suggestionsDiv);

    // Add selected cards container
    const selectedCardsDiv = addSelectedCardsDiv();
    element.appendChild(selectedCardsDiv);

    return element;
}
