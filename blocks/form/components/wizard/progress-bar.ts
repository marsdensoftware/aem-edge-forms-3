const initialState = 1
let increment = 0
let currentStep = 0

export const createProgressBar = () => {
  const progressBar = document.createElement('div')

  progressBar.classList.add('progress-bar', 'progress-bar--is-hidden')
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
  // Progress bar element
  const progressBar = document.querySelector('.progress-bar')
  const bar = document.querySelector('.progress-bar__item') as HTMLElement

  // Reset progress bar state
  if (wizardIdx === 0) {
    progressBar?.classList.add('progress-bar--is-hidden')
    currentStep = 0
    increment = 0
  } else {
    progressBar?.classList.remove('progress-bar--is-hidden')
  }
  // Tracking current step
  if (currentStep < wizardIdx) {
    currentStep += 1
    increment += 1
  } else if (currentStep > wizardIdx) {
    currentStep -= 1
    increment -= 1
  }

  bar.style = `width: ${initialState + increment}%;`
}
