export default function decorate(panelEl, model) {
    const { properties } = model;
    const className = 'panel-formcontextualhelp';

    panelEl.classList.add(`${className}`);

    const legendEl = panelEl.querySelector('legend');

    // wrap existing content inside a span
    const text = legendEl.textContent.trim();
    legendEl.innerHTML = `<span class="${className}__title">${text}</span>`;

    // Add icon to legend
    // Create the span element for the icon
    const lIconEl = document.createElement('span');
    // Add a class for styling
    lIconEl.classList.add(`${className}__icon`);

    legendEl.prepend(lIconEl);

    const helpType = properties.helpType || 'info';
    panelEl.classList.add(`${className}--${helpType}`);

    if (properties.link && properties.linkText) {
        // Create the footer div
        const footerEl = document.createElement("div");

        // Optionally, add content or attributes
        footerEl.className = `${className}__footer`;

        // Create the anchor element
        const linkEl = document.createElement("a");

        // Set its text and href
        linkEl.href = properties.link;
        linkEl.classList.add(`${className}__footer__link`);

        // Create the span element for the text
        const textEl = document.createElement('span');
        textEl.textContent = properties.linkText;
        textEl.classList.add(`${className}__footer__link-text`);

        // Append the span elements to the a element
        linkEl.appendChild(textEl);

        if (properties.linkOpenInNewTab) {
            linkEl.target = '_blank';

            // Add icon for external link
            // Create the span element for the icon
            const iconEl = document.createElement('span');
            // Add a class for styling
            iconEl.classList.add(`${className}__footer__link-icon`);

            linkEl.appendChild(iconEl);
        }

        // Append the link to the footer
        footerEl.appendChild(linkEl);

        // Append the footer to the main element
        panelEl.appendChild(footerEl);
    }

    return panelEl;
}
