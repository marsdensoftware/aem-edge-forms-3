import { injectLinkWithIconClass } from '../../blocks/grid-footer-summary/grid-footer-summary.js';

export default function decorate(block) {
  console.log('decorate footer split', block.outerHTML);
  block.classList.add('row');

  const children = [...block.children];
  if (children.length < 4) {
    return;
  }
  const subcols = children.slice(0, 2);
  const configs = children.slice(2, 4);
  const links = children.slice(4)

  injectLinkWithIconClass(links);
  for (const link of links) {
    link.classList.add('col-12');
  }

  for (const config of configs) {
    block.removeChild(config);
    console.log("subcol has config", configs.outerHTML);
  }


  const innerRow = document.createElement('div');
  for (const subcol of subcols) {
    block.removeChild(subcol);
    innerRow.appendChild(subcol);
    // TODO inject config
  }

  // TODO if the block classes get hoist to the wrapper, then the block should be the row
  // and in that case, the links need to be col? or col-12? or col-{parent-width}????
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
