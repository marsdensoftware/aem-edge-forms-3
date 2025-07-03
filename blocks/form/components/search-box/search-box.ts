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

  // Only add heading if headingText is provided and not empty
  if (headingText && headingText.trim() !== '') {
    const heading = document.createElement('div')
    heading.classList.add('selected-cards-heading')
    heading.textContent = headingText
    wrapper.appendChild(heading)
  }

  const cardsDiv = document.createElement('div')
  cardsDiv.classList.add('selected-cards')
  // Only set the empty selection message if it's provided and not empty
  if (emptySelectionMessage && emptySelectionMessage.trim() !== '') {
    cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage
  }
  wrapper.appendChild(cardsDiv)

  return wrapper
}

function addRecommendationsCardsDiv(
  headingText: string,
  emptySelectionMessage: string,
) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('recommendations-cards-wrapper')

  // Only add heading if headingText is provided and not empty
  if (headingText && headingText.trim() !== '') {
    const heading = document.createElement('div')
    heading.classList.add('selected-cards-heading')
    heading.textContent = headingText
    wrapper.appendChild(heading)
  }

  const cardsDiv = document.createElement('div')
  cardsDiv.classList.add('recommendations-cards')
  // Only set the empty selection message if it's provided and not empty
  if (emptySelectionMessage && emptySelectionMessage.trim() !== '') {
    cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage
  }
  wrapper.appendChild(cardsDiv)

  return wrapper
}

function createSelectedCard(
  item: string,
  selectedCardsDiv: HTMLDivElement,
  searchInput: HTMLInputElement,
) {
  const card = document.createElement('div')
  card.classList.add('selected-card', 'selected-card--is-selected')

  // Create hidden input to store the value
  const hiddenInput = document.createElement('input')
  hiddenInput.type = 'hidden'
  hiddenInput.value = item
  hiddenInput.name = `selected-item-${item.replace(/\s+/g, '-').toLowerCase()}`

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

    // Find the search-box element and the recommendations div
    const searchBox = selectedCardsDiv.closest('.search-box') as El
    if (searchBox) {
      const recommendationsCardsDiv = searchBox.querySelector('.recommendations-cards-wrapper') as HTMLDivElement
      if (recommendationsCardsDiv && recommendationsCardsDiv.style.display !== 'none') {
        // Recreate the recommendations div to include the removed item
        populateRecommendationsDiv(searchBox, recommendationsCardsDiv, selectedCardsDiv, searchInput)
      }
    }
  })

  card.appendChild(hiddenInput)
  card.appendChild(text)
  card.appendChild(removeBtn)
  selectedCardsDiv.appendChild(card)
}

function createRecommendationCard(
  item: string,
  recommendationsCardsDiv: HTMLDivElement,
  selectedCardsDiv: HTMLDivElement,
  searchInput: HTMLInputElement,
) {
  const card = document.createElement('div')
  card.classList.add('selected-card')

  const text = document.createElement('div')
  text.textContent = item

  // Add click event to move the recommendation to the selectedCardsDiv
  card.addEventListener('click', () => {
    card.remove()
    // Get the inner div with class 'selected-cards'
    const selectedCards = (selectedCardsDiv.querySelector('.selected-cards') || selectedCardsDiv) as HTMLDivElement
    createSelectedCard(item, selectedCards, searchInput)

    // Find the search-box element to replenish the recommendations list
    const searchBox = recommendationsCardsDiv.closest('.search-box') as El
    if (searchBox) {
      const recommendationsWrapper = searchBox.querySelector('.recommendations-cards-wrapper') as HTMLDivElement
      if (recommendationsWrapper) {
        // Replenish the recommendations list
        populateRecommendationsDiv(searchBox, recommendationsWrapper, selectedCardsDiv, searchInput)
      }
    }
  })

  card.appendChild(text)
  recommendationsCardsDiv.appendChild(card)
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

const languages = ['Te Reo Māori', 'French', 'German', 'Portuguese', 'Hebrew']

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

const jobTitleIndustries = [
  'Fruit Production Owner',
  'Field Crop Grower',
  'Grape Grower',
  'Mixed Crop Farmer',
  'Outdoor Crop Production Owner',
  'Mixed Crop Farm Manager',
  'Indoor Crop Production Owner',
  'Fruit Production Manager',
  'Indoor Crop Production Manager',
  'Outdoor Crop Production Manager',
  'Horticulture Post-Harvest Owner',
  'Horticulture Post-Harvest Manager',
  'Nursery Production Owner',
  'Nursery Production Manager',
  'Vineyard Manager',
  'Apiarist',
  'Beef Cattle Farmer',
  'Dairy Farm Owner',
  'Deer Farmer',
  'Goat Farmer',
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
  jobTitleIndustries,
}

interface El extends Element {
  dataset: {
    datasource: string[]
    recommendationsDatasource?: string[]
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

    const {datasource, recommendationsDatasource} = element.dataset

    // Get entries from the main datasource
    const entries = datasources[datasource as unknown as keyof typeof datasources] as string[]
    const selectedCardsWrapper = element.querySelector('.selected-cards-wrapper') as HTMLDivElement
    const selectedCardsDiv = selectedCardsWrapper.querySelector('.selected-cards') as HTMLDivElement

    // Get entries from the recommendations datasource
    const recommendationsEntries = recommendationsDatasource ?
      datasources[recommendationsDatasource as unknown as keyof typeof datasources] as string[] :
      []
    const recommendationsCardsDiv = element.querySelector('.recommendations-cards') as HTMLDivElement

    // Filter main datasource entries
    const filtered = entries.filter(
      (entry) =>
        entry.toLowerCase().includes(query) &&
          !Array.from(selectedCardsDiv.children).some(
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

    if (filtered.length > 0) {
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

// Function to populate the recommendations div with items from the recommendations datasource
function populateRecommendationsDiv(
  element: El,
  recommendationsCardsDiv: HTMLDivElement,
  selectedCardsDiv: HTMLDivElement,
  inputEl: HTMLInputElement,
) {
  // Clear existing recommendations
  const recommendationsCards = recommendationsCardsDiv.querySelector('.recommendations-cards') as HTMLDivElement
  recommendationsCards.innerHTML = ''

  const { recommendationsDatasource } = element.dataset

  // Get entries from the recommendations datasource
  const recommendationsEntries = recommendationsDatasource ?
    datasources[recommendationsDatasource as unknown as keyof typeof datasources] as string[] :
    []

  // Filter out items that are already in the selected cards div
  // Check if selectedCardsDiv is the wrapper div or the inner div
  const selectedCards = selectedCardsDiv.querySelector('.selected-cards') || selectedCardsDiv
  const availableRecommendations = recommendationsEntries.filter(
    (entry) =>
      !Array.from(selectedCards.children).some(
        (card) => card.firstChild?.textContent === entry,
      ),
  )

  // Add up to 8 recommendations to the recommendations div
  for (let i = 0; i < 8 && i < availableRecommendations.length; i++) {
    createRecommendationCard(availableRecommendations[i], recommendationsCards, selectedCardsDiv, inputEl)
  }
}

export default function decorate(element: El, field: Field) {
  const { datasource } = field.properties
  const recommendationsDatasource = field.properties['recommendations-datasource'] || 'experiencedBasedJobs'
  const selectionLabel = field.properties['selection-label']
  const recommendationsLabel = field.properties['recommendations-label']
  const emptySelectionMessage = field.properties['empty-selection-message']
  const emptyRecommendationsMessage = field.properties['empty-recommendations-message']
  const showRecommendations = field.properties['show-recommendations'] || false

  element.classList.add('search-box')
  element.dataset.datasource = datasource
  element.dataset.recommendationsDatasource = recommendationsDatasource

  // Moved input into container so we can attached icon input
  const inputEl = element.querySelector('input') as HTMLInputElement
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

  // Add recommendations cards container
  const recommendationsCardsDiv = addRecommendationsCardsDiv(
    recommendationsLabel,
    emptyRecommendationsMessage,
  )

  // Hide recommendations div by default, show only if show-recommendations is true
  recommendationsCardsDiv.style.display = showRecommendations ? 'block' : 'none'

  element.appendChild(selectedCardsDiv)
  element.appendChild(recommendationsCardsDiv)
  container.appendChild(suggestionsDiv)

  // Populate the recommendations div
  populateRecommendationsDiv(element, recommendationsCardsDiv, selectedCardsDiv, inputEl)

  return element
}
