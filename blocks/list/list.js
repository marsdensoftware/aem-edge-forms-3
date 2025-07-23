import { PagerConfig } from './scroll.js';
import { validUrl } from './utils.js';

function dataProp(block, name) {
  return (block.querySelector(`[data-aue-prop="${name}"]`)?.innerText || '').trim();
}

function configFromFields(block) {
  // TODO validate url
  const src = dataProp(block, 'source');

  // TODO check not empty
  const offset_arg = dataProp(block, 'offset-arg');
  const page_size_arg = dataProp(block, 'page-size-arg');

  // TODO to integer
  const page_size = dataProp(block, 'page-size');

  // TODO validate?
  const item_type = dataProp(block, 'select-output');

  const result = Object.create(PagerConfig);
  result.source = src;
  result.offset_arg = offset_arg;
  result.page_size_arg = page_size_arg;
  result.set_page_size(page_size);
  result.src = src;
  return result;
}

export default function decorate(block) {
  console.log('decorating', block);

  const config = configFromFields(block);
  console.log('extracted config', config);

  const button = document.createElement('button');
  button.innerText = 'Click here';
  button.onclick = function() {console.log('clicked');};
  button.className = 'hack'; // TODO FIXME temp
  block.replaceChildren(button);
}
