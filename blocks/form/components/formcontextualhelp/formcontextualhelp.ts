interface Model {
  properties: {
    helpType: string
    link: string
    linkOpenInNewTab: boolean
    hideIcon: boolean
    linkText: string
  }
}

export default function decorate(panelEl: Element, model: Model) {
  const { properties } = model

  const className = 'panel-formcontextualhelp'

  panelEl.classList.add(`${className}`)

  const legendEl = panelEl.querySelector('legend')

  // wrap existing content inside a span
  const text = legendEl?.textContent?.trim()
  const infoTitle = document.createElement('span')
  infoTitle.classList.add(`${className}__title`)
  infoTitle.innerHTML = text ?? ''

  const infoHeader = document.createElement('div')
  infoHeader.className = 'panel-formcontextualhelp__header'

  // Add icon to legend
  // Create the span element for the icon
  const lIconEl = document.createElement('span')
  // Add a class for styling
  lIconEl.classList.add(`${className}__icon`)

  infoHeader.append(lIconEl)
  infoHeader.append(infoTitle)

  panelEl.prepend(infoHeader)
  legendEl?.remove()

  const helpType = properties.helpType || 'info'
  const hideIcon = properties.hideIcon;
  
  panelEl.classList.add(`${className}--${helpType}`)
  if(hideIcon){
    panelEl.classList.add(`${className}--no-icon`)  
  }

  if (properties.link && properties.linkText) {
    // Create the footer div
    const footerEl = document.createElement('div')

    // Optionally, add content or attributes
    footerEl.className = `${className}__footer`

    // Create the anchor element
    const linkEl = document.createElement('a')

    // Set its text and href
    linkEl.href = properties.link
    linkEl.classList.add(`${className}__footer__link`)

    // Create the span element for the text
    const textEl = document.createElement('span')
    textEl.textContent = properties.linkText
    textEl.classList.add(`${className}__footer__link-text`)

    // Append the span elements to the a element
    linkEl.appendChild(textEl)

    if (properties.linkOpenInNewTab) {
      linkEl.target = '_blank'

      // Add icon for external link
      // Create the span element for the icon
      const iconEl = document.createElement('span')
      // Add a class for styling
      iconEl.classList.add(`${className}__footer__link-icon`)

      linkEl.appendChild(iconEl)
    }

    // Append the link to the footer
    footerEl.appendChild(linkEl)

    // Append the footer to the main element
    panelEl.appendChild(footerEl)
  }

  return panelEl
}
