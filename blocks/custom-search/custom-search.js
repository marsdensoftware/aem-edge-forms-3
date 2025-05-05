// TODO can we export and use other functions??

function toInt(o) {
  if (o === null || typeof o === 'undefined') {
    return null;
  }
  const n = Number(o);
  return Number.isSafeInteger(n) ? n : null;
}

function searchResults(jsonResults) {
  const htmlResults = document.createElement('table');
  htmlResults.id = 'results';
  jsonResults.users.forEach((resultRow) => {
    const row = document.createElement('tr');

    Object.entries(resultRow)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
      .forEach(([_, value]) => {
        const elem = document.createElement('td');
        elem.innerText = typeof value !== 'object' ? value : JSON.stringify(value);
        row.append(elem);
      });

    htmlResults.append(row);
  });

  return htmlResults;
}

function pageLink(offset, name, pager) {
  const link = document.createElement('a');
  link.text = name;
  if (offset !== null) {
    link.href = `?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${offset}`;
    link.onclick = async function (e) {
      e.preventDefault();
      pager.offset = offset;
      console.log('render with new offset', offset);
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

async function renderSearch(pager) {
  const oldWrapper = document.getElementById('results-wrapper');
  if (oldWrapper === null || typeof oldWrapper === 'undefined') {
    console.log('Can\'t render to a non-existent node');
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
      const wrapper = document.createElement('div');
      wrapper.id = 'results-wrapper';

      const results = searchResults(j);
      console.log('parsed new results');

      pager.total = j.total ?? pager.total;

      const pageNav = searchPaging(pager);
      wrapper.append(results, pageNav);

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set(pager.offsetArg, pager.offset);
      newUrl.searchParams.set(pager.pageSizeArg, pager.pageSize);

      oldWrapper.replaceWith(wrapper);
      window.history.pushState({}, '', newUrl.toString());
    })
    .catch((e) => console.log(`Error: ${e.message}`));
}

export default async function decorate(block) {
  const Pager = {
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
      return this.total !== null ? this.offset + this.pageSize : null;
    },
  };

  const pager = Object.create(Pager);

  const div0 = document.createElement('div');

  const button0 = document.createElement('button');
  button0.innerText = 'Custom Button';

  const wrapper = document.createElement('div');
  wrapper.id = 'results-wrapper';
  div0.append(button0, wrapper);
  block.append(div0);

  const queryParams = new URLSearchParams(window.location.search);
  const offset = toInt(queryParams.get(pager.offsetArg));
  pager.offset = offset ?? pager.offset;
  pager.pageSize = toInt(queryParams.get(pager.pageSizeArg)) ?? pager.pageSize;

  if (offset !== null) {
    await renderSearch(pager);
  }

  button0.onclick = async () => {
    await renderSearch(pager);
  };
  /*
   * N.B. the block will be reported as failing to load if a matching stylesheet
   * is not found even if the JS loads
   */
}
