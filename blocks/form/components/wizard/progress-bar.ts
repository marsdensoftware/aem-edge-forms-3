const initialState = 0
let increment = 0
let currentStep = 0
let stepsLength = 0
let barLength = 0
let progressBar: HTMLElement
let barEl1: HTMLElement
let barEl2: HTMLElement
let barEl3: HTMLElement
let wizard: HTMLElement | null
let wizardFooter: HTMLElement | null

const groupLength = (
  wizardEl: Element,
): {
  step1GroupItems: NodeListOf<Element>
  step1GroupLength: number
  step2GroupLength: number
  step3GroupLength: number
  totalSteps: number
} => {
  // Check how many step groups available

  const step1Group = wizardEl?.querySelectorAll(':scope > [data-stepgroup="1"]')
  const step2Group = wizardEl?.querySelectorAll(':scope > [data-stepgroup="2"]')
  const step3Group = wizardEl?.querySelectorAll(':scope > [data-stepgroup="3"]')

  console.log(step1Group?.length)
  console.log(step2Group?.length)
  console.log(step3Group?.length)

  const totalSteps = step1Group.length + step2Group.length + step3Group.length

  return {
    step1GroupItems: step1Group,
    step1GroupLength: step1Group.length,
    step2GroupLength: step2Group.length,
    step3GroupLength: step3Group.length,
    totalSteps,
  }
}

export const createProgressBar = () => {
  progressBar = document.createElement('div')
  progressBar.classList.add('progress-bar', 'progress-bar--is-hidden')
  // Container and element colour
  barEl1 = document.createElement('span')
  barEl2 = document.createElement('span')
  barEl3 = document.createElement('span')
  const barContainer = document.createElement('span')
  // Step title
  const title = document.createElement('span')
  title.classList.add('progress-bar__title', 'strap-title-small')

  barContainer.classList.add('progress-bar__container')
  barEl1.classList.add('progress-bar__item')
  // barEl2.classList.add('progress-bar__item')
  // barEl3.classList.add('progress-bar__item')
  barEl1.style = `width: ${initialState}%;`
  // Add into progress bar
  barContainer.append(barEl1)
  progressBar.append(title, barContainer)
  // Add into footer
  wizardFooter = document.querySelector('.wizard-button-wrapper')

  if (!wizardFooter) {
    throw new Error('Can not find wizard footer element')
  }

  wizardFooter.prepend(progressBar)

  // Get steps length
  wizard = document.querySelector('.wizard')
  if (!wizard) return

  const { step1GroupLength, totalSteps } = groupLength(wizard)

  stepsLength = totalSteps
  barLength = 100 / step1GroupLength
}

export const trackProgress = () => {
  // Track where it is in the steps
  const currentWizard = document.querySelector('.current-wizard-step')
  const wizardIdx = Number(currentWizard?.getAttribute('data-index'))
  // Set title
  const title = document.querySelector('.progress-bar__title') as HTMLElement

  // Reset progress bar state
  if (wizardIdx === 0 || wizardIdx === 1) {
    progressBar?.classList.add('progress-bar--is-hidden')
    currentStep = 0
    increment = 0
  } else {
    progressBar?.classList.remove('progress-bar--is-hidden')
  }
  // Initiate the indicator
  if (wizardIdx > 1 && wizardFooter) {
    wizardFooter.classList.add('wizard-button-wrapper--progress-start')
  } else {
    wizardFooter?.classList.remove('wizard-button-wrapper--progress-start')
  }

  // debugger

  if (wizardIdx === 0 || wizardIdx === 1) return

  const currentStepGroupIdx = Number(
    currentWizard?.getAttribute('data-stepgroup'),
  )
  title.innerHTML = `STEP <b>${currentStepGroupIdx}</b> of <b>3</b>`

  // first step
  if (wizardIdx === 2) {
    barEl1.style = `width: ${barLength}%;`
    increment = barLength
    currentStep = 2
    return
  }

  // Tracking current step
  if (currentStep < wizardIdx) {
    currentStep += 1
    increment += barLength
  } else if (currentStep > wizardIdx) {
    currentStep -= 1
    increment -= barLength
  }

  barEl1.style = `width: ${increment}%;`

  // if (!wizard) return

  // const { step1GroupItems, step1GroupLength } = groupLength(wizard)

  // console.log(step1GroupItems[step1GroupLength - 1])
  // console.log(step1GroupLength)
}
