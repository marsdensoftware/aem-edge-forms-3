import { injectLinkWithIconClass } from '../../blocks/grid-column-image-text-and-links/grid-column-image-text-and-links.js';

export default function decorate(block) {
  block.classList.add('row');

  const children = [...block.children];
  if (children.length < 9) {
    return;
  }
  let nCols = children[4]; // TODO does this come out as an integer?
  console.log('got nCols', nCols, typeof(nCols));
  if (nCols < 1 || 4 < nCols) {
    nCols = 2;
  }
  const activeSubcols = children.slice(0, nCols);
  const inactiveSubcols = children.slice(nCols, 4);

  const activeConfigs = children.slice(5, 5+nCols);
  const inactiveConfigs = children.slice(5+nCols, 9);
  const links = children.slice(9)

  injectLinkWithIconClass(links);
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
      subcols[index].classList.add(value)
    }
  }

  for (const subcol of activeSubcols) {
    block.appendChild(subcol);
  }
}
