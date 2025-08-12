function extractNestingBugClasses(block, blockName) {
  if (!blockName) {
    return [];
  }
  const children = [...block.children];
  if (children.length != 4) {
    return [];
  }
  const last = children[3];
  if (last.children.length != 1) {
    return [];
  }
  const para = last.querySelector('p');
  const classes = (para.innerText || '').trim()
    .split(',').map((s) => s.trim()).filter((s) => s);
  if (classes.length < 1 || classes[0] !== blockName) {
    return [];
  }
  block.removeChild(last);
  return classes;
}

function injectNestingBugClasses(elements, blockName) {
  for (const e of elements) {
    e.classList.add(blockName);
    const classes = extractNestingBugClasses(e, blockName).slice(1);
    for (const className of classes) {
      e.classList.add(className);
    }
  }
}

function handleOpenInNewTab(block) {
  const children = [...block.children];
  if (children.length != 3) {
    return;
  }
  const openInNewTab = children[2];
  if ((openInNewTab.querySelector('p')?.innerText || '').trim() === 'true') {
    const link = children[1].querySelector('a');
    if (link) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  }
  block.removeChild(openInNewTab);
}

/* eslint-disable-next-line object-curly-newline */
export { extractNestingBugClasses, injectNestingBugClasses, handleOpenInNewTab }
