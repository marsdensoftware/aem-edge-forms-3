export default function decorate(block) {
  console.log('decorate footer summary', block.outerHTML);
  const children = [...block.children];
  if (children.length < 3) {
    return;
  }
  for (const child of children.slice(2)) {
    console.log('adding link-with-icon class to', child.outerHTML);
    child.classList.add('link-with-icon');
    // TODO nuke the empty div and the link-with-icon div
  }
}
