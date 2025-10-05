import { onElementAdded } from '../utils.js'
import { updateOrCreateInvalidMsg } from '../../util.js';
import { fetchRemoteSuggestions, SUGGESTION_LIMIT } from '../refdatautils.js';
import { i18n } from '../../../../i18n/index.js';

/* eslint-disable no-use-before-define */
/**
 * A WeakMap to hold the state for each search-box instance.
 * This prevents memory leaks if a search-box element is removed from the DOM.
 */
interface ComponentState {
  main: string[]
  recommendations: string[]
  // Keep an AbortController per component instance to cancel stale requests
  abortController?: AbortController
  // Timer to trigger a secondary fetch for the 'all' category after idle
  delayedAllTimerId?: number
  // Separate abort controller for the 'all' category fetch
  allAbortController?: AbortController
}
const componentStateMap = new WeakMap<Element, ComponentState>()

interface WorkExperienceEntry {
  type: {
    value: string;
    displayValue: string;
  };
}
interface RepeatableEvent {
  name: string;
  entries: WorkExperienceEntry[];
}

// --- Helper functions to create DOM elements ---

function addSuggestionDiv() {
  const el = document.createElement('div')
  el.classList.add('suggestions')
  return el
}

function addSelectedCardsDiv(headingText: string, emptySelectionMessage: string) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('selected-cards-wrapper')

  if (headingText && headingText.trim() !== '') {
    const heading = document.createElement('div')
    heading.classList.add('selected-cards-heading')
    heading.textContent = headingText
    wrapper.appendChild(heading)
  }

  const cardsDiv = document.createElement('div')
  cardsDiv.classList.add('selected-cards')
  if (emptySelectionMessage && emptySelectionMessage.trim() !== '') {
    cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage
  }
  wrapper.appendChild(cardsDiv)

  return wrapper
}

function addRecommendationsCardsDiv(headingText: string, emptySelectionMessage: string) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('recommendations-cards-wrapper')

  if (headingText && headingText.trim() !== '') {
    const heading = document.createElement('div')
    heading.classList.add('selected-cards-heading')
    heading.textContent = headingText
    wrapper.appendChild(heading)
  }

  const cardsDiv = document.createElement('div')
  cardsDiv.classList.add('recommendations-cards')
  if (emptySelectionMessage && emptySelectionMessage.trim() !== '') {
    cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage
  }
  wrapper.appendChild(cardsDiv)

  return wrapper
}

// --- Card creation and management functions ---

function createSelectedCard(
  item: string,
  selectedCardsDiv: HTMLDivElement,
  searchInput: HTMLInputElement,
  source: 'main' | 'recommendation',
  itemCode?: string,
) {
  const card = document.createElement('div')
  card.classList.add('selected-card', 'selected-card--is-selected')
  card.dataset.source = source // Store where the item came from

  const hiddenInput = document.createElement('input')
  hiddenInput.type = 'hidden'
  hiddenInput.value = item
  hiddenInput.name = itemCode || `selected-item-${item.replace(/\s+/g, '-').toLowerCase()}`

  const text = document.createElement('div')
  text.textContent = item

  const removeBtn = document.createElement('button')
  removeBtn.classList.add('selected-card__button-remove')
  removeBtn.setAttribute('aria-label', `Remove ${item}`)
  removeBtn.innerHTML = `<span>Remove ${item}</span>`

  removeBtn.addEventListener('click', () => {
    const searchBox = selectedCardsDiv.closest('.search-box') as El

    // Remove the card from the DOM immediately.
    card.remove()

    if (searchBox && componentStateMap.has(searchBox)) {
      // Now, update the component's internal state to reflect the removal.

      // 1. Get all items that are *still* selected.
      const remainingSelectedItems = Array.from(
        selectedCardsDiv.querySelectorAll('.selected-card input[type="hidden"]'),
      ).map((input) => (input as HTMLInputElement).value)

      // 2. Get the original, ordered datasources.
      const recDatasourceName =
        searchBox.dataset.recommendationsDatasource as keyof typeof datasources
      const originalRecs = datasources[recDatasourceName] || []
      const mainDatasourceName = searchBox.dataset.datasource as keyof typeof datasources
      const originalMain = datasources[mainDatasourceName] || []

      // 3. Re-create the available items state by filtering the original lists.
      // This elegantly preserves the original order without needing a complex sort.
      const state = componentStateMap.get(searchBox)!
      state.recommendations = originalRecs.filter((i) => !remainingSelectedItems.includes(i))
      state.main = originalMain.filter((i) => !remainingSelectedItems.includes(i))

      // 4. Re-populate the recommendationsUI to show the newly available item.
      const recommendationsWrapper = searchBox.querySelector('.recommendations-cards-wrapper') as HTMLDivElement
      if (recommendationsWrapper && recommendationsWrapper.style.display !== 'none') {
        populateRecommendationsDiv(searchBox, recommendationsWrapper, selectedCardsDiv, searchInput)
      }

      // 5. remove the required attribute if the searchInput is required and the selected cards div is not empty
      if (searchBox.dataset.required && !selectedCardsDiv.querySelector('.selected-card')) {
        searchInput.setAttribute('required', 'required')
        setTimeout(() => {
          updateOrCreateInvalidMsg(searchInput);
        }, 0)
      }
    }

    // Finally, trigger a change event for form validation.
    const event = new Event('change', { bubbles: true })
    searchInput.dispatchEvent(event)
  })

  card.appendChild(hiddenInput)
  card.appendChild(text)
  card.appendChild(removeBtn)
  selectedCardsDiv.appendChild(card)

  // if the searchInput is required, and the selected cards div is not empty, then remove the required attribute
  if (searchInput.required && selectedCardsDiv.querySelector('.selected-card')) {
    searchInput.removeAttribute('required')
  }
}

function createRecommendationCard(
  item: string,
  recommendationsCardsDiv: HTMLDivElement,
  selectedCardsDiv: HTMLDivElement,
  searchInput: HTMLInputElement,
  itemCode?: string,
) {
  const card = document.createElement('div')
  card.classList.add('selected-card')

  const text = document.createElement('div')
  text.textContent = item

  card.addEventListener('click', () => {
    const searchBox = recommendationsCardsDiv.closest('.search-box')
    if (searchBox && componentStateMap.has(searchBox)) {
      const state = componentStateMap.get(searchBox)!
      // Remove item from the recommendations state
      state.recommendations = state.recommendations.filter((i) => i !== item)
    }

    card.remove()
    const selectedCards = (selectedCardsDiv.querySelector('.selected-cards') || selectedCardsDiv) as HTMLDivElement
    createSelectedCard(item, selectedCards, searchInput, 'recommendation', itemCode)

    if (searchBox) {
      const recommendationsWrapper = searchBox.querySelector('.recommendations-cards-wrapper') as HTMLDivElement
      if (recommendationsWrapper) {
        populateRecommendationsDiv(
          searchBox as El,
          recommendationsWrapper,
          selectedCardsDiv,
          searchInput,
        )
      }
    }
  })

  card.appendChild(text)
  recommendationsCardsDiv.appendChild(card)
}

// --- Datasources (static data) ---

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

const additionalHardSkills = [
  'Business Analysis',
  'Risk Management',
  'Market Research',
  'Data Visualisation Software',
  'Scientific Research Methodology',
  'Business Communication',
  'Management Systems Standards',
  'Business Analytics',
  'Management Consulting',
  'Analyse External Factors of Companies',
  'Build Business Relationships',
  'Advise on Efficiency Improvements',
  'Apply Change Management',
  'Identify Undetected Organisational Needs',
  'Analyse Business Plans',
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

const workRelatedSkills = [
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

const experiencedBasedSkills = [
  'Curriculum objectives',
  'Agritourism',
  'Act reliably',
  'Insurance market',
  'Characteristics of services',
]

// Function to extract job titles from the DOM element
const getExperiencedBasedJobs = (): string[] => [
  // Default fallback values if the element is not found or has no content

  // 'Job Title 1',
  // 'Job Title 2',
  // 'Job Title 3',
  // 'Job Title 4',
  // 'Job Title 5',
  // 'Job Title 6',
  // 'Job Title 7',
  // 'Job Title 8',
  // 'Job Title 9',
  // 'Job Title 10',
]

// Function to listen for repeatableChanged event and update job types
const observeElementForJobs = (element: El): void => {
  experiencedBasedJobs = getExperiencedBasedJobs(); // Initial population of job titles

  // get the containing form
  const form = element.closest('form') as HTMLFormElement;

  // Add event listener for repeatableChanged event
  form.addEventListener('repeatableChanged', (event: Event) => {
    // Verify this is a CustomEvent with detail
    if (!(event instanceof CustomEvent)) {
      console.error('[DEBUG_LOG] Event is not a CustomEvent:', event);
      return;
    }

    const customEvent = event as CustomEvent<RepeatableEvent>;
    const { detail } = customEvent;

    // Check if the event is for workexperience
    if (detail && detail.name === 'workexperience' && detail.entries && Array.isArray(detail.entries)) {
      // Extract type values from all entries
      let jobTypes: string[] = [];
      try {
        // First check if entries have the expected structure
        /* eslint-disable-next-line no-unused-vars */
        const hasValidEntries = detail.entries.some((entry) => entry && typeof entry === 'object' && entry.type &&
          typeof entry.type === 'object' &&
          'displayValue' in entry.type &&
          typeof entry.type.displayValue === 'string');

        jobTypes = (detail as RepeatableEvent).entries
          .map((entry) => {
            if (!entry.type) {
              console.log('[DEBUG_LOG] Entry missing type property:', entry);
              return null;
            }
            if (!entry.type.displayValue) {
              console.log('[DEBUG_LOG] Entry missing type.displayValue:', entry.type);
              return null;
            }
            return entry.type.displayValue;
          })
          .filter(Boolean) as string[];
      } catch (error) {
        console.error('[DEBUG_LOG] Error extracting job types:', error);
      }

      // Update experiencedBasedJobs with the extracted job types
      if (jobTypes.length > 0) {
        experiencedBasedJobs = jobTypes;

        // Also update the datasources object to ensure it's using the latest values
        datasources.experiencedBasedJobs = experiencedBasedJobs;

        // Update any existing search-box components that use experiencedBasedJobs
        const searchBoxes = document.querySelectorAll('.search-box');

        searchBoxes.forEach((searchBox) => {
          const el = searchBox as El;

          if (el.dataset.recommendationsDatasource === 'experiencedBasedJobs' && componentStateMap.has(el)) {
            const state = componentStateMap.get(el)!;

            // Get currently selected items to exclude them from the updated list
            const selectedCardsDiv = el.querySelector('.selected-cards') as HTMLDivElement;
            const selectedItems = Array.from(
              selectedCardsDiv?.querySelectorAll('.selected-card input[type="hidden"]') || [],
            ).map((input) => (input as HTMLInputElement).value);

            // Update the recommendations with the new job types, excluding selected items
            state.recommendations =
              experiencedBasedJobs.filter((job) => !selectedItems.includes(job));

            // Re-populate recommendations if they're visible
            const recommendationsWrapper = el.querySelector('.recommendations-cards-wrapper') as HTMLDivElement;
            const searchInput = el.querySelector('input[type="text"]') as HTMLInputElement;
            if (recommendationsWrapper && recommendationsWrapper.style.display !== 'none') {
              console.log('[DEBUG_LOG] Re-populating recommendations div');
              populateRecommendationsDiv(el, recommendationsWrapper, selectedCardsDiv, searchInput);
            }
          }
        });
      } else {
        console.log('[DEBUG_LOG] No job types extracted from entries');
      }
    } else {
      console.log('[DEBUG_LOG] Event is not for workexperience or has invalid format');
    }
  });
}

// This will be populated by the repeatableChanged event listener
let experiencedBasedJobs = getExperiencedBasedJobs();

const datasources = {
  courses,
  languages,
  userLocations,
  skills,
  experiencedBasedJobs,
  experiencedBasedSkills,
  jobTitleIndustries,
  additionalHardSkills,
  workRelatedSkills,
}

// --- Type definitions ---

// A handy way to check this only runs once: extend the Window interface to include a global flag
declare global {
  /* eslint-disable-next-line no-unused-vars */
  interface Window {
    experiencedBasedJobsObserverInitialized?: boolean;
  }
}

interface El extends Element {
  dataset: {
    datasource: string
    semanticDatasource?: string
    recommendationsDatasource?: string
    maxAllowedItems?: string
    required?: string
  }
}

interface Field {
  [key: string]: any
  properties: {
    datasource: string
    maxAllowedItems?: string
    [key: string]: any
  }
}

// --- Global Event Listeners ---

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  document.querySelectorAll('.search-box .suggestions').forEach((suggestionsDiv) => {
    const searchBox = suggestionsDiv.closest('.search-box')
    if (searchBox && !searchBox.contains(e.target as Node)) {
      (suggestionsDiv as HTMLElement).style.display = 'none'
    }
  })
})

document.addEventListener('input', (event) => {
  const element = (event.target as Element).closest('.search-box') as El

  if (element && componentStateMap.has(element)) {
    const searchInput = element.querySelector('input[type="text"]') as HTMLInputElement
    const query = searchInput.value.toLowerCase()
    const suggestionsDiv = element.querySelector('.suggestions') as HTMLElement
    suggestionsDiv.innerHTML = ''

    const state = componentStateMap.get(element)!

    // If query is too short, hide suggestions and cancel any pending 'all' timer/fetch
    if (query.length < 3) {
      suggestionsDiv.style.display = 'none'
      if (state.delayedAllTimerId) {
        clearTimeout(state.delayedAllTimerId)
        state.delayedAllTimerId = undefined
      }
      if (state.allAbortController) {
        try { state.allAbortController.abort() } catch (_) { /* noop */ }
        state.allAbortController = undefined
      }
      return
    }

    const selectedCardsWrapper = element.querySelector('.selected-cards-wrapper') as HTMLDivElement
    const selectedCardsDiv = selectedCardsWrapper.querySelector('.selected-cards') as HTMLDivElement

    // Cancel any in-flight request for this component instance
    if (state.abortController) {
      try { state.abortController.abort() } catch (_) { /* noop */ }
    }
    const controller = new AbortController()
    state.abortController = controller

    const category = element.dataset.datasource
    const semanticCategory = element.dataset.semanticDatasource

    // Reset any pending secondary 'all' fetch/timer when we have a new qualifying input
    if (state.delayedAllTimerId) {
      clearTimeout(state.delayedAllTimerId)
      state.delayedAllTimerId = undefined
    }
    if (state.allAbortController) {
      try { state.allAbortController.abort() } catch (_) { /* noop */ }
      state.allAbortController = undefined
    }

    // only fire semantic search if we have a semanticCategory configured
    if (semanticCategory && semanticCategory !== 'undefined') {
      // Schedule a secondary fetch for category 'all' after 1.5s of inactivity
      state.delayedAllTimerId = window.setTimeout(() => {
        // If the input has changed to a short query by the time timer fires, skip
        const latestQuery = searchInput.value.toLowerCase()
        if (latestQuery.length < 3) return

        // Abort any previous 'all' fetch before starting a new one
        if (state.allAbortController) {
          try {
            state.allAbortController.abort()
          } catch (_) { /* noop */
          }
        }
        const allController = new AbortController()
        state.allAbortController = allController

        fetchRemoteSuggestions(semanticCategory, latestQuery, SUGGESTION_LIMIT, allController, element, 'contains')
          .then((allItems) => {
            if (allController.signal.aborted) return

            // If the input has changed to a short query by the time results return, skip rendering
            if (searchInput.value.toLowerCase().length < 3) return

            // Append 'all' results under existing suggestions, avoiding duplicates and already selected items
            const existingTexts = new Set(
              Array.from(suggestionsDiv.querySelectorAll('.suggestion')).map((el) => el.textContent || ''),
            )

            // Determine which 'all' items we will actually append
            const itemsToAppend = allItems.filter((item) => {
              // Skip if already selected
              if (selectedCardsDiv.querySelector(`input[value="${item.description}"]`)) return false
              // Skip if already shown in suggestions (from main or earlier all results)
              if (existingTexts.has(item.description)) return false
              return true
            })

            // Update status text and spinner when we have 'all' items to add
            if (itemsToAppend.length > 0) {
              let statusEl = suggestionsDiv.querySelector('.suggestions-status') as HTMLElement | null
              if (!statusEl) {
                statusEl = document.createElement('div')
                statusEl.classList.add('suggestions-status')
                suggestionsDiv.appendChild(statusEl)
              }

              // Ensure an HR exists inside the status element
              let hr = statusEl.querySelector('.suggestions-divider') as HTMLHRElement | null
              if (!hr) {
                hr = document.createElement('hr')
                hr.classList.add('suggestions-divider')
                statusEl.appendChild(hr)
              }

              // Ensure a text node container exists for status text
              let statusText = statusEl.querySelector('.suggestions-status-text') as HTMLElement | null
              if (!statusText) {
                statusText = document.createElement('div')
                statusText.classList.add('suggestions-status-text')
                statusEl.appendChild(statusText)
              }
              statusText.textContent = i18n('Did you mean ...')
              statusText.classList.add('semantic-options')

              const spinnerEl = statusEl.querySelector('.suggestions-spinner') as HTMLElement | null
              if (spinnerEl) {
                spinnerEl.style.display = 'none'
              }
            }

            // No need to insert a sibling separator anymore; the HR lives inside .suggestions-status

            // Now append the filtered 'all' items
            itemsToAppend.forEach((item) => {
              const div = document.createElement('div')
              div.classList.add('suggestion')
              div.textContent = item.description
              div.dataset.source = 'all'
              div.addEventListener('click', (e) => {
                if (element.classList.contains('max-items-reached')) {
                  e.stopPropagation()
                  return
                }
                searchInput.value = ''
                suggestionsDiv.innerHTML = ''
                suggestionsDiv.style.display = 'none'
                createSelectedCard(item.description, selectedCardsDiv, searchInput, 'main', item.code)
              })
              suggestionsDiv.appendChild(div)
              existingTexts.add(item.description)
            })

            // Ensure suggestions are visible if we appended anything
            if (suggestionsDiv.children.length > 0) {
              suggestionsDiv.style.display = 'block'
            }
          })
          .catch((err) => {
            if (err?.name === 'AbortError') return
            try {
              console.error(err)
            } catch (_) { /* noop */
            }
          })
      }, 1500)
    }

    // Fetch suggestions from the remote endpoint instead of filtering the local state
    fetchRemoteSuggestions(category, query, SUGGESTION_LIMIT, controller, element, 'splitwith')
      .then((items) => {
        // If this request was aborted or superseded, do nothing
        if (controller.signal.aborted) return

        // Hide suggestions if the user cleared/changed to a short query while we were fetching
        if (searchInput.value.toLowerCase().length < 3) {
          suggestionsDiv.style.display = 'none'
          suggestionsDiv.innerHTML = ''
          return
        }

        // Build suggestion entries
        items.forEach((item) => {
          // if the item is already in the selected cards, don't show it in the suggestions
          if (selectedCardsDiv.querySelector(`input[value="${item.description}"]`)) return

          const div = document.createElement('div')
          div.classList.add('suggestion')
          div.textContent = item.description
          div.dataset.source = 'main'
          div.addEventListener('click', (e) => {
            if (element.classList.contains('max-items-reached')) {
              e.stopPropagation()
              return
            }
            searchInput.value = ''
            suggestionsDiv.innerHTML = ''
            suggestionsDiv.style.display = 'none'
            createSelectedCard(item.description, selectedCardsDiv, searchInput, 'main', item.code)
          })
          suggestionsDiv.appendChild(div)
        })

        // only need to deal with semantic search if we have a semanticCategory configured
        // After initial suggestions, add status container (with internal divider), text, and a spinner placeholder
        if (semanticCategory && semanticCategory !== 'undefined' && items.length > 0) {
          let statusEl = suggestionsDiv.querySelector('.suggestions-status') as HTMLElement | null
          if (!statusEl) {
            statusEl = document.createElement('div')
            statusEl.classList.add('suggestions-status')
            suggestionsDiv.appendChild(statusEl)
          }

          // Ensure an HR exists inside the status element
          let hr = statusEl.querySelector('.suggestions-divider') as HTMLHRElement | null
          if (!hr) {
            hr = document.createElement('hr')
            hr.classList.add('suggestions-divider')
            statusEl.appendChild(hr)
          }

          // Ensure a text node container exists for status text
          let statusText = statusEl.querySelector('.suggestions-status-text') as HTMLElement | null
          if (!statusText) {
            statusText = document.createElement('div')
            statusText.classList.add('suggestions-status-text')
            statusEl.appendChild(statusText)
          }
          statusText.textContent = i18n('Searching for more ...')
          statusText.classList.remove('semantic-options')

          // Ensure a spinner exists inside the status element
          let spinnerEl = statusEl.querySelector('.suggestions-spinner') as HTMLElement | null
          if (!spinnerEl) {
            spinnerEl = document.createElement('div')
            spinnerEl.classList.add('suggestions-spinner')
            spinnerEl.setAttribute('aria-hidden', 'true')
            statusEl.appendChild(spinnerEl)
          } else {
            spinnerEl.style.display = ''
          }
        }

        suggestionsDiv.style.display = items.length > 0 ? 'block' : 'none'
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          // Swallow aborts
          return
        }
        // On error, hide suggestions
        suggestionsDiv.style.display = 'none'
        suggestionsDiv.innerHTML = ''
        // Optionally, log to console for debugging
        console.error(err)
      })
  }
})

// --- Component Logic ---

function populateRecommendationsDiv(
  element: El,
  recommendationsCardsWrapper: HTMLDivElement,
  selectedCardsDiv: HTMLDivElement,
  inputEl: HTMLInputElement,
) {
  const recommendationsCards = recommendationsCardsWrapper.querySelector('.recommendations-cards') as HTMLDivElement
  if (!recommendationsCards) return
  recommendationsCards.innerHTML = ''

  if (!componentStateMap.has(element)) return
  const state = componentStateMap.get(element)!

  // Use available recommendations from the component's state
  const availableRecommendations = state.recommendations

  // Add up to 8 recommendations to the recommendations div
  for (let i = 0; i < 8 && i < availableRecommendations.length; i += 1) {
    createRecommendationCard(
      availableRecommendations[i],
      recommendationsCards,
      selectedCardsDiv,
      inputEl,
    )
  }
}

function initSearchBoxCounter(searchBox: El) {
  const maxAllowedItems = parseInt(searchBox.dataset.maxAllowedItems || '-1', 10);
  if (Number.isNaN(maxAllowedItems) || maxAllowedItems <= 0) {
    return;
  }

  const selectedCards = searchBox.querySelector('.selected-cards');
  if (!selectedCards) {
    return;
  }
  const inputWrapper = searchBox.querySelector('.search-box__input');

  // Create / attach counter element under the input
  let counter = inputWrapper?.querySelector('.counter');
  if (!counter) {
    counter = document.createElement('div');
    counter.className = 'counter';
    inputWrapper?.appendChild(counter);
  }

  function updateCounter() {
    const count = selectedCards?.querySelectorAll('.selected-card').length || 0;

    if (count === 0 || count < maxAllowedItems - 5) {
      if (counter) {
        counter.textContent = '';
      }
      return;
    }

    if (counter) {
      counter.textContent = `${count} of ${maxAllowedItems} added`;
      if (count >= maxAllowedItems) {
        counter.textContent += '. Remove an item to add a new one.'
        searchBox.classList.add('max-items-reached');
      } else {
        searchBox.classList.remove('max-items-reached');
      }
    }
  }

  // Observe for child additions/removals
  const observer = new MutationObserver(updateCounter);
  observer.observe(selectedCards, { childList: true });

  // Run initially
  updateCounter();
}

/**
 * Decorates a custom form field component
 * @param {HTMLElement} element - The DOM element containing the field wrapper. Refer to the documentation
 * for its structure for each component.
 * @param {Object} field - The form json object for the component.
 * @param {HTMLElement} parentElement - The parent element of the field.
 * @param {string} formId - The unique identifier of the form.
 */
/* eslint-disable-next-line no-unused-vars */
export default function decorate(element: El, field: Field, parentElement: HTMLElement, formId: String) {
  const { datasource, semanticDatasource } = field.properties
  const recommendationsDatasource = field.properties['recommendations-datasource'] || 'experiencedBasedJobs'
  const selectionLabel = field.properties['selection-label']
  const recommendationsLabel = field.properties['recommendations-label']
  const emptySelectionMessage = field.properties['empty-selection-message']
  const emptyRecommendationsMessage = field.properties['empty-recommendations-message']
  const showRecommendations = field.properties['show-recommendations'] || false

  // if the required property is on the field, then add it as a data attribute
  if (field.properties.required) {
    element.dataset.required = 'true'
  }

  // Set up the event listener for repeatableChanged events
  // This only needs to be done once when the page loads
  // Using setTimeout to ensure the DOM has loaded before attaching the event listener
  if (recommendationsDatasource === 'experiencedBasedJobs' && !window.experiencedBasedJobsObserverInitialized) {
    // Set the flag immediately to prevent multiple setTimeout calls
    window.experiencedBasedJobsObserverInitialized = true;

    onElementAdded(element).then((connectedEl) => {
      observeElementForJobs(connectedEl);
    });
  }

  element.classList.add('search-box')
  element.dataset.datasource = datasource
  if (semanticDatasource !== undefined && semanticDatasource !== null && String(semanticDatasource).trim() !== '') {
    element.dataset.semanticDatasource = String(semanticDatasource)
  } else {
    // Ensure the attribute is not present if no value is provided
    delete (element.dataset as any).semanticDatasource
  }
  element.dataset.recommendationsDatasource = recommendationsDatasource
  element.dataset.maxAllowedItems = field.properties.maxAllowedItems

  // --- Initialize State for this component instance ---
  const mainData = datasources[datasource as keyof typeof datasources] || []
  const recData = datasources[recommendationsDatasource as keyof typeof datasources] || []
  componentStateMap.set(element, {
    main: [...mainData], // Use spread to create a copy
    recommendations: [...recData], // Use spread to create a copy
  })

  // --- Build DOM ---
  const inputEl = element.querySelector('input') as HTMLInputElement
  const container = document.createElement('div')
  container.className = 'search-box__input'

  if (inputEl) {
    container.appendChild(inputEl)
  }

  // add the container to the element but place it just before the last element
  const descriptionEl = element.querySelector('.field-description')
  if (descriptionEl) {
    element.insertBefore(container, descriptionEl)
  } else {
    element.appendChild(container)
  }

  const suggestionsDiv = addSuggestionDiv()
  const selectedCardsDiv = addSelectedCardsDiv(selectionLabel, emptySelectionMessage)
  const recommendationsCardsDiv = addRecommendationsCardsDiv(
    recommendationsLabel,
    emptyRecommendationsMessage,
  )

  recommendationsCardsDiv.style.display = showRecommendations ? 'block' : 'none'

  element.appendChild(selectedCardsDiv)
  element.appendChild(recommendationsCardsDiv)
  container.appendChild(suggestionsDiv)

  // Populate initial recommendations
  if (showRecommendations) {
    populateRecommendationsDiv(element, recommendationsCardsDiv, selectedCardsDiv, inputEl)
  }

  initSearchBoxCounter(element)

  return element
}
