const initialState = 0;
let increment = 0;
let currentStep = 0;
let stepsLength = 0;
let barLength = 0;
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
    console.log(step1Group === null || step1Group === void 0 ? void 0 : step1Group.length);
    console.log(step2Group === null || step2Group === void 0 ? void 0 : step2Group.length);
    console.log(step3Group === null || step3Group === void 0 ? void 0 : step3Group.length);
    const totalSteps = step1Group.length + step2Group.length + step3Group.length;
    return {
        step1GroupItems: step1Group,
        step1GroupLength: step1Group.length,
        step2GroupLength: step2Group.length,
        step3GroupLength: step3Group.length,
        totalSteps,
    };
};
export const createProgressBar = () => {
    progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar', 'progress-bar--is-hidden');
    // Container and element colour
    barEl1 = document.createElement('span');
    barEl2 = document.createElement('span');
    barEl3 = document.createElement('span');
    const barContainer = document.createElement('span');
    // Step title
    const title = document.createElement('span');
    title.classList.add('progress-bar__title', 'strap-title-small');
    barContainer.classList.add('progress-bar__container');
    barEl1.classList.add('progress-bar__item');
    // barEl2.classList.add('progress-bar__item')
    // barEl3.classList.add('progress-bar__item')
    barEl1.style = `width: ${initialState}%;`;
    // Add into progress bar
    barContainer.append(barEl1);
    progressBar.append(title, barContainer);
    // Add into footer
    wizardFooter = document.querySelector('.wizard-button-wrapper');
    if (!wizardFooter) {
        throw new Error('Can not find wizard footer element');
    }
    wizardFooter.prepend(progressBar);
    // Get steps length
    wizard = document.querySelector('.wizard');
    if (!wizard)
        return;
    const { step1GroupLength, totalSteps } = groupLength(wizard);
    stepsLength = totalSteps;
    barLength = 100 / step1GroupLength;
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
    if (wizardIdx === 0 || wizardIdx === 1)
        return;
    const currentStepGroupIdx = Number(currentWizard === null || currentWizard === void 0 ? void 0 : currentWizard.getAttribute('data-stepgroup'));
    title.innerHTML = `STEP <b>${currentStepGroupIdx}</b> of <b>3</b>`;
    // first step
    if (wizardIdx === 2) {
        barEl1.style = `width: ${barLength}%;`;
        increment = barLength;
        currentStep = 2;
        return;
    }
    // Tracking current step
    if (currentStep < wizardIdx) {
        currentStep += 1;
        increment += barLength;
    }
    else if (currentStep > wizardIdx) {
        currentStep -= 1;
        increment -= barLength;
    }
    barEl1.style = `width: ${increment}%;`;
    // if (!wizard) return
    // const { step1GroupItems, step1GroupLength } = groupLength(wizard)
    // console.log(step1GroupItems[step1GroupLength - 1])
    // console.log(step1GroupLength)
};
