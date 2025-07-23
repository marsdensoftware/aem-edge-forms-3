import { toInt, parseFlag } from './utils.js';

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

  source: null,

  set_offset(n) {
    this.offset = n > 0 ? n : 0;
  },

  set_page_size(n) {
    this.page_size = n > 0 && n < 100 ? n : default_page_size;
  },
};

export const Pager = {
  in_progress_arg: 'in_progress', // TODO detect real search parameters
  in_progress: false,

  loading: false,

  config: Object.create(PagerConfig),

  top: null,
  bottom: null,

  // TODO clamp here instead or as well as on apply?
  prev() {
    return this.config.top_offset > 0 ? this.config.top_offset - this.config.page_size : null;
  },

  next() {
    return (this.config.total !== null && this.config.offset + this.config.page_size < this.config.total)
      ? this.config.offset + this.config.page_size : null;
  },

  // TODO could use a single observer with lots of switching logic instead...
  up_observer: null,
  down_observer: null,
  pos_observer: null,
};

export function pagerFromParams(params) {
  const pager = Object.create(Pager);
  const in_progress = parseFlag(params, pager.in_progress_arg);
  if (in_progress) {
    pager.config.set_offset(toInt(params.get(pager.config.offset_arg)) ?? pager.config.offset);
    pager.config.top_offset = pager.config.offset;
  }
  pager.config.infinite = parseFlag(params, pager.config.infinite_arg) ?? pager.config.infinite;
  pager.config.set_page_size(toInt(params.get(pager.config.page_size_arg)) ?? pager.config.page_size);
  return pager;
};

function makeCards(results) {
  return results.map((result) => {
    const card = document.createElement('div');
    card.className = 'card';

    Object.entries(result)
      .forEach(([_, value]) => {
        const field = document.createElement('span');
        field.innerText = typeof value !== 'object' ? value : JSON.stringify(value);
        card.append(field);
      });

    return card;
  });
}

export async function loadPage(container, pager, new_offset, up) {

  const loading = document.createElement('div');
  loading.className = 'loading';

  let old_offset = null;
  let temp_page_size = pager.config.page_size;
  if (new_offset < 0) {
    new_offset = 0; // TODO can we ever have clamping issues at the bottom?
  }
  let obs = pager.down_observer;
  if (up) {
    container.prepend(loading);
    old_offset = pager.config.top_offset;
    pager.config.top_offset = new_offset;
    const diff = old_offset - new_offset;
    if (temp_page_size > diff) {
      temp_page_size = diff;
    }
    obs = pager.up_observer;
  } else {
    container.append(loading);
    old_offset = pager.config.offset;
    pager.config.offset = new_offset;
  }

  await new Promise(r => setTimeout(r, 1000));
  // TODO better error handling
  console.log('should request page', pager, pager.source);
  const target_url = new URL(pager.source);
  target_url.searchParams.set(pager.config.page_size_arg, temp_page_size);
  target_url.searchParams.set(pager.config.offset_arg, new_offset);

  const data = await fetch(target_url)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Received: ${r.status}`);
      }
      return r.json();
    })

  pager.config.total = data.total;
  const cards = makeCards(data.users);

  // TODO may need to avoid always loading the top when resuming? TODO FIXME try scrollIntoView on first element when first loading? TODO FIXME maybe because the loading div takes the top slot?
  if (up) {
    if (pager.top !== null) {
      obs.unobserve(pager.top);
    }
  } else if (pager.bottom !== null) {
    obs.unobserve(pager.bottom);
  }

  const prev_bb = getBB(container);//container.getBoundingClientRect();
  const prev_y = window.scrollY;

  if (cards) {
    loading.replaceWith(...cards);

    for (const card of cards) {
      pager.pos_observer.observe(card);
    }

    // TODO FIXME probably need to detect horizontal layout and skip the scroll call
    if (up) {
      const bb = getBB(container);//container.getBoundingClientRect();
      let new_y = prev_y + bb.height - prev_bb.height;// + bb.y - prev_bb.y;
      if (bb.y > 0 && prev_bb.y > 0) { // hacky, works the first time and some(?) other times, not clear why
        new_y += bb.y - prev_bb.y;
      }
      //
      console.log('added cards, should scroll...', prev_bb, prev_y, bb, new_y);
      // TODO FIXME works on page 2->1 but not 1->0, 3->2, but not 2->1, etc (i.e first upward load only)
      window.scrollTo(window.scrollX, new_y);
      pager.top = cards[0];
      console.log('try to observe (up)', pager.top);
      obs.observe(pager.top);
    } else {
      pager.bottom = cards[cards.length - 1];
      console.log('try to observe (down)', pager.bottom);
      obs.observe(pager.bottom);
    }
  }

  if (pager.queue) {
    const new_loading = pager.queue;
    let new_up = false;
    if (pager.queue === 'up') {
      new_up = true;
      new_offset = pager.prev();
    } else {
      new_offset = pager.next();
    }

    pager.queue = false;
    if (new_offset !== null) {
      pager.loading = new_loading;
      console.log('awaiting queue');
      await loadPage(container, pager, new_offset, new_up); // TODO FIXME can we redesign clearing loading status so that we don't have to await?
    }
  }

  pager.loading = false; // TODO not invasive
  return cards;
};

function getBB(elem) {
  let bb = elem.getBoundingClientRect();
  return bb;

  return {
    top: bb.top + window.pageYOffset,
    right: bb.right + window.pageXOffset,
    bottom: bb.bottom + window.pageYOffset,
    left: bb.left + window.pageXOffset
  };
}

export function makePageLoadObserver(container, pager, up) {
  const get_next = up ? () => pager.prev() : () => pager.next();
  const direction = up ? 'up' : 'down';

  return new IntersectionObserver(async (entries, _cb_observer) => {
    console.log(`obs called (${direction})`, entries)
    // N.B. this runs on the main thread
    if (!entries.some((e) => e.isIntersecting)) {
      //console.log('early bail, no intersections')
      // TODO if observing multiple elements may need to determine which one is intersecting
      // always gets called once on .observe() with .isInterescting=false
      return;
    }
    if (pager.loading) {
      if (pager.loading != direction && !pager.queue) {
        pager.queue = direction;
      }
      return;
    }

    const next = get_next(); // TODO has_next?
    if (next !== null) {
      pager.loading = direction; // function call lets async run, // TODO not invasive
      loadPage(container, pager, next, up); // use .then() and clear loading afterwards?
    }
  }, {
    root: null,
    threshold: 0.5, // event triggered for changes at threshold intervals
  });
};

function completelyInView(e) {
  const bb = e.getBoundingClientRect();
  // Do we need to account for window.pageYOffset?
  // console.log(`checking`, bb,` for interesction: ${window.innerHeight},${window.innerWidth}`);
  return bb.top >= 0 && bb.left >= 0 && bb.bottom <= window.innerHeight && bb.right <= window.innerWidth;
}

export function makePositionObserver(pager) {
  return new IntersectionObserver(async (entries, _cb_observer) => {
    // N.B. this runs on the main thread
    if (pager.loading) {
      return;
    }
    const visible = entries.filter((e) => e.isIntersecting && e.intersectionRatio >= 0.5);
    if (visible.length === 0) {
      return;
    }
    // Choose farthest top left element
    visible.sort((a, b) => {
      if (a.boundingClientRect.top  === b.boundingClientRect.top ) {
        return a.boundingClientRect.left > b.boundingClientRect.left ? 1 : -1;
      }
      return a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1;
    });

    const list = Array.from(visible[0].target.parentElement.children);
    const pos = list.indexOf(visible[0].target);
    if (pos < 0) {
      return; // should never happen
    }
    // TODO FIXME this is sometimes one too low when scrolling down - view still moving after observer event has fired?
    //console.log(`scanning from ${pos} (${pos+pager.config.top_offset}) to 0`);
    let best_pos = pos;
    for (let index = pos - 1; index >= 0; --index) {
      //console.log(`check ${index} (${index+pager.config.top_offset})`);
      if (!completelyInView(list[index])) {
        best_pos = index + 1;
        break;
      }
    }
    //console.log(`selected ${best_pos}`);

    const index = best_pos + pager.config.top_offset;
    const new_url = new URL(window.location.href);
    new_url.searchParams.set(pager.in_progress_arg, '1');
    new_url.searchParams.set(pager.config.offset_arg, index);
    if (pager.config.page_size !== Object.getPrototypeOf(pager.config).page_size) {
      new_url.searchParams.set(pager.config.page_size_arg, pager.config.page_size);
    }
    if (pager.config.infinite !== Object.getPrototypeOf(pager.config).infinite) {
      new_url.searchParams.set(pager.config.infinite_arg, pager.config.infinite);
    }
    window.history.replaceState({}, '', new_url.toString());
  }, {
    root: null,
    threshold: 0.75,
  });
};

/*async function start() {
  const queryParams = new URLSearchParams(window.location.search);
  const pager = pagerFromParams(queryParams);

  const container = document.getElementById('container')
  pager.up_observer = makePageLoadObserver(container, pager, true); // TODO need to bind this to an element after first load -- maybe separate .observe() logic from the rest?
  pager.down_observer = makePageLoadObserver(container, pager, false);
  pager.pos_observer = makePositionObserver(pager);

  pager.loading = 'down'; // TODO not invasive
  const cards = await loadPage(container, pager, pager.config.offset);
  if (cards) {
    pager.top = cards[0];
    pager.up_observer.observe(pager.top);
  }
}*/
