function decorate(block: Element) {
  const [mainMenuInner] = block.children
  mainMenuInner.classList.add('main-menu__inner')
  // Main left action
  const mainAction = document.createElement('nav')
  mainAction.classList.add('main-menu__main-action')

  // LOGO
  const logo = document.createElement('a')
  logo.classList.add('main-menu__logo')
  const logoText = document.createElement('span')
  logoText.innerHTML = 'Ministry of Social and Development'
  logo.appendChild(logoText)

  mainAction.append(logo)

  const userButton = document.createElement('button')
  userButton.classList.add('main-menu__user-button')

  mainMenuInner.append(mainAction, userButton)
}

export default decorate
