function addSuggestionDiv() {
    const el = document.createElement('div');
    el.classList.add('suggestions');
    return el;
}
function addSelectedCardsDiv(headingText, emptySelectionMessage) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('selected-cards-wrapper');
    const heading = document.createElement('div');
    heading.classList.add('selected-cards-heading');
    heading.textContent = headingText || 'Selected items';
    wrapper.appendChild(heading);
    const cardsDiv = document.createElement('div');
    cardsDiv.classList.add('selected-cards');
    cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage;
    wrapper.appendChild(cardsDiv);
    return wrapper;
}
function createSelectedCard(item, selectedCardsDiv, searchInput) {
    const card = document.createElement('div');
    card.classList.add('selected-card');
    const text = document.createElement('div');
    text.textContent = item;
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('selected-card__button-remove');
    removeBtn.setAttribute('aria-label', `Remove ${item}`);
    removeBtn.innerHTML = `<span>Remove ${item}</span>`;
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
/*

- Search icon missed align
- Subtitle need to move up (add any location...)
- Optional coming from data-require attr boolean
- Heading needs to be above checkboxes

*/
const courses = [
    'Marketing management',
    'Financial management',
    'Financial statements',
    'Business process modelling',
    'Company policies',
    'Develop company strategies',
    'Plan medium to long term objectives',
    'Define organisational standards',
    'Assume responsibility for the management of a business',
    'Build trust',
];
const languages = ['Te Reo', 'French', 'German', 'Portuguese', 'Hebrew'];
const userLocations = ['Auckland', 'Wellington', 'Christchurch'];
const skills = [
    'Communicate effectively in English',
    'Apply health and safety standards',
    'Work in a team',
    'Use digital collaboration tools',
    'Operate machinery safely',
    'Provide customer service',
    'Interpret technical drawings',
    'Manage time effectively',
    'Use accounting software',
    'Adapt to changing work environments'
];
const datasources = {
    courses,
    languages,
    userLocations,
    skills,
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
        const { datasource } = element.dataset;
        const entries = datasources[datasource];
        const selectedCardsDiv = element.querySelector('.selected-cards');
        const filtered = entries.filter((entry) => entry.toLowerCase().includes(query) &&
            !Array.from(selectedCardsDiv.children).some((card) => card.firstChild.textContent === entry));
        filtered.forEach((item) => {
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
export default function decorate(element, field) {
    const { datasource } = field.properties;
    const selectionLabel = field.properties['selection-label'];
    const emptySelectionMessage = field.properties['empty-selection-message'];
    element.classList.add('search-box');
    element.dataset.datasource = datasource;
    // Moved input into container so we can attached icon input
    const inputEl = element.querySelector('input');
    const container = document.createElement('div');
    container.className = 'search-box__input';
    container.id = 'search-box__input';
    if (inputEl) {
        container.appendChild(inputEl);
    }
    element.appendChild(container);
    // Add suggestion div
    const suggestionsDiv = addSuggestionDiv();
    // Add selected cards container
    const selectedCardsDiv = addSelectedCardsDiv(selectionLabel, emptySelectionMessage);
    element.appendChild(selectedCardsDiv);
    container.appendChild(suggestionsDiv);
    return element;
}
