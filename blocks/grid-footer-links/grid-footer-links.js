import { injectLinkWithIconClass } from '../../blocks/grid-footer-summary/grid-footer-summary.js';

export default function decorate(block) {
  console.log('decorate footer links', block.outerHTML);
  const children = [...block.children];
  if (!children.length) {
    return;
  }
  const config = children[0];
  console.log('found config', config.outerHTML);
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

/*
TODO
strip out grid col block
remove console logging
tidy TODO/FIXME comments
 */
