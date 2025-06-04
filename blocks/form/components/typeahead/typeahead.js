function addSuggestionDiv() {
    const el = document.createElement('div');
    el.classList.add('suggestions');

    return el;
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
}

// Optional: Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (window.searchInput && !window.searchInput.contains(e.target)) {
        window.suggestionsDiv.innerHTML = '';
        window.suggestionsDiv.style.display = 'none';
    }
});

document.addEventListener('change', (event) => {
    const element = event.target.closest('.typeahead');
    if (element) {
        const datasource = element.dataset.datasource;
        const entries = datasources[datasource];
        const searchInput = element.querySelector('input[type="text"]');
        const value = searchInput.value;

        if (!entries.includes(value)) {
            // Mark as invalid
            // TODO Read from dialog field configuration for required
            searchInput.setCustomValidity('Invalid input'); // Mark as invalid with a blank space
            searchInput.reportValidity();       // This shows the message (but blank space)

            // Dispatch custom event
            const event = new CustomEvent('typeahead:invalid', {
                detail: {},
                bubbles: true,
            });
            searchInput.dispatchEvent(event);

            event.preventDefault();
        }
        else {
            // Mark as valid
            searchInput.setCustomValidity('');
            // Dispatch custom event
            const event = new CustomEvent('typeahead:valid', {
                detail: {},
                bubbles: true,
            });
            searchInput.dispatchEvent(event);
        }
    }
});

document.addEventListener('input', (event) => {
    const element = event.target.closest('.typeahead');
    if (element) {
        const searchInput = element.querySelector('input[type="text"]');
        window.searchInput = searchInput;
        const query = searchInput.value.toLowerCase();

        // Minimum 4 chars
        if (query.length < 4) {
            return;
        }

        const suggestionsDiv = element.querySelector('.suggestions');
        window.suggestionsDiv = suggestionsDiv;
        suggestionsDiv.innerHTML = "";

        const datasource = element.dataset.datasource;
        const entries = datasources[datasource];

        const filtered = entries.filter(entry => entry.toLowerCase().includes(query));

        filtered.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("suggestion");
            div.textContent = item;
            div.addEventListener('click', () => {
                searchInput.value = item;
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
                const event = new Event('change', { bubbles: true });
                searchInput.dispatchEvent(event);
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

    element.classList.add('typeahead', 'text-wrapper__icon-search');
    element.dataset.datasource = datasource;

    // Add suggestion div
    const suggestionsDiv = addSuggestionDiv();
    element.append(suggestionsDiv);

    return element;
}

