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
    console.log("subcol has config", config.outerHTML, config.querySelector('p').innerText);
  }

  for (const subcol of subcols) {
    block.appendChild(subcol);
    //block.classList.add();
    // TODO inject config
  }
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
