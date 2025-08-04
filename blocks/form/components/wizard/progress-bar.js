const initialState = 1;
let increment = 0;
let currentStep = 0;
export const createProgressBar = () => {
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar', 'progress-bar--is-hidden');
    const bar = document.createElement('span');
    const title = document.createElement('span');
    title.classList.add('progress-bar__title', 'strap-title-small');
    progressBar.append(title, bar);
    bar.classList.add('progress-bar__item');
    bar.style = `width: ${initialState}%;`;
    const body = document.querySelector('body');
    // const wizardFooter = document.querySelector('.wizard-button-wrapper')
    body === null || body === void 0 ? void 0 : body.append(progressBar);
};
const progressLength = (stepsLength) => {
    const result = 100 / stepsLength;
    return result;
};
export const trackProgress = () => {
    // Get steps length
    const wizard = document.querySelector('.wizard');
    const steps = wizard === null || wizard === void 0 ? void 0 : wizard.querySelectorAll(':scope > [data-index]');
    // Track where it is in the steps
    const currentWizard = document.querySelector('.current-wizard-step');
    const wizardIdx = Number(currentWizard === null || currentWizard === void 0 ? void 0 : currentWizard.getAttribute('data-index'));
    // Set title
    const title = document.querySelector('.progress-bar__title');
    const stepsLength = (steps === null || steps === void 0 ? void 0 : steps.length) ? steps.length - 1 : 0;
    title.innerText = `STEP ${wizardIdx} of ${stepsLength}`;
    // Progress bar element
    const progressBar = document.querySelector('.progress-bar');
    const bar = document.querySelector('.progress-bar__item');
    const inc = progressLength(stepsLength);
    // Reset progress bar state
    if (wizardIdx === 0) {
        progressBar === null || progressBar === void 0 ? void 0 : progressBar.classList.add('progress-bar--is-hidden');
        currentStep = 0;
        increment = 0;
    }
    else {
        progressBar === null || progressBar === void 0 ? void 0 : progressBar.classList.remove('progress-bar--is-hidden');
    }
    // Tracking current step
    if (currentStep < wizardIdx) {
        currentStep += 1;
        increment += inc;
    }
    else if (currentStep > wizardIdx) {
        currentStep -= 1;
        increment -= inc;
    }
    bar.style = `width: ${initialState + increment}%;`;
};
