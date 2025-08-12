import { injectNestingBugClasses } from '../../scripts/msd/link-with-icon.js';

export default function decorate(block) {
  const children = [...block.children];
  if (!children.length) {
    return;
  }
  const config = children[0];
  block.removeChild(config);

  const links = children.slice(1);
  injectNestingBugClasses(links, 'link-with-icon');

  const configClasses = (config.querySelector('p')?.innerText || '').split(',');
  for (const link of links.slice(1)) {
    for (const configClass of configClasses) {
      if (!configClass) {
        continue;
      }
      link.classList.add(configClass);
    }
  }
}
