export default function decorate(panelEl, model) {
    const properties = { model };
    
    panelEl.classList.add('panel-formcontexttualhelp')

    if (properties.link && properties.linkText) {
        // Create the footer div
        const footerEl = document.createElement("div");

        // Optionally, add content or attributes
        footerEl.className = 'panel-formcontextualhelp__footer';

        // Create the anchor element
        const linkEl = document.createElement("a");

        // Set its text and href
        linkEl.textContent = properties.linkText;
        linkEl.href = properties.link;

        // Optionally, open in new tab
        // linkEl.target = "_blank";

        // Append it to the existing element
        footerEl.appendChild(linkEl);

        // Append the new div to the existing element
        panelEl.appendChild(footerEl);
    }

    return panelEl;
}
