class Typeahead {
    static datasources = {
        courses: [
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
        ],
        languages: ['Te Reo', 'French', 'German', 'Portuguese', 'Hebrew']
    };

    constructor(element, datasourceKey) {
        this.element = element;
        this.datasource = Typeahead.datasources[datasourceKey] || [];
        this.input = this.element.querySelector('input[type="text"]');
        this.suggestionsDiv = this._createSuggestionsDiv();

        this._init();
    }

    _init() {
        this.element.classList.add('typeahead', 'text-wrapper__icon-search');
        this.element.appendChild(this.suggestionsDiv);

        this._bindEvents();
    }

    _createSuggestionsDiv() {
        const div = document.createElement('div');
        div.classList.add('suggestions');
        return div;
    }

    _bindEvents() {
        this.input.addEventListener('input', () => this._onInput());
        this.input.addEventListener('change', () => this._onChange());

        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this._clearSuggestions();
            }
        });
    }

    _onInput() {
        const query = this.input.value.trim().toLowerCase();

        if (query.length < 4) {
            this._clearSuggestions();
            return;
        }

        const matches = this.datasource.filter(item =>
            item.toLowerCase().includes(query)
        );

        this._renderSuggestions(matches);
    }

    _onChange() {
        const value = this.input.value;
        const isValid = this.datasource.includes(value);

        const validationEvent = new CustomEvent(`typeahead:${isValid ? 'valid' : 'invalid'}`, {
            bubbles: true
        });

        this.input.dispatchEvent(validationEvent);
    }

    _renderSuggestions(matches) {
        this.suggestionsDiv.innerHTML = '';

        if (matches.length === 0) {
            this._clearSuggestions();
            return;
        }

        matches.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('suggestion');
            div.textContent = item;
            div.addEventListener('click', () => this._selectSuggestion(item));
            this.suggestionsDiv.appendChild(div);
        });

        this.suggestionsDiv.style.display = 'block';
    }

    _selectSuggestion(item) {
        this.input.value = item;
        this._clearSuggestions();
        this.input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    _clearSuggestions() {
        this.suggestionsDiv.innerHTML = '';
        this.suggestionsDiv.style.display = 'none';
    }
}

// Example usage:
export default function decorate(element, field) {
    const datasourceKey = field.properties.datasource;
    return new Typeahead(element, datasourceKey);
}
