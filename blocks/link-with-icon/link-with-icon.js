import { getOptions } from '../utils.js'

/**
 * Entry point to the block's JavaScript.
 *
 * @param {HTMLElement} block represents the block's DOM element/tree
 */
export default function decorate(block) {
  const blockName = 'link-with-icon';
  const blockOptions = getOptions(block, blockName)

  /* Common treatments for all options */
  const els = block.querySelectorAll(':scope > div');

  // 0 -> icon, 1 -> link
  els[0]?.classList.add('link-with-icon__icon');
  els[1]?.classList.add('link-with-icon__link');

  /* Conditional treatments for specific options */
  if (blockOptions.includes('icon--right')) {
    /* Move icon to the right */
    block.insertBefore(els[1], els[0]);
  }
}
