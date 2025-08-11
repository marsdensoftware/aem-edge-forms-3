import { injectLinkWithIconClass } from '../../blocks/grid-column-image-text-and-links/grid-column-image-text-and-links.js';

export default function decorate(block) {
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
    const values = config.querySelector('p')?.innerText || '';
    for (const value of values.split(',')) {
      subcols[index].classList.add(value)
    }
  }

  for (const subcol of subcols) {
    block.appendChild(subcol);
  }
}
