import { injectNestingBugClasses, handleOpenInNewTab } from '../../scripts/msd/link-with-icon.js';

export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 5) {
    return;
  }
  const links = children.slice(4);
  injectNestingBugClasses(links, 'link-with-icon');
  for (const link of links) {
    handleOpenInNewTab(link);
  }
  const imgLinkWrapper = children[1];
  const imgLink = imgLinkWrapper.querySelector('a');
  const imgWrapper = children[0];
  const img = imgWrapper.querySelector('picture');
  if (imgLink && img) {
    imgLink.appendChild(img);
    block.replaceChild(imgLinkWrapper, imgWrapper);
  }

  const configWrapper = children[3];
  const config = (configWrapper.querySelector('p')?.innerText || '').trim();
  if (!config) {
    return;
  }
  block.removeChild(configWrapper);
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
