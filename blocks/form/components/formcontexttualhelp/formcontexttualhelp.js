export default function decorate(panelEl, model) {
    const { properties } = model;

    panelEl.classList.add('panel-formcontexttualhelp')

    if (properties.link && properties.linkText) {
        // Create the footer div
        const footerEl = document.createElement("div");

        // Optionally, add content or attributes
        footerEl.className = 'panel-formcontextualhelp__footer field-wrapper';

        // Create the anchor element
        const linkEl = document.createElement("a");

        // Set its text and href
        linkEl.href = properties.link;
        linkEl.classList.add('panel-formcontextualhelp__footer__link');

        if (properties.linkOpenInNewTab) {
            linkEl.target = '_blank';

            // add icon for external link
            // Create the span element for the icon
            const iconEl = document.createElement('span');
            // Add a class for styling
            iconEl.classList.add('panel-formcontextualhelp__footer__link-icon');

            // Create the span element for the text
            const textEl = document.createElement('span');
            textEl.textContent = properties.linkText;
            textEl.classList.add('panel-formcontextualhelp__footer__link-text');

            // Append the span elements to the a element
            linkEl.appendChild(textEl);
            linkEl.appendChild(iconEl);
        }

        // Optionally, open in new tab
        // linkEl.target = "_blank";

        // Append it to the existing element
        footerEl.appendChild(linkEl);

        // Append the new div to the existing element
        panelEl.appendChild(footerEl);
    }

    return panelEl;
}
