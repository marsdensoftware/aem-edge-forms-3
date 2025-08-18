/*eslint-disable*/
const componentStateMap = new WeakMap();
// --- Helper functions to create DOM elements ---
function addSuggestionDiv() {
    const el = document.createElement('div');
    el.classList.add('suggestions');
    return el;
}
function addSelectedCardsDiv(headingText, emptySelectionMessage) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('selected-cards-wrapper');
    if (headingText && headingText.trim() !== '') {
        const heading = document.createElement('div');
        heading.classList.add('selected-cards-heading');
        heading.textContent = headingText;
        wrapper.appendChild(heading);
    }
    const cardsDiv = document.createElement('div');
    cardsDiv.classList.add('selected-cards');
    if (emptySelectionMessage && emptySelectionMessage.trim() !== '') {
        cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage;
    }
    wrapper.appendChild(cardsDiv);
    return wrapper;
}
function addRecommendationsCardsDiv(headingText, emptySelectionMessage) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('recommendations-cards-wrapper');
    if (headingText && headingText.trim() !== '') {
        const heading = document.createElement('div');
        heading.classList.add('selected-cards-heading');
        heading.textContent = headingText;
        wrapper.appendChild(heading);
    }
    const cardsDiv = document.createElement('div');
    cardsDiv.classList.add('recommendations-cards');
    if (emptySelectionMessage && emptySelectionMessage.trim() !== '') {
        cardsDiv.dataset.emptySelectionMessage = emptySelectionMessage;
    }
    wrapper.appendChild(cardsDiv);
    return wrapper;
}
// --- Card creation and management functions ---
function createSelectedCard(item, selectedCardsDiv, searchInput, source) {
    const card = document.createElement('div');
    card.classList.add('selected-card', 'selected-card--is-selected');
    card.dataset.source = source; // Store where the item came from
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.value = item;
    hiddenInput.name = `selected-item-${item.replace(/\s+/g, '-').toLowerCase()}`;
    const text = document.createElement('div');
    text.textContent = item;
    const removeBtn = document.createElement('button');
    removeBtn.classList.add('selected-card__button-remove');
    removeBtn.setAttribute('aria-label', `Remove ${item}`);
    removeBtn.innerHTML = `<span>Remove ${item}</span>`;
    removeBtn.addEventListener('click', () => {
        const searchBox = selectedCardsDiv.closest('.search-box');
        // Remove the card from the DOM immediately.
        card.remove();
        if (searchBox && componentStateMap.has(searchBox)) {
            // Now, update the component's internal state to reflect the removal.
            // 1. Get all items that are *still* selected.
            const remainingSelectedItems = Array.from(selectedCardsDiv.querySelectorAll('.selected-card input[type="hidden"]')).map((input) => input.value);
            // 2. Get the original, ordered datasources.
            const recDatasourceName = searchBox.dataset.recommendationsDatasource;
            const originalRecs = datasources[recDatasourceName] || [];
            const mainDatasourceName = searchBox.dataset.datasource;
            const originalMain = datasources[mainDatasourceName] || [];
            // 3. Re-create the available items state by filtering the original lists.
            // This elegantly preserves the original order without needing a complex sort.
            const state = componentStateMap.get(searchBox);
            state.recommendations = originalRecs.filter((i) => !remainingSelectedItems.includes(i));
            state.main = originalMain.filter((i) => !remainingSelectedItems.includes(i));
            // 4. Re-populate the recommendations UI to show the newly available item.
            const recommendationsWrapper = searchBox.querySelector('.recommendations-cards-wrapper');
            if (recommendationsWrapper && recommendationsWrapper.style.display !== 'none') {
                populateRecommendationsDiv(searchBox, recommendationsWrapper, selectedCardsDiv, searchInput);
            }
        }
        // Finally, trigger a change event for form validation.
        const event = new Event('change', { bubbles: true });
        searchInput.dispatchEvent(event);
    });
    card.appendChild(hiddenInput);
    card.appendChild(text);
    card.appendChild(removeBtn);
    selectedCardsDiv.appendChild(card);
}
function createRecommendationCard(item, recommendationsCardsDiv, selectedCardsDiv, searchInput) {
    const card = document.createElement('div');
    card.classList.add('selected-card');
    const text = document.createElement('div');
    text.textContent = item;
    card.addEventListener('click', () => {
        const searchBox = recommendationsCardsDiv.closest('.search-box');
        if (searchBox && componentStateMap.has(searchBox)) {
            const state = componentStateMap.get(searchBox);
            // Remove item from the recommendations state
            state.recommendations = state.recommendations.filter((i) => i !== item);
        }
        card.remove();
        const selectedCards = (selectedCardsDiv.querySelector('.selected-cards') || selectedCardsDiv);
        createSelectedCard(item, selectedCards, searchInput, 'recommendation');
        if (searchBox) {
            const recommendationsWrapper = searchBox.querySelector('.recommendations-cards-wrapper');
            if (recommendationsWrapper) {
                populateRecommendationsDiv(searchBox, recommendationsWrapper, selectedCardsDiv, searchInput);
            }
        }
    });
    card.appendChild(text);
    recommendationsCardsDiv.appendChild(card);
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
];
const languages = ['Te Reo Māori', 'French', 'German', 'Portuguese', 'Hebrew'];
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
];
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
];
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
];
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
];
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
];
const experiencedBasedSkills = [
    'Curriculum objectives',
    'Agritourism',
    'Act reliably',
    'Insurance market',
    'Characteristics of services'
];
// Function to extract job titles from the DOM element
const getExperiencedBasedJobs = () => [
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
];
// Function to listen for repeatableChanged event and update job types
const observeElementForJobs = (element) => {
    // Initial population of job titles
    experiencedBasedJobs = getExperiencedBasedJobs();
    // get the containing form
    const form = element.closest('form');
    // Add event listener for repeatableChanged event
    form.addEventListener('repeatableChanged', (event) => {
        // Verify this is a CustomEvent with detail
        if (!(event instanceof CustomEvent)) {
            console.error('[DEBUG_LOG] Event is not a CustomEvent:', event);
            return;
        }
        const customEvent = event;
        const { detail } = customEvent;
        // Check if the event is for workexperience
        if (detail && detail.name === 'workexperience' && detail.entries && Array.isArray(detail.entries)) {
            // Extract type values from all entries
            let jobTypes = [];
            try {
                // First check if entries have the expected structure
                /* eslint-disable-next-line no-unused-vars */
                const hasValidEntries = detail.entries.some(entry => entry && typeof entry === 'object' && entry.type &&
                    typeof entry.type === 'object' &&
                    'displayValue' in entry.type &&
                    typeof entry.type.displayValue === 'string');
                jobTypes = detail.entries
                    .map(entry => {
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
                    .filter(Boolean);
            }
            catch (error) {
                console.error('[DEBUG_LOG] Error extracting job types:', error);
                // console.log('[DEBUG_LOG] Detail entries structure:', JSON.stringify(detail.entries, null, 2));
            }
            // Update experiencedBasedJobs with the extracted job types
            if (jobTypes.length > 0) {
                experiencedBasedJobs = jobTypes;
                // Also update the datasources object to ensure it's using the latest values
                datasources.experiencedBasedJobs = experiencedBasedJobs;
                // Update any existing search-box components that use experiencedBasedJobs
                const searchBoxes = document.querySelectorAll('.search-box');
                searchBoxes.forEach((searchBox) => {
                    const el = searchBox;
                    if (el.dataset.recommendationsDatasource === 'experiencedBasedJobs' && componentStateMap.has(el)) {
                        const state = componentStateMap.get(el);
                        // Get currently selected items to exclude them from the updated list
                        const selectedCardsDiv = el.querySelector('.selected-cards');
                        const selectedItems = Array.from((selectedCardsDiv === null || selectedCardsDiv === void 0 ? void 0 : selectedCardsDiv.querySelectorAll('.selected-card input[type="hidden"]')) || []).map((input) => input.value);
                        // Update the recommendations with the new job types, excluding selected items
                        state.recommendations = experiencedBasedJobs.filter(job => !selectedItems.includes(job));
                        // Re-populate recommendations if they're visible
                        const recommendationsWrapper = el.querySelector('.recommendations-cards-wrapper');
                        const searchInput = el.querySelector('input[type="text"]');
                        if (recommendationsWrapper && recommendationsWrapper.style.display !== 'none') {
                            console.log('[DEBUG_LOG] Re-populating recommendations div');
                            populateRecommendationsDiv(el, recommendationsWrapper, selectedCardsDiv, searchInput);
                        }
                    }
                });
            }
            else {
                console.log('[DEBUG_LOG] No job types extracted from entries');
            }
        }
        else {
            console.log('[DEBUG_LOG] Event is not for workexperience or has invalid format');
        }
    });
};
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
};
// --- Global Event Listeners ---
// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    document.querySelectorAll('.search-box .suggestions').forEach((suggestionsDiv) => {
        const searchBox = suggestionsDiv.closest('.search-box');
        if (searchBox && !searchBox.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
});
document.addEventListener('input', (event) => {
    const element = event.target.closest('.search-box');
    if (element && componentStateMap.has(element)) {
        const searchInput = element.querySelector('input[type="text"]');
        const query = searchInput.value.toLowerCase();
        const suggestionsDiv = element.querySelector('.suggestions');
        suggestionsDiv.innerHTML = '';
        if (query.length < 3) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        const state = componentStateMap.get(element);
        const selectedCardsWrapper = element.querySelector('.selected-cards-wrapper');
        const selectedCardsDiv = selectedCardsWrapper.querySelector('.selected-cards');
        // Filter main datasource entries from the component's state
        const filtered = state.main.filter((entry) => entry.toLowerCase().includes(query));
        // Add suggestions from main datasource
        filtered.forEach((item) => {
            const div = document.createElement('div');
            div.classList.add('suggestion');
            div.textContent = item;
            div.dataset.source = 'main';
            div.addEventListener('click', () => {
                // Remove item from the main state
                state.main = state.main.filter((i) => i !== item);
                searchInput.value = '';
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
                createSelectedCard(item, selectedCardsDiv, searchInput, 'main');
            });
            suggestionsDiv.appendChild(div);
        });
        if (filtered.length > 0) {
            suggestionsDiv.style.display = 'block';
        }
        else {
            suggestionsDiv.style.display = 'none';
        }
    }
});
// --- Component Logic ---
function populateRecommendationsDiv(element, recommendationsCardsWrapper, selectedCardsDiv, inputEl) {
    const recommendationsCards = recommendationsCardsWrapper.querySelector('.recommendations-cards');
    if (!recommendationsCards)
        return;
    recommendationsCards.innerHTML = '';
    if (!componentStateMap.has(element))
        return;
    const state = componentStateMap.get(element);
    // Use available recommendations from the component's state
    const availableRecommendations = state.recommendations;
    // Add up to 8 recommendations to the recommendations div
    for (let i = 0; i < 8 && i < availableRecommendations.length; i += 1) {
        createRecommendationCard(availableRecommendations[i], recommendationsCards, selectedCardsDiv, inputEl);
    }
}
export default function decorate(element, field) {
    const { datasource } = field.properties;
    const recommendationsDatasource = field.properties['recommendations-datasource'] || 'experiencedBasedJobs';
    const selectionLabel = field.properties['selection-label'];
    const recommendationsLabel = field.properties['recommendations-label'];
    const emptySelectionMessage = field.properties['empty-selection-message'];
    const emptyRecommendationsMessage = field.properties['empty-recommendations-message'];
    const showRecommendations = field.properties['show-recommendations'] || false;
    // Set up the event listener for repeatableChanged events
    // This only needs to be done once when the page loads
    // Using setTimeout to ensure the DOM has loaded before attaching the event listener
    if (recommendationsDatasource === 'experiencedBasedJobs' && !window.experiencedBasedJobsObserverInitialized) {
        // Set the flag immediately to prevent multiple setTimeout calls
        window.experiencedBasedJobsObserverInitialized = true;
        setTimeout(() => {
            observeElementForJobs(element);
        }, 500); // 500ms delay to allow the DOM to load
    }
    element.classList.add('search-box');
    element.dataset.datasource = datasource;
    element.dataset.recommendationsDatasource = recommendationsDatasource;
    // --- Initialize State for this component instance ---
    const mainData = datasources[datasource] || [];
    const recData = datasources[recommendationsDatasource] || [];
    componentStateMap.set(element, {
        main: [...mainData], // Use spread to create a copy
        recommendations: [...recData], // Use spread to create a copy
    });
    // --- Build DOM ---
    const inputEl = element.querySelector('input');
    const container = document.createElement('div');
    container.className = 'search-box__input';
    if (inputEl) {
        container.appendChild(inputEl);
    }
    element.appendChild(container);
    const suggestionsDiv = addSuggestionDiv();
    const selectedCardsDiv = addSelectedCardsDiv(selectionLabel, emptySelectionMessage);
    const recommendationsCardsDiv = addRecommendationsCardsDiv(recommendationsLabel, emptyRecommendationsMessage);
    recommendationsCardsDiv.style.display = showRecommendations ? 'block' : 'none';
    element.appendChild(selectedCardsDiv);
    element.appendChild(recommendationsCardsDiv);
    container.appendChild(suggestionsDiv);
    // Populate initial recommendations
    if (showRecommendations) {
        populateRecommendationsDiv(element, recommendationsCardsDiv, selectedCardsDiv, inputEl);
    }
    return element;
}
