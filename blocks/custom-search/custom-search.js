// TODO can we export and use other functions??

function toInt(o) {
  if (o === null || typeof o === 'undefined') {
    return null;
  }
  const n = Number(o);
  return Number.isSafeInteger(n) ? n : null;
}

function searchResultsAsRows(jsonResults) {
  return jsonResults.users.map((resultRow) => {
    const row = document.createElement('tr');

    Object.entries(resultRow)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      .forEach(([_, value]) => {
        const elem = document.createElement('td');
        elem.innerText = typeof value !== 'object' ? value : JSON.stringify(value);
        row.append(elem);
      });

    return row;
  });
}

function pageLink(offset, name, pager) {
  const link = document.createElement('a');
  link.text = name;
  if (offset !== null) {
    link.href = `?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${offset}`;
    link.onclick = async function (e) {
      e.preventDefault();
      pager.offset = offset;
      // eslint-disable-next-line no-use-before-define
      await renderSearch(pager);
    };
  } else {
    link.disabled = true;
  }
  return link;
}

function searchPaging(pager) {
  const nav = document.createElement('div');
  const prev = pageLink(pager.prev(), 'prev', pager);
  const next = pageLink(pager.next(), 'next', pager);

  nav.append(prev, next);
  return nav;
}

async function renderSearch(pager, observer) {
  pager.loading = true;

  const oldWrapper = document.getElementById('results-wrapper');
  if (oldWrapper === null || typeof oldWrapper === 'undefined') {
    console.log('Can\'t render to a non-existent node');
    pager.loading = false;
    return;
  }
  await fetch(`https://dummyjson.com/users?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${pager.offset}&select=id,firstName,lastName,age,gender,birthDate,company`)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Received: ${r.status}`);
      }
      return r.json();
    })
    .then((j) => {
      pager.total = j.total ?? pager.total;

      const rows = searchResultsAsRows(j);

      let results = document.getElementById('results');
      let firstResults = false;
      if (!pager.infinite || results === null) {
        results = document.createElement('table');
        results.id = 'results';
        firstResults = true;
        results.append(document.createElement('tbody'));
      }
      const resultsBody = results.children[0];
      // TODO use DocumentFragment
      resultsBody.append(...rows);

      const newUrl = new URL(window.location.href);
      let updateUrl = false;
      if (!pager.infinite) {
        newUrl.searchParams.set(pager.offsetArg, pager.offset);
        updateUrl = true;

        const wrapper = document.createElement('div');
        wrapper.id = 'results-wrapper';

        const pageNav = searchPaging(pager);
        wrapper.append(results, pageNav);
        oldWrapper.replaceWith(wrapper);
      } else {
        if (firstResults) {
          oldWrapper.append(results);
        }
        document.getElementById('search').onclick = null;
        observer.observe(document.querySelector('#results > tbody > tr:last-child'));
      }

      const oldPageSize = newUrl.searchParams.get(pager.pageSizeArg);
      /* eslint-disable-next-line eqeqeq */
      if (oldPageSize != pager.pageSize) {
        newUrl.searchParams.set(pager.pageSizeArg, pager.pageSize);
        updateUrl = true;
      }
      if (updateUrl) {
        window.history.pushState({}, '', newUrl.toString());
      }
    })
    .catch((e) => console.log(`Error: ${e.message}`));

  pager.loading = false;
}

function parseFlag(qs, name) {
  if (!qs.has(name)) {
    return null;
  }
  const value = qs.get(name);
  if (value === null || typeof value === 'undefined' || value === '') { // a flag with no value is true
    return true;
  }
  if (['true', '1', 'on', 'yes'].includes(value.toLowerCase())) {
    return true;
  }
  if (['false', '0', 'off', 'no'].includes(value.toLowerCase())) {
    return false;
  }
  return null;
}

export default async function decorate(block) {
  const Pager = {
    loading: false,

    infinite: false,
    infiniteArg: 'infinite',

    offset: 0,
    offsetArg: 'skip',

    pageSize: 10,
    pageSizeArg: 'limit',

    total: null,
    // TODO clamp?
    prev() {
      return this.offset > 0 ? this.offset - this.pageSize : null;
    },

    next() {
      return (this.total !== null && this.offset + this.pageSize < this.total)
        ? this.offset + this.pageSize : null;
    },
  };

  const pager = Object.create(Pager);
  const queryParams = new URLSearchParams(window.location.search);

  let offset = null;
  if (!pager.infinite) {
    offset = toInt(queryParams.get(pager.offsetArg));
    pager.offset = offset ?? pager.offset;
  }
  pager.infinite = parseFlag(queryParams, pager.infiniteArg) ?? pager.infinite;
  pager.pageSize = toInt(queryParams.get(pager.pageSizeArg)) ?? pager.pageSize;

  const div0 = document.createElement('div');

  const label = document.createElement('label');
  const modeName = document.createElement('span');
  modeName.innerText = 'Infinite scroll';
  label.append(modeName);
  const mode = document.createElement('input');
  mode.type = 'checkbox';
  mode.checked = pager.infinite;
  mode.onclick = function (_) {
    const modeQueryParams = new URLSearchParams(window.location.search);
    pager.infinite = this.checked;
    if (this.checked) {
      modeQueryParams.set(pager.infiniteArg, true);
      modeQueryParams.delete(pager.offsetArg);
    } else {
      modeQueryParams.delete(pager.infiniteArg);
    }

    window.location.search = modeQueryParams.toString(); // force a reload to clear state
  };
  label.append(mode);
  div0.append(label);

  const button0 = document.createElement('button');
  button0.id = 'search';
  button0.innerText = 'Search';

  const wrapper = document.createElement('div');
  wrapper.id = 'results-wrapper';
  div0.append(button0, wrapper);
  block.append(div0);

  const observer = new IntersectionObserver(async (entries, cbObserver) => {
    // N.B. this runs on the main thread
    if (!entries.some((e) => e.isIntersecting) || pager.loading) {
      return;
    }

    const next = pager.next();
    if (next !== null) {
      pager.offset = next;
      await renderSearch(pager, cbObserver);
    }
  }, {
    root: null,
    threshold: 0.5,
  });

  if (offset !== null) {
    await renderSearch(pager, observer);
  }

  button0.onclick = async () => {
    await renderSearch(pager, observer);
  };

  /*
   * N.B. the block will be reported as failing to load if a matching stylesheet
   * is not found even if the JS loads
   */
}
