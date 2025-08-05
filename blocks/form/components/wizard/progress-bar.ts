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
  const barContainer = document.createElement('span')

  const title = document.createElement('span')
  title.classList.add('progress-bar__title', 'strap-title-small')

  barContainer.classList.add('progress-bar__container')
  barEl.classList.add('progress-bar__item')
  barEl.style = `width: ${initialState}%;`

  barContainer.append(barEl)
  progressBar.append(title, barContainer)

  const wizardFooter = document.querySelector('.wizard-button-wrapper')
  wizardFooter?.prepend(progressBar)

  // Get steps length
  const wizard = document.querySelector('.wizard')
  const steps = wizard?.querySelectorAll(':scope > [data-index]')

  if (!steps?.length) return
  stepsLength = steps.length - 1
  barLength = 100 / stepsLength
}

export const trackProgress = () => {
  // Track where it is in the steps
  const currentWizard = document.querySelector('.current-wizard-step')
  const wizardIdx = Number(currentWizard?.getAttribute('data-index'))
  // Set title
  const title = document.querySelector('.progress-bar__title') as HTMLElement
  title.innerHTML = `STEP <b>${wizardIdx}</b> of <b>${stepsLength}</b>`

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
