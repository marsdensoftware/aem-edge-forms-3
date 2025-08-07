function hasBootstrapClass(e) {
  for (const className of e.classList) {
    const parts = className.split('-');
    // TODO actually, col should always be present? check bootstrap version
    if (parts.length > 0 && ['col', 'offset'].includes(parts[0])) {
      return true;
    }
  }
  return false;
}

function injectBootstrapClasses(section) {
  // TODO handle nested blocks and components inside blocks

  let hasBootstrapGrandchild = false;
  for (const child of section.children) {
    let hasBootstrapChild = false;
    for (const grandchild of child.children) {
      if (hasBootstrapClass(grandchild)) {
        console.log('detected bootstrap in', grandchild);
        hasBootstrapChild = true;
        hasBootstrapGrandchild = true;
        break;
      }
    }

    if (!hasBootstrapChild) {
      continue;
    }
    console.log('injecting row class to', child);
    child.classList.add('row');
  }

  if (!hasBootstrapGrandchild) {
    return;
  }
  console.log('injecting container class to section');
  section.classList.add('container'); // TODO what about .container-fluid?
}

export default function decorate(block) {

}
