import { injectLinkWithIconClass } from '../../blocks/grid-footer-summary/grid-footer-summary.js';

export default function decorate(block) {
  console.log('decorate footer links', block.outerHTML);
  const children = [...block.children];
  if (children.length < 4) {
    return;
  }
  const subcols = children.slice(0, 2);
  const configs = children.slice(2, 4);
  const links = children.slice(4)

  injectLinkWithIconClass(links);

  for (const config of configs) {
    block.removeChild(config);
    console.log("subcol has config", configs.outerHTML);
  }

  const innerRow = document.createElement('div');
  innerRow.classList.add('row');
  for (const subcol of subcols) {
    block.removeChild(subcol);
    innerRow.appendChild(subcol);
    // TODO inject config
  }

  block.append(innerRow); // wrap and move subcolumns to the end
  // TODO decorate sub grid? maybe need to wrap in a row?
}

/*
TODO need a way to hide all but the top link at certain breakpoints?
TODO also need a way for the first link to be styled larger?

Summary:
all links are small

Links:
First link is large
Rest are small and collapse

Split:
First link is large
link-with-icon at top
then
splits - subgrid?
 */
