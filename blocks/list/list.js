    import { Pager, PagerConfig, makePageLoadObserver, makePositionObserver, loadPage } from './scroll.js';
import { toInt, validUrl } from './utils.js';

function dataPropsByStructure(block) {
  return [...block
    .querySelectorAll('div > div > p')]
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

  const page_size = toInt(props[3]);

  // TODO validate?
  const item_type = props[4];

  result.source = src;
  result.offset_arg = offset_arg;
  result.page_size_arg = page_size_arg;
  result.set_page_size(page_size);
  result.item_type = item_type; // TODO FIXME this is a hack
  return result;
}

async function loadItem(blockName) {
  try {
    const mod = await import(
      `${window.hlx.codeBasePath}/blocks/${blockName}/${blockName}.js`
    );
    console.log('loaded', mod);
    /*if (mod.default) {
      await mod.default(block);
      }*/
  } catch (error) {
    console.log(`failed to load module for ${blockName}`, error);
  }
}

export default async function decorate(block) {
  console.log('decorating: ' + block.innerHTML, block);


  // TODO FIXME need to parse html in order to work in publisher
  const config = configFromFields(block);
  console.log('extracted config', config);
  /*if (config.item_type) {
    const item_mod = await loadItem(config.item_type);
  }*/


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
