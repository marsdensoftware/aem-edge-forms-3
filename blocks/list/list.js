const default_page_size = 25;

const PagerConfig = {
  infinite: true, // TODO FIXME support regular paged mode again
  infinite_arg: 'infinite',

  offset: 0,
  offset_arg: 'skip',
  top_offset: 0,

  page_size: default_page_size,
  page_size_arg: 'limit',

  total: null, // TODO might not be available

  set_offset(n) {
    this.offset = n > 0 ? n : 0;
  },

  set_page_size(n) {
    this.page_size = n > 0 && n < 100 ? n : default_page_size;
  },
}

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
  /*select by data-aue-prop= like document.querySelector('[data-aue-prop="14"]');*/
}
