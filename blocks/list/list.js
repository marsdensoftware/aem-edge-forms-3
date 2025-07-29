    import { Pager, PagerConfig, makePageLoadObserver, makePositionObserver, loadPage } from './scroll.js';
import { validUrl } from './utils.js';

function dataPropsByStructure(block) {
  return block
    .querySelectorAll('div > div > p')
    .map((e) => {
      return ((e.querySelector('a') || e)?.innerText || '').trim();
    });
}

// TODO FIXME codegen parser from json fields definition
// TODO click to load more?
function configFromFields(block) {
  const props = dataPropsByStructure(block);
  const result = Object.create(PagerConfig);
  if (props.length != 5) {
    console.log('parsing block into config failed', block);
    return result;
  }

  // TODO validate url
  const src = props[0];

  // TODO check not empty
  const offset_arg = props[1];
  const page_size_arg = props[2];

  // TODO to integer
  const page_size = props[3];

  // TODO validate?
  const item_type = props[4];

  result.source = src;
  result.offset_arg = offset_arg;
  result.page_size_arg = page_size_arg;
  result.set_page_size(page_size);
  return result;
}

export default function decorate(block) {
  console.log('decorating: ' + block.innerHTML, block);

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

  button.onclick = async function() {
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
