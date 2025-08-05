export default function decorate(block) {
  const children = [...block.children]

  const openInNewTab = children[2]?.textContent.trim()

  if (openInNewTab) {
    children[1]?.querySelector('a')?.setAttribute('target', '_blank')
  }
}
