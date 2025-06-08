class Typeahead {

    static MINIMUM_CHARS = 4;
    static datasources = {
        courses: [
            { text: 'Marketing management', value: 1 },
            { text: 'Financial management', value: 2 },
            { text: 'Financial statements', value: 3 },
            { text: 'Business process modelling', value: 4 },
            { text: 'Company policies', value: 5 },
            { text: 'Develop company strategies', value: 6 },
            { text: 'Plan medium to long term objectives', value: 7 },
            { text: 'Define organisational standards', value: 8 },
            { text: 'Assume responsibility for the management of a business', value: 9 },
            { text: 'Build trust', value: 10 }
        ],
        languages: [
            { text: 'Te Reo', value: 1 },
            { text: 'French', value: 2 },
            { text: 'German', value: 3 },
            { text: 'Portuguese', value: 4 },
            { text: 'Hebrew', value: 5 }
        ],
        occupations: [
            { text: 'Software Developer', value: 1 },
            { text: 'Primary School Teacher', value: 2 },
            { text: 'Registered Nurse', value: 3 },
            { text: 'Electrician', value: 4 },
            { text: 'Construction Project Manager', value: 5 },
            { text: 'Chef', value: 6 },
            { text: 'General Practitioner (GP)', value: 7 },
            { text: 'Mechanical Engineer', value: 8 },
            { text: 'Retail Sales Assistant', value: 9 },
            { text: 'Truck Driver (General)', value: 10 }
        ],
        skills: [
            { text: 'Communicate effectively in English', value: 1 },
            { text: 'Apply health and safety standards', value: 2 },
            { text: 'Work in a team', value: 3 },
            { text: 'Use digital collaboration tools', value: 4 },
            { text: 'Operate machinery safely', value: 5 },
            { text: 'Provide customer service', value: 6 },
            { text: 'Interpret technical drawings', value: 7 },
            { text: 'Manage time effectively', value: 8 },
            { text: 'Use accounting software', value: 9 },
            { text: 'Adapt to changing work environments', value: 10 }
        ]
    };

    constructor(el, datasource) {
        this.el = el;
        this.el.classList.add('typeahead', 'text-wrapper__icon-search', 'text-wrapper');
        this.el.classList.remove('drop-down-wrapper');
        this.el.dataset.datasource = datasource;
        this.datasource = datasource;
        this.entries = Typeahead.datasources[this.datasource];
        this.select = this.el.querySelector('select');

        // create input
        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.name = `${this.select.name}-input`;
        this.input.placeholder = this.select.querySelector('option[disabled]')?.textContent || '';

        // Optionally add it to a container
        this.el.appendChild(this.input);

        // Add suggestion div
        this.addSuggestionsDiv();
        this.populateOptions();

        this.bindEvents();
    }

    findByText(searchText) {
        return this.entries.filter(entry =>
            entry.text.toLowerCase().includes(searchText.toLowerCase())
        );
    }

    addSelection(item) {
        this.input.value = item.text;
        this.suggestionsDiv.innerHTML = '';
        this.suggestionsDiv.style.display = 'none';
        const event = new Event('change', { bubbles: true });
        this.input.dispatchEvent(event);

        const option = Array.from(this.select.options).find(opt => opt.value == item.value);
        if (option) {
            option.selected = true;
        }
    }

    bindEvents() {
        // Change event
        this.input.addEventListener('change', () => {
            const searchText = this.input.value;
            const results = this.findByText(searchText);

            if (!results) {
                // Dispatch custom event
                const event = new CustomEvent('typeahead:invalid', {
                    detail: {},
                    bubbles: true,
                });
                this.input.dispatchEvent(event);

                event.preventDefault();
            }
            else {
                // Dispatch custom event
                const event = new CustomEvent('typeahead:valid', {
                    detail: {},
                    bubbles: true,
                });
                this.input.dispatchEvent(event);
            }
        });

        // Input event
        this.input.addEventListener('input', () => {
            window.searchInput = this.input;
            const searchText = this.input.value.toLowerCase();
            this.suggestionsDiv.innerHTML = '';
            // Minimum check
            if (searchText.length < Typeahead.MINIMUM_CHARS) {
                this.suggestionsDiv.style.display = 'none';
                return;
            }

            window.suggestionsDiv = this.suggestionsDiv;

            const results = this.findByText(searchText);

            results.forEach(item => {
                const div = document.createElement("div");
                div.classList.add("suggestion");
                div.textContent = item.text;
                div.addEventListener('click', () => {
                    this.addSelection(item);
                });
                this.suggestionsDiv.appendChild(div);
            });

            if (results.length > 0) {
                this.suggestionsDiv.style.display = 'block';
            }

        });
    }

    populateOptions() {
        const options = this.select.querySelectorAll('option:not([disabled])');
        // Populate from datasource
        if (options.length === 0) {
            this.entries.forEach(entry => {
                const option = document.createElement('option');
                option.value = entry.value;
                option.textContent = entry.text;
                this.select.appendChild(option);
            });
        }
        else {
            // Populate from static entries
            this.entries = [];
            options.forEach(option => {
                const entry = {
                    text: option.textContent,
                    value: option.value
                };
                this.entries.push(entry);
            });
        }
    }

    addSuggestionsDiv() {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.classList.add('suggestions');
        this.el.append(suggestionsDiv);

        this.suggestionsDiv = suggestionsDiv;
    }
}

// Optional: Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (window.searchInput && !window.searchInput.contains(e.target)) {
        window.suggestionsDiv.innerHTML = '';
        window.suggestionsDiv.style.display = 'none';
    }
});

export default function decorate(element, field) {
    const datasource = field.properties.datasource;

    new Typeahead(element, datasource);

    return element;
}
