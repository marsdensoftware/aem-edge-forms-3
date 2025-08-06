const initialState = 0;
let increment = 0;
let increment2 = 0;
let increment3 = 0;
let currentStep = 0;
let barLength = 0;
let barLength2 = 0;
let barLength3 = 0;
let progressBar;
let barEl1;
let barEl2;
let barEl3;
let wizard;
let wizardFooter;
const groupLength = (wizardEl) => {
    // Check how many step groups available
    const step1Group = wizardEl === null || wizardEl === void 0 ? void 0 : wizardEl.querySelectorAll(':scope > [data-stepgroup="1"]');
    const step2Group = wizardEl === null || wizardEl === void 0 ? void 0 : wizardEl.querySelectorAll(':scope > [data-stepgroup="2"]');
    const step3Group = wizardEl === null || wizardEl === void 0 ? void 0 : wizardEl.querySelectorAll(':scope > [data-stepgroup="3"]');
    const totalSteps = step1Group.length + step2Group.length + step3Group.length;
    return {
        step1GroupLength: step1Group.length,
        step2GroupLength: step2Group.length,
        step3GroupLength: step3Group.length,
        totalSteps,
    };
};
const createProgressBarElements = () => {
    barEl1 = document.createElement('span');
    barEl2 = document.createElement('span');
    barEl3 = document.createElement('span');
    const barContainer = document.createElement('span');
    const barContainer2 = document.createElement('span');
    const barContainer3 = document.createElement('span');
    barContainer.classList.add('progress-bar__container');
    barContainer2.classList.add('progress-bar__container');
    barContainer3.classList.add('progress-bar__container');
    barEl1.classList.add('progress-bar__item');
    barEl2.classList.add('progress-bar__item');
    barEl3.classList.add('progress-bar__item');
    barEl1.style = `width: ${initialState}%;`;
    barContainer.append(barEl1);
    barContainer2.append(barEl2);
    barContainer3.append(barEl3);
    return {
        barContainer,
        barContainer2,
        barContainer3,
    };
};
export const createProgressBar = () => {
    progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar', 'progress-bar--is-hidden');
    // Container
    const progressBarInner = document.createElement('div');
    progressBarInner.classList.add('progress-bar__inner');
    // Step title
    const title = document.createElement('span');
    title.classList.add('progress-bar__title', 'strap-title-small');
    // Added into progress bar
    const { barContainer, barContainer2, barContainer3 } = createProgressBarElements();
    progressBarInner.append(barContainer, barContainer2, barContainer3);
    progressBar.append(title, progressBarInner);
    // Added into footer
    wizardFooter = document.querySelector('.wizard-button-wrapper');
    if (!wizardFooter) {
        throw new Error('Can not find wizard footer element');
    }
    wizardFooter.prepend(progressBar);
    // Get steps length
    wizard = document.querySelector('.wizard');
    if (!wizard) {
        throw new Error('Can not find wizard element');
    }
    const { step1GroupLength, step2GroupLength, step3GroupLength } = groupLength(wizard);
    barLength = 100 / step1GroupLength;
    barLength2 = 100 / step2GroupLength;
    barLength3 = 100 / step3GroupLength;
};
export const trackProgress = () => {
    // Track where it is in the steps
    const currentWizard = document.querySelector('.current-wizard-step');
    const wizardIdx = Number(currentWizard === null || currentWizard === void 0 ? void 0 : currentWizard.getAttribute('data-index'));
    // Set title
    const title = document.querySelector('.progress-bar__title');
    // Reset progress bar state
    if (wizardIdx === 0 || wizardIdx === 1) {
        progressBar === null || progressBar === void 0 ? void 0 : progressBar.classList.add('progress-bar--is-hidden');
        currentStep = 0;
        increment = 0;
    }
    else {
        progressBar === null || progressBar === void 0 ? void 0 : progressBar.classList.remove('progress-bar--is-hidden');
    }
    // Initiate the indicator
    if (wizardIdx > 1 && wizardFooter) {
        wizardFooter.classList.add('wizard-button-wrapper--progress-start');
    }
    else {
        wizardFooter === null || wizardFooter === void 0 ? void 0 : wizardFooter.classList.remove('wizard-button-wrapper--progress-start');
    }
    // debugger
    // Skipping first two steps
    if (wizardIdx === 0 || wizardIdx === 1)
        return;
    const currentStepGroupIdx = Number(currentWizard === null || currentWizard === void 0 ? void 0 : currentWizard.getAttribute('data-stepgroup'));
    title.innerHTML = `STEP <b>${currentStepGroupIdx}</b> of <b>3</b>`;
    if (currentStepGroupIdx === 1) {
        // First step
        if (wizardIdx === 2) {
            barEl1.style = `width: ${barLength}%;`;
            increment = barLength;
            currentStep = 2;
            return;
        }
        if (currentStep < wizardIdx) {
            currentStep += 1;
            increment += barLength;
        }
        else if (currentStep > wizardIdx) {
            currentStep -= 1;
            increment -= barLength;
        }
        barEl1.style = `width: ${increment}%; background-color: #017AC9;`;
    }
    if (currentStepGroupIdx === 2) {
        if (currentStep < wizardIdx) {
            currentStep += 1;
            increment2 += barLength2;
        }
        else if (currentStep > wizardIdx) {
            currentStep -= 1;
            increment2 -= barLength2;
        }
        barEl2.style = `width: ${increment2}%; background-color: #017AC9;`;
    }
    if (currentStepGroupIdx === 3) {
        if (currentStep < wizardIdx) {
            currentStep += 1;
            increment3 += barLength3;
        }
        else if (currentStep > wizardIdx) {
            currentStep -= 1;
            increment3 -= barLength3;
        }
        barEl3.style = `width: ${increment3}%; background-color: #017AC9;`;
    }
    // Step one
    if (currentStepGroupIdx > 1 && currentStep === 7) {
        // Step one finished
        increment = 100;
        barEl1.style = `width: ${increment}%; background-color: #388314;`;
    }
    else if (currentStepGroupIdx < 2 && currentStep === 6) {
        increment = 100;
        increment2 = 0;
        barEl1.style = `width: ${increment}%; background-color: #017AC9;`;
        barEl2.style = `width: ${increment2}%; background-color: #017AC9;`;
    }
    else if (currentStepGroupIdx < 3 && currentStep === 12) {
        increment2 = 100;
        increment3 = 0;
        barEl2.style = `width: ${increment2}%; background-color: #017AC9;`;
        barEl3.style = `width: ${increment3}%; background-color: #017AC9;`;
    }
    if (currentStepGroupIdx > 2) {
        increment2 = 100;
        barEl2.style = `width: ${increment2}%; background-color: #388314;`;
    }
    if (currentStepGroupIdx > 3) {
        increment3 = 100;
        barEl3.style = `width: ${increment3}%; background-color: #388314;`;
    }
};
