import { injectNestingBugClasses } from '../../scripts/msd/link-with-icon.js';

export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 3) {
    return;
  }
  injectNestingBugClasses(children.slice(2), 'link-with-icon-item');
}
