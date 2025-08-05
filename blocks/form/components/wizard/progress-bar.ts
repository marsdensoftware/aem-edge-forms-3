const initialState = 1
let increment = 0
let currentStep = 0
let stepsLength = 0
let barLength = 0
let progressBar: HTMLElement
let barEl: HTMLElement

export const createProgressBar = () => {
  progressBar = document.createElement('div')

  progressBar.classList.add('progress-bar', 'progress-bar--is-hidden')
  barEl = document.createElement('span')
  const title = document.createElement('span')

  title.classList.add('progress-bar__title', 'strap-title-small')

  progressBar.append(title, barEl)

  barEl.classList.add('progress-bar__item')
  barEl.style = `width: ${initialState}%;`

  const body = document.querySelector('body')
  // const wizardFooter = document.querySelector('.wizard-button-wrapper')
  body?.append(progressBar)

  // Get steps length
  const wizard = document.querySelector('.wizard')
  const steps = wizard?.querySelectorAll(':scope > [data-index]')

  if (!steps?.length) return
  stepsLength = steps.length
  barLength = 100 / (stepsLength - 1)
}

export const trackProgress = () => {
  // Track where it is in the steps
  const currentWizard = document.querySelector('.current-wizard-step')
  const wizardIdx = Number(currentWizard?.getAttribute('data-index'))
  // Set title
  const title = document.querySelector('.progress-bar__title') as HTMLElement
  title.innerText = `STEP ${wizardIdx} of ${stepsLength}`

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
    increment += barLength
  } else if (currentStep > wizardIdx) {
    currentStep -= 1
    increment -= barLength
  }

  barEl.style = `width: ${initialState + increment}%;`
}
