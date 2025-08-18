// Constants and helpers
const COLOR_ACTIVE = '#017AC9'   // active group color
const COLOR_COMPLETE = '#388314' // completed group color
const LAST_STEP_CAP = 95         // last step is shown as 95% until next group loads

const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, val))

const getGroupSteps = (root: Element, group: number): HTMLElement[] =>
    Array.from(root.querySelectorAll(`:scope > [data-stepgroup="${group}"]`)) as HTMLElement[]

const setBar = (el: HTMLElement, widthPct: number, color?: string) => {
  el.style.width = `${clamp(widthPct)}%`
  if (color) {
    el.style.backgroundColor = color
  } else {
    el.style.removeProperty('background-color')
  }
}

const computeCurrentGroupProgress = (wizardEl: Element, currentStepEl: HTMLElement) => {
  const currentGroup = Number(currentStepEl.getAttribute('data-stepgroup'))
  const stepsInGroup = getGroupSteps(wizardEl, currentGroup)
  const positionInGroup = stepsInGroup.findIndex((s) => s === currentStepEl) + 1 // 1-based
  const totalInGroup = stepsInGroup.length

  // If somehow not found, fallback safely
  if (positionInGroup <= 0 || totalInGroup <= 0) {
    return { currentGroup, currentWidth: 0, totals: { 1: 0, 2: 0, 3: 0 } }
  }

  const raw = (positionInGroup / totalInGroup) * 100
  const capped = positionInGroup === totalInGroup ? Math.min(raw, LAST_STEP_CAP) : raw

  return {
    currentGroup,
    currentWidth: clamp(capped),
    totals: {
      1: getGroupSteps(wizardEl, 1).length,
      2: getGroupSteps(wizardEl, 2).length,
      3: getGroupSteps(wizardEl, 3).length,
    },
  }
}

// Previous globals trimmed to only required references
let progressBar: HTMLElement
let barEl1: HTMLElement
let barEl2: HTMLElement
let barEl3: HTMLElement
let wizard: HTMLElement | null
let wizardFooter: HTMLElement | null
let text: HTMLElement

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
  // Get wizard root
  wizard = document.querySelector('.wizard')
  if (!wizard) {
    throw new Error('Can not find wizard element')
  }
  // Grab the title element
  text = document.querySelector('.progress-bar__title') as HTMLElement
}

export const trackProgress = () => {
  const currentWizard = document.querySelector<HTMLElement>('.current-wizard-step')
  const wizardIdx = Number(currentWizard?.getAttribute('data-index'))
  const mainWizard = document.querySelector<HTMLElement>('fieldset.wizard')
  const fromReview = mainWizard?.classList.contains('from-review') || false
  const showBar = !fromReview && wizardIdx !== 0 && wizardIdx !== 1

  // Reset progress bar state
  if (!showBar) {
    progressBar?.classList.add('progress-bar--is-hidden')
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
  if (!showBar || !wizard || !currentWizard) return

  const currentStepGroupIdx = Number(currentWizard.getAttribute('data-stepgroup'))
  // Title shows max 3 groups
  text.innerHTML = `STEP <b>${currentStepGroupIdx > 3 ? 3 : currentStepGroupIdx}</b> of <b>3</b>`

  // Step group 4: all sections are deemed complete
  if (currentStepGroupIdx >= 4) {
    setBar(barEl1, 100, COLOR_COMPLETE)
    setBar(barEl2, 100, COLOR_COMPLETE)
    setBar(barEl3, 100, COLOR_COMPLETE)
    return
  }

  // Compute deterministic progress for current group
  const { currentGroup, currentWidth } = computeCurrentGroupProgress(wizard, currentWizard)

  // By rule:
  // - Groups before current = 100% (complete)
  // - Current group = computed width (capped to 95% on last step)
  // - Groups after current = 0%
  const widths = {
    1: currentGroup > 1 ? 100 : currentGroup === 1 ? currentWidth : 0,
    2: currentGroup > 2 ? 100 : currentGroup === 2 ? currentWidth : 0,
    3: currentGroup > 3 ? 100 : currentGroup === 3 ? currentWidth : 0,
  }

  // Colors: completed = green, active = blue, future = default
  setBar(barEl1, widths[1], currentGroup === 1 ? COLOR_ACTIVE : widths[1] === 100 ? COLOR_COMPLETE : undefined)
  setBar(barEl2, widths[2], currentGroup === 2 ? COLOR_ACTIVE : widths[2] === 100 ? COLOR_COMPLETE : undefined)
  setBar(barEl3, widths[3], currentGroup === 3 ? COLOR_ACTIVE : widths[3] === 100 ? COLOR_COMPLETE : undefined)
}
