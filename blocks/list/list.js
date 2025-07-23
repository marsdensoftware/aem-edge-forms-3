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

function configFromFields(block) {
  // TODO validate url
  const src = block.querySelector('[data-aue-prop="source"]');

  // TODO strip and check not empty
  const offset_arg = block.querySelector('[data-aue-prop="offset-arg"]');
  const page_size_arg = block.querySelector('[data-aue-prop="page-size-arg"]');

  // TODO to integer
  const page_size = block.querySelector('[data-aue-prop="page-size"]');

  // TODO validate?
  const item_type = block.querySelector('[data-aue-prop="select-output"]');

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
