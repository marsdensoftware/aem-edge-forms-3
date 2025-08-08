import { injectLinkWithIconClass } from '../../blocks/grid-footer-summary/grid-footer-summary.js';

export default function decorate(block) {
  console.log('decorate footer links', block.outerHTML);
  const children = [...block.children];
  if (!children.length) {
    return;
  }
  const config = children[0];
  block.removeChild(config);

  const links = children.slice(1)
  injectLinkWithIconClass(links);

  const configClass = config.querySelector('p')?.innerText || '';
  for (const link of links.slice(1)) {
    link.classList.add(configClass);
  }

}

/*
TODO
strip out grid col block
remove console logging
tidy TODO/FIXME comments
 */
