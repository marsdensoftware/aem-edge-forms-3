import { injectLinkWithIconClass } from '../../blocks/grid-column-image-text-and-links/grid-column-image-text-and-links.js';

export default function decorate(block) {
  const children = [...block.children];
  if (!children.length) {
    return;
  }
  const config = children[0];
  block.removeChild(config);

  const links = children.slice(1)
  injectLinkWithIconClass(links);

  const configClasses = (config.querySelector('p')?.innerText || '').split(',');
  for (const link of links.slice(1)) {
    for (const configClass of configClasses) {
      link.classList.add(configClass);
    }
  }
}
