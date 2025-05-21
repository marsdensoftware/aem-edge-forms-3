function addSuggestionDiv() {
    const el = document.createElement('div');
    el.classList.add('suggestions');

    return el;
}
export default function decorate(element, field, container) {
    const entries = [
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

    element.classList.add('course', 'text-wrapper__icon-search');

    // add suggestion div
    const suggestionsDiv = addSuggestionDiv();
    const searchInput = element.querySelector('input[type="text"]');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();

        suggestionsDiv.innerHTML = "";

        // Minimum 4 chars
        if (query.length < 4) {
            return;
        }

        const filtered = entries.filter(entry => entry.toLowerCase().includes(query));

        filtered.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("suggestion");
            div.textContent = item;
            div.addEventListener("click", () => {
                searchInput.value = item;
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
            });
            suggestionsDiv.appendChild(div);
        });

        if (filtered.length > 0) {
            suggestionsDiv.style.display = 'block';
        }
    });

    // Optional: Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
            suggestionsDiv.innerHTML = '';
            suggestionsDiv.style.display = 'none';
        }
    });

    return element;
}
