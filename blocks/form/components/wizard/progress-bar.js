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
export const createProgressBar = () => __awaiter(void 0, void 0, void 0, function* () {
    const progressBar = document.createElement('div');
    progressBar.classList.add('progress-bar');
    const bar = document.createElement('span');
    progressBar.append(bar);
    bar.classList.add('progress-bar__item');
    bar.style = `width: ${initialState}%;`;
    const body = document.querySelector('body');
    body === null || body === void 0 ? void 0 : body.append(progressBar);
});
export const trackProgress = () => {
    // Get steps length
    const wizard = document.querySelector('.wizard');
    const steps = wizard === null || wizard === void 0 ? void 0 : wizard.querySelectorAll(':scope > [data-index]');
    // TODO: track where it is in the steps
    const bar = document.querySelector('.progress-bar__item');
    bar.style = `width: ${initialState + increment}%;`;
    console.log(wizard, steps === null || steps === void 0 ? void 0 : steps.length);
    increment += 1;
};
console.log('Progress bar file...');
export default createProgressBar;
