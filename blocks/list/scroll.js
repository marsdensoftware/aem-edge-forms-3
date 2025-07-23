const default_page_size = 25;

export const PagerConfig = {
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
