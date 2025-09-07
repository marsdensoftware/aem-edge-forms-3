declare global {
  /* eslint-disable-next-line no-unused-vars */
  interface Window {
    searchInput?: HTMLInputElement;
    suggestionsDiv?: HTMLElement;
  }
}

interface El extends Element {
  dataset: {
    datasource: string[]
  }
}

interface Field {
  [key: string]: any
  properties: {
    datasource: string[]
    [key: string]: any
  }
}

function addSuggestionDiv() {
  const el = document.createElement('div')
  el.classList.add('suggestions')

  return el
}

const datasources = {
  courses: [
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
  ],
  languages: ['Te Reo Māori', 'French', 'German', 'Portuguese', 'Hebrew'],
  occupations: [
    'Software Developer',
    'Primary School Teacher',
    'Registered Nurse',
    'Electrician',
    'Construction Project Manager',
    'Chef',
    'General Practitioner (GP)',
    'Mechanical Engineer',
    'Retail Sales Assistant',
    'Truck Driver (General)',
  ],
  skills: [
    'Communicate effectively in English',
    'Apply health and safety standards',
    'Work in a team',
    'Use digital collaboration tools',
    'Operate machinery safely',
    'Provide customer service',
    'Interpret technical drawings',
    'Manage time effectively',
    'Use accounting software',
    'Adapt to changing work environments',
  ],
};

// Optional: Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (window.searchInput
    && !window.searchInput.contains(e.target as Element)
    && window.suggestionsDiv) {
    window.suggestionsDiv.innerHTML = ''
    window.suggestionsDiv.style.display = 'none'
  }

  const el = e.target as HTMLElement;

  if (el.classList.contains('typeahead__icon') && el.closest('.typeahead')?.classList.contains('has-input')) {
    const inputEl = el.closest('.typeahead')?.querySelector('input[type="text"]') as HTMLInputElement
    if (inputEl) {
      inputEl.value = ''
    }
    el.closest('.typeahead')?.classList.remove('has-input')
  }
})

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

document.addEventListener('input', (event) => {
  const element = (event.target as Element).closest('.typeahead') as HTMLElement
  if (element) {
    const searchInput = element.querySelector('input[type="text"]') as HTMLInputElement
    window.searchInput = searchInput
    const query = searchInput.value.toLowerCase()

    // Minimum 4 chars
    if (query.length < 4) {
      return
    }

    const suggestionsDiv = element.querySelector('.suggestions') as HTMLElement
    if (!suggestionsDiv) {
      return
    }
    window.suggestionsDiv = suggestionsDiv
    suggestionsDiv.innerHTML = ''

    const { datasource } = element.dataset
    const entries = datasources[datasource as keyof typeof datasources]

    const filtered = entries.filter((entry) => entry.toLowerCase().includes(query))

    filtered.forEach((item) => {
      const div = document.createElement('div')
      div.classList.add('suggestion')
      div.textContent = item
      div.addEventListener('click', () => {
        searchInput.value = item
        suggestionsDiv.innerHTML = ''
        suggestionsDiv.style.display = 'none'
        const customEvent = new Event('change', { bubbles: true })
        searchInput.dispatchEvent(customEvent)
      })
      suggestionsDiv.appendChild(div)
    })

    if (filtered.length > 0) {
      suggestionsDiv.style.display = 'block'
    }
  }
})

export default function decorate(element: El, field: Field) {
  const { datasource } = field.properties

  element.classList.add('typeahead')
  element.dataset.datasource = datasource

  // Moved input into container so we can attached icon input
  const inputEl = element.querySelector('input')
  const container = document.createElement('div')
  const iconEl = document.createElement('span');
  iconEl.classList.add('typeahead__icon')

  container.className = 'typeahead__input'

  if (inputEl && inputEl.parentNode) {
    inputEl.parentNode.insertBefore(container, inputEl);
    container.appendChild(inputEl)
    container.append(iconEl)
  }

  // Add suggestion div
  const suggestionsDiv = addSuggestionDiv()
  container.appendChild(suggestionsDiv)

  return element
}
