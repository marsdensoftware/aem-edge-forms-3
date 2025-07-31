// debugger

const createProgressBar = async () => {
  const wizardFooterNav = document.querySelector('.wizard-button-wrapper')
  console.log('Create progress bar', wizardFooterNav)

  if (wizardFooterNav) {
    console.log(wizardFooterNav, 'is loaded...')
  }
}

// window.addEventListener('load', (event) => {
//   console.log('Finished loading...')
//   createProgressBar()
// })

console.log('Progress bar file...')

export default createProgressBar
