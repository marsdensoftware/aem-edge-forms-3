// const panelCount = async (panels: number[]) => panels.length
const initialState = 1
let increment = 1

export const createProgressBar = async () => {
  const progressBar = document.createElement('div')

  progressBar.classList.add('progress-bar')
  const bar = document.createElement('span')
  progressBar.append(bar)
  bar.classList.add('progress-bar__item')
  bar.style = `width: ${initialState}%;`

  const body = document.querySelector('body')
  body?.append(progressBar)
}

export const trackProgress = () => {
  // Get steps length
  const wizard = document.querySelector('.wizard')
  const steps = wizard?.querySelectorAll(':scope > [data-index]')
  // TODO: track where it is in the steps

  const bar = document.querySelector('.progress-bar__item') as HTMLElement
  bar.style = `width: ${initialState + increment}%;`
  console.log(wizard, steps?.length)
  increment += 1
}

console.log('Progress bar file...')
export default createProgressBar
