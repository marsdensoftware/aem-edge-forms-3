var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// const panelCount = async (panels: number[]) => panels.length
const initialState = 1;
let increment = 1;
let currentStep = 0;
export const createProgressBar = () => __awaiter(void 0, void 0, void 0, function* () {
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    const bar = document.createElement('span');
    progressBar.append(bar);
    bar.classList.add('progress-bar__item');
    bar.style = `width: ${initialState}%;`;
    const body = document.querySelector('body');
    // const wizardFooter = document.querySelector('.wizard-button-wrapper')
    body === null || body === void 0 ? void 0 : body.append(progressBar);
});
export const trackProgress = () => {
    // Get steps length
    // const wizard = document.querySelector('.wizard')
    // const steps = wizard?.querySelectorAll(':scope > [data-index]')
    // Track where it is in the steps
    const currentWizard = document.querySelector('.current-wizard-step');
    const wizardIdx = Number(currentWizard === null || currentWizard === void 0 ? void 0 : currentWizard.getAttribute('data-index'));
    const bar = document.querySelector('.progress-bar__item');
    if (currentStep < wizardIdx) {
        currentStep += 1;
        increment += 1;
    }
    else if (currentStep > wizardIdx) {
        currentStep -= 1;
        increment -= 1;
    }
    bar.style = `width: ${initialState + increment}%;`;
};
export default createProgressBar;
