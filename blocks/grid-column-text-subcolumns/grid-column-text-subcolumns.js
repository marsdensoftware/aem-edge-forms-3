import { injectNestingBugClasses } from '../../scripts/msd/link-with-icon.js';

export default function decorate(block) {
  block.classList.add('row');

  const children = [...block.children];
  if (children.length < 9) {
    return;
  }
  let nCols = parseInt(children[4]?.innerText, 10);
  if (!Number.isSafeInteger(nCols) || nCols < 1 || 4 < nCols) {
    return;
  }
  block.removeChild(children[4]);
  const activeSubcols = children.slice(0, nCols);
  const inactiveSubcols = children.slice(nCols, 4);

  const activeConfigs = children.slice(5, 5+nCols);
  const inactiveConfigs = children.slice(5+nCols, 9);
  const links = children.slice(9);

  injectNestingBugClasses(links, 'link-with-icon');
  for (const link of links) {
    link.classList.add('col-12');
  }

  for (const config of inactiveConfigs) {
    block.removeChild(config);
  }
  for (const subcol of inactiveSubcols) {
    block.removeChild(subcol);
  }

  for (const [index, config] of activeConfigs.entries()) {
    block.removeChild(config);

    const values = config.querySelector('p')?.innerText || '';
    for (const value of values.split(',')) {
      activeSubcols[index].classList.add(value)
    }
  }

  for (const subcol of activeSubcols) {
    block.appendChild(subcol);
  }
}
