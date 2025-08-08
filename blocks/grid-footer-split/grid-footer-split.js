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

  for (const [index, config] of configs.entries()) {
    block.removeChild(config);
    const values = config.querySelector('p').innerText;
    for (const value of values.split(',')) {
      subcols[index].classList.add(value)
    }
  }

  for (const subcol of subcols) {
    block.appendChild(subcol);
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
