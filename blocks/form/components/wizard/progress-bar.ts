// const panelCount = async (panels: number[]) => panels.length
const initialState = 1
let increment = 1
let currentStep = 0

export const createProgressBar = async () => {
  const progressBar = document.createElement('div')

  progressBar.classList.add('progress-bar')
  const bar = document.createElement('span')
  progressBar.append(bar)
  bar.classList.add('progress-bar__item')
  bar.style = `width: ${initialState}%;`

  const body = document.querySelector('body')
  // const wizardFooter = document.querySelector('.wizard-button-wrapper')
  body?.append(progressBar)
}

export const trackProgress = () => {
  // Get steps length
  // const wizard = document.querySelector('.wizard')
  // const steps = wizard?.querySelectorAll(':scope > [data-index]')
  // Track where it is in the steps
  const currentWizard = document.querySelector('.current-wizard-step')
  const wizardIdx = Number(currentWizard?.getAttribute('data-index'))

  const bar = document.querySelector('.progress-bar__item') as HTMLElement

  if (currentStep < wizardIdx) {
    currentStep += 1
    increment += 1
  } else if (currentStep > wizardIdx) {
    currentStep -= 1
    increment -= 1
  }

  bar.style = `width: ${initialState + increment}%;`
}

export default createProgressBar
