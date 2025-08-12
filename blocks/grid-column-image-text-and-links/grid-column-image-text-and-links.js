import { injectNestingBugClasses } from '../../scripts/msd/link-with-icon.js';

export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 4) {
    return;
  }
  const links = children.slice(3);
  injectNestingBugClasses(links, 'link-with-icon');

  const config = (children[2].querySelector('p')?.innerText || '').trim();
  if (!config) {
    return;
  }
  const wrapper = document.createElement('div');
  const configClasses = config.split(',');
  for (const configClass of configClasses) {
    if (!configClass) {
      continue;
    }
    wrapper.classList.add(configClass);
  }

  for (const link of links) {
    wrapper.appendChild(link);
  }
  block.appendChild(wrapper);
}
