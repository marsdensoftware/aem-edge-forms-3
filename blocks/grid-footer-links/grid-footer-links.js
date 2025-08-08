import { injectLinkWithIconClass } from '../../blocks/grid-footer-summary/grid-footer-summary.js';

export default function decorate(block) {
  console.log('decorate footer links', block.outerHTML);
  // TODO only the first should be a link, so we need to re-order?
  // extract the first N as splits, and re-insert at end
  const children = [...block.children];
  if (!children.length) {
    return;
  }
  injectLinkWithIconClass(children);
}
