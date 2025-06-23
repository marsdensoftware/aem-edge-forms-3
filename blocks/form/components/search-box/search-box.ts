function addSuggestionDiv() {
  const el = document.createElement('div')
  el.classList.add('suggestions')
  return el
}

function addSelectedCardsDiv(
  headingText: string,
  emptySelectionMessage: string,
) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('selected-cards-wrapper')

  const heading = document.createElement('div')
  heading.classList.add('selected-cards-heading')
  heading.textContent = headingText || 'Selected items'
  wrapper.appendChild(heading)

  const cardsDiv = document.createElement('div')
  cardsDiv.classList.add('selected-cards')
  cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage
  wrapper.appendChild(cardsDiv)

  return wrapper
}

function addSuggestedSkillsCardsDiv(
  headingText: string,
  emptySelectionMessage: string,
) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('suggested-skills-cards-wrapper')

  const heading = document.createElement('div')
  heading.classList.add('selected-cards-heading')
  heading.textContent = headingText || 'Suggested skills'
  wrapper.appendChild(heading)

  const cardsDiv = document.createElement('div')
  cardsDiv.classList.add('suggested-skills-cards')
  cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage
  wrapper.appendChild(cardsDiv)

  return wrapper
}

function createSelectedCard(
  item: string,
  selectedCardsDiv: HTMLDivElement,
  searchInput: HTMLInputElement,
) {
  const card = document.createElement('div')
  card.classList.add('selected-card')

  const text = document.createElement('div')
  text.textContent = item

  const removeBtn = document.createElement('button')
  removeBtn.classList.add('selected-card__button-remove')
  removeBtn.setAttribute('aria-label', `Remove ${item}`)
  removeBtn.innerHTML = `<span>Remove ${item}</span>`

  removeBtn.addEventListener('click', () => {
    card.remove()
    // Trigger a change event to update any validation
    const event = new Event('change', { bubbles: true })
    searchInput.dispatchEvent(event)
  })

  card.appendChild(text)
  card.appendChild(removeBtn)
  selectedCardsDiv.appendChild(card)
}

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
]

const languages = ['Te Reo', 'French', 'German', 'Portuguese', 'Hebrew']

const userLocations = [
  'Auckland Central (en)',
  'Blenheim (en)',
  'Cambridge (en)',
  'Dunedin (en)',
  'Gore (en)',
  'Greymouth (en)',
  'Hastings (en)',
  'Hāwera (en)',
  'Invercargill (en)',
  'Lower Hutt (en)',
  'Manukau (en)',
  'Napier (en)',
  'New Plymouth (en)',
  'North Shore (en)',
  'Porirua (en)',
  'Stratford (en)',
  'Upper Hutt (en)',
  'Waiheke Island (en)',
  'Wellington (en)',
  'Whangārei (en)',
  'Picton (en)',
  'Balclutha (en)',
  'Wairoa (en)',
  'Ōpunake (en)',
]

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
  'Adapt to changing work environments',
]

const experiencedBasedJobs = [
  'Job Title 1',
  'Job Title 2',
  'Job Title 3',
  'Job Title 4',
  'Job Title 5',
  'Job Title 6',
  'Job Title 7',
  'Job Title 8',
  'Job Title 9',
  'Job Title 10',
]

const datasources = {
  courses,
  languages,
  userLocations,
  skills,
  experiencedBasedJobs,
}

interface El extends Element {
  dataset: {
    datasource: string[]
    suggestedSkillsDatasource?: string[]
  }
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  const searchInput = (window as any).searchInput as HTMLElement
  const suggestionsDiv = (window as any).suggestionsDiv as HTMLElement
  if (searchInput && !searchInput.contains(e.target as Node)) {
    suggestionsDiv.innerHTML = ''
    suggestionsDiv.style.display = 'none'
  }
})

document.addEventListener('input', (event) => {
  const element = (event.target as Element).closest('.search-box') as El

  if (element) {
    const searchInput = element.querySelector('input[type="text"]') as HTMLInputElement
    (window as any).searchInput = searchInput
    const query = searchInput.value.toLowerCase()

    if (query.length < 3) {
      return
    }

    const suggestionsDiv = element.querySelector('.suggestions') as HTMLElement
    (window as any).suggestionsDiv = suggestionsDiv
    suggestionsDiv.innerHTML = ''

    const {datasource, suggestedSkillsDatasource} = element.dataset

    // Get entries from the main datasource
    const entries = datasources[datasource as unknown as keyof typeof datasources] as string[]
    const selectedCardsDiv = element.querySelector('.selected-cards') as HTMLDivElement

    // Get entries from the suggested skills datasource
    const suggestedSkillsEntries = suggestedSkillsDatasource ?
      datasources[suggestedSkillsDatasource as unknown as keyof typeof datasources] as string[] :
      []
    const suggestedSkillsCardsDiv = element.querySelector('.suggested-skills-cards') as HTMLDivElement

    // Filter main datasource entries
    const filtered = entries.filter(
      (entry) =>
        entry.toLowerCase().includes(query) &&
          !Array.from(selectedCardsDiv.children).some(
              (card) => card.firstChild?.textContent === entry,
        ),
    )

    // Filter suggested skills datasource entries
    const filteredSuggestedSkills = suggestedSkillsEntries.filter(
      (entry) =>
        entry.toLowerCase().includes(query) &&
          !Array.from(suggestedSkillsCardsDiv.children).some(
              (card) => card.firstChild?.textContent === entry,
        ),
    )

    // Add suggestions from main datasource
    filtered.forEach((item) => {
      const div = document.createElement('div')
      div.classList.add('suggestion')
      div.textContent = item
      div.dataset.source = 'main'
      div.addEventListener('click', () => {
        searchInput.value = ''
        suggestionsDiv.innerHTML = ''
        suggestionsDiv.style.display = 'none'
        createSelectedCard(item, selectedCardsDiv, searchInput)
      })
      suggestionsDiv.appendChild(div)
    })

    // Add suggestions from suggested skills datasource
    filteredSuggestedSkills.forEach((item) => {
      const div = document.createElement('div')
      div.classList.add('suggestion')
      div.textContent = item
      div.dataset.source = 'suggestedSkills'
      div.addEventListener('click', () => {
        searchInput.value = ''
        suggestionsDiv.innerHTML = ''
        suggestionsDiv.style.display = 'none'
        createSelectedCard(item, suggestedSkillsCardsDiv, searchInput)
      })
      suggestionsDiv.appendChild(div)
    })

    if (filtered.length > 0 || filteredSuggestedSkills.length > 0) {
      suggestionsDiv.style.display = 'block'
    }
  }
})

interface Field {
  [key: string]: any
  properties: {
    datasource: string[]
    [key: string]: any
  }
}

export default function decorate(element: El, field: Field) {
  const { datasource } = field.properties
  const suggestedSkillsDatasource = field.properties['suggested-skills-datasource'] || 'experiencedBasedJobs'
  const selectionLabel = field.properties['selection-label']
  const suggestedSkillsLabel = field.properties['suggested-skills-label'] || 'Suggested skills'
  const emptySelectionMessage = field.properties['empty-selection-message']
  const emptySkillsMessage = field.properties['empty-skills-message'] || 'No suggested skills selected.'

  element.classList.add('search-box')
  element.dataset.datasource = datasource
  element.dataset.suggestedSkillsDatasource = suggestedSkillsDatasource

  // Moved input into container so we can attached icon input
  const inputEl = element.querySelector('input')
  const container = document.createElement('div')
  container.className = 'search-box__input'
  container.id = 'search-box__input'

  if (inputEl) {
    container.appendChild(inputEl)
  }

  element.appendChild(container)

  // Add suggestion div
  const suggestionsDiv = addSuggestionDiv()

  // Add selected cards container
  const selectedCardsDiv = addSelectedCardsDiv(
    selectionLabel,
    emptySelectionMessage,
  )

  // Add suggested skills cards container
  const suggestedSkillsCardsDiv = addSuggestedSkillsCardsDiv(
    suggestedSkillsLabel,
    emptySkillsMessage,
  )

  element.appendChild(selectedCardsDiv)
  element.appendChild(suggestedSkillsCardsDiv)
  container.appendChild(suggestionsDiv)

  return element
}
