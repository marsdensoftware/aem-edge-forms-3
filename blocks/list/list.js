import { Pager, PagerConfig, makePageLoadObserver, makePositionObserver } from './scroll.js';
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

  const pager = Object.create(Pager);
  pager.config = config;
  // TODO load offset/in_progress from query params

  const button = document.createElement('button');
  button.innerText = 'Click here';
  block.replaceChildren(button);

  const wrapper = document.createElement('div');
  block.append(wrapper);

  pager.up_observer = makePageLoadObserver(wrapper, pager, true); // TODO need to bind this to an element after first load -- maybe separate .observe() logic from the rest?
  pager.down_observer = makePageLoadObserver(wrapper, pager, false);
  pager.pos_observer = makePositionObserver(pager);

  button.onclick = function() {
    if (pager.loading) {
      return;
    }

    console.log('clicked');
    button.onclick = function(){};
    button.disabled = true;

    pager.loading = 'down'; // TODO not invasive
    const cards = await loadPage(wrapper, pager, pager.config.offset);
    if (cards) {
      pager.top = cards[0];
      pager.up_observer.observe(pager.top);
    }
  };
  button.className = 'hack'; // TODO FIXME temp

}
