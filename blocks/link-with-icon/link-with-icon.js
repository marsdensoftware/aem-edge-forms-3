export default function decorate(block) {
  const children = [...block.children]

  const openInNewTab = children[2]?.textContent.trim()
  children[0]?.classList.add('icon')
  const icon = children[0]?.querySelector('picture')

  if (!icon) {
    block.classList.add('no-icon');
  }

  if (openInNewTab) {
    children[1]?.querySelector('a')?.setAttribute('target', '_blank')
  }
}
