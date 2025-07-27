export function getOptions(block, blockName) {
  // Get the block's classes, excluding 'block' and 'blockName'; anything remaining is a block option.
  return [...block.classList].filter((c) => !['block', `${blockName}`].includes(c));
}