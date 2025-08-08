import { injectLinkWithIconClass } from '../../blocks/grid-footer-summary/grid-footer-summary.js';

export default function decorate(block) {
  console.log('decorate footer links', block.outerHTML);
  const children = [...block.children];
  if (!children.length) {
    return;
  }
  injectLinkWithIconClass(children);
}
