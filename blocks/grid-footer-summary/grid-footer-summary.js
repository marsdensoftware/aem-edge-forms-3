export function purgeLinkWithIconBug(block) {
  const children = [...block.children];
  if (children.length != 4) {
    return;
  }
  const last = children[3];
  if (last.children.length != 1) {
    return;
  }
  const para = last.querySelector('p');
  if ((para.innerText || '').trim() !== 'link-with-icon') {
    return;
  }
  block.removeChild(last);
}

export function injectLinkWithIconClass(elements) {
  for (const e of elements) {
    console.log('adding link-with-icon class to', e.outerHTML);
    e.classList.add('link-with-icon');
    purgeLinkWithIconBug(e);
  }
}

export default function decorate(block) {
  console.log('decorate footer summary', block.outerHTML);
  const children = [...block.children];
  if (children.length < 3) {
    return;
  }
  injectLinkWithIconClass(children.slice(2));
}
