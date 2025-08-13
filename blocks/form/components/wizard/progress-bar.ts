let increment = 0
let increment2 = 0
let increment3 = 0
let currentStep = 0

let barLength = 0
let barLength2 = 0
let barLength3 = 0
let progressBar: HTMLElement
let barEl1: HTMLElement
let barEl2: HTMLElement
let barEl3: HTMLElement
let wizard: HTMLElement | null
let wizardFooter: HTMLElement | null
let text: HTMLElement

const groupingSteps = (
  wizardEl: Element,
): {
  step1GroupLength: number
  step2GroupLength: number
  step3GroupLength: number
} => {
  // Check how many step groups available
  const stepsGroup = wizardEl?.querySelectorAll(':scope > [data-stepgroup]')
  // Grouped all steps that are in the same group
  const grouped: {
    [key: number]: any
  } = {}

  stepsGroup.forEach((step) => {
    const groupVal = step.getAttribute('data-stepgroup')

    if (!groupVal) {
      throw new Error('No step group')
    }

    const numberValue = Number(groupVal)

    if (!grouped[numberValue]) {
      grouped[numberValue] = []
    }

    grouped[numberValue].push(step)
  })

  return {
    step1GroupLength: grouped[1].length,
    step2GroupLength: grouped[2].length,
    step3GroupLength: grouped[3].length,
  }
}

const createProgressBarElements = () => {
  barEl1 = document.createElement('span')
  barEl2 = document.createElement('span')
  barEl3 = document.createElement('span')
  const barContainer = document.createElement('span')
  const barContainer2 = document.createElement('span')
  const barContainer3 = document.createElement('span')

  barContainer.classList.add('progress-bar__container')
  barContainer2.classList.add('progress-bar__container')
  barContainer3.classList.add('progress-bar__container')
  barEl1.classList.add('progress-bar__item')
  barEl2.classList.add('progress-bar__item')
  barEl3.classList.add('progress-bar__item')

  barContainer.append(barEl1)
  barContainer2.append(barEl2)
  barContainer3.append(barEl3)

  return {
    barContainer,
    barContainer2,
    barContainer3,
  }
}

export const createProgressBar = () => {
  progressBar = document.createElement('div')
  progressBar.classList.add('progress-bar', 'progress-bar--is-hidden')
  // Container
  const progressBarInner = document.createElement('div')
  progressBarInner.classList.add('progress-bar__inner')
  // Step title
  const title = document.createElement('span')
  title.classList.add('progress-bar__title', 'strap-title-small')

  // Added into progress bar
  const { barContainer, barContainer2, barContainer3 } =
    createProgressBarElements()
  progressBarInner.append(barContainer, barContainer2, barContainer3)
  progressBar.append(title, progressBarInner)
  // Added into footer
  wizardFooter = document.querySelector('.wizard-button-wrapper')

  if (!wizardFooter) {
    throw new Error('Can not find wizard footer element')
  }

  wizardFooter.prepend(progressBar)
  // Get steps length
  wizard = document.querySelector('.wizard')
  if (!wizard) {
    throw new Error('Can not find wizard element')
  }
  // Grab the title element
  text = document.querySelector('.progress-bar__title') as HTMLElement

  const { step1GroupLength, step2GroupLength, step3GroupLength } =
    groupingSteps(wizard)

  barLength = 100 / step1GroupLength
  barLength2 = 100 / step2GroupLength
  barLength3 = 100 / step3GroupLength
}

export const trackProgress = () => {
  const currentWizard = document.querySelector<HTMLElement>(
    '.current-wizard-step',
  )
  const wizardIdx = Number(currentWizard?.getAttribute('data-index'))
  const mainWizard = document.querySelector<HTMLElement>('fieldset.wizard')
  const fromReview = mainWizard?.classList.contains('from-review') || false
  const showBar = !fromReview && wizardIdx !== 0 && wizardIdx !== 1

  // Reset progress bar state
  if (!showBar) {
    progressBar?.classList.add('progress-bar--is-hidden')
    currentStep = 0
    increment = 0
  } else {
    progressBar?.classList.remove('progress-bar--is-hidden')
  }
  // Initiate the indicator
  if (showBar && wizardFooter) {
    wizardFooter.classList.add('wizard-button-wrapper--progress-start')
  } else {
    wizardFooter?.classList.remove('wizard-button-wrapper--progress-start')
  }

  // Skipping first two steps
  if (!showBar) return

  const currentStepGroupIdx = Number(
    currentWizard?.getAttribute('data-stepgroup'),
  )
  // Set title
  text.innerHTML = `STEP <b>${
    currentStepGroupIdx > 3 ? 3 : currentStepGroupIdx
  }</b> of <b>3</b>`

  // Set step for each group
  // First group
  if (currentStepGroupIdx === 1) {
    // First step
    if (wizardIdx === 2) {
      barEl1.style = `width: ${barLength}%;`
      increment = barLength
      currentStep = 2
      return
    }

    if (currentStep < wizardIdx) {
      currentStep += 1
      increment += barLength
    } else if (currentStep > wizardIdx) {
      currentStep -= 1
      increment -= barLength
    }

    barEl1.style = `width: ${increment}%; background-color: #017AC9;`
  }
  // Second group
  if (currentStepGroupIdx === 2) {
    if (currentStep < wizardIdx) {
      currentStep += 1
      increment2 += barLength2
    } else if (currentStep > wizardIdx) {
      currentStep -= 1
      increment2 -= barLength2
    }

    barEl2.style = `width: ${increment2}%; background-color: #017AC9;`
  }
  // Third group
  if (currentStepGroupIdx === 3) {
    if (currentStep < wizardIdx) {
      currentStep += 1
      increment3 += barLength3
    } else if (currentStep > wizardIdx) {
      currentStep -= 1
      increment3 -= barLength3
    }

    barEl3.style = `width: ${increment3}%; background-color: #017AC9;`
  }

  // Setting colour and resetting step when
  // Switching between group
  if (currentStepGroupIdx > 1 && currentStep === 7) {
    // Group ONE finished
    increment = 100
    barEl1.style = `width: ${increment}%; background-color: #388314;`
  } else if (currentStepGroupIdx < 2 && currentStep === 6) {
    // Last step on group ONE
    increment = 95
    increment2 = 0
    barEl1.style = `width: ${increment}%; background-color: #017AC9;`
    barEl2.style = `width: ${increment2}%; background-color: #017AC9;`
  } else if (currentStepGroupIdx < 3 && currentStep === 13) {
    // Last step on group TWO
    increment2 = 95
    increment3 = 0
    barEl2.style = `width: ${increment2}%; background-color: #017AC9;`
    barEl3.style = `width: ${increment3}%; background-color: #017AC9;`
  } else if (currentStepGroupIdx < 4 && currentStep === 18) {
    // Last step on group THREE
    increment3 = 95
    barEl3.style = `width: ${increment3}%; background-color: #017AC9;`
  }

  // Group TWO finished
  if (currentStepGroupIdx > 2) {
    increment2 = 100
    barEl2.style = `width: ${increment2}%; background-color: #388314;`
  }

  // Group THREE finished
  if (currentStepGroupIdx > 3) {
    increment3 = 100
    barEl3.style = `width: ${increment3}%; background-color: #388314;`
  }
}
