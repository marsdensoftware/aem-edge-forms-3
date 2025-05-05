// TODO can we export and use other functions??

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

async function renderSearch(pager, oldWrapper) {
  if (oldWrapper === null) {
    console.log('Can\'t render to a null node');
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

      // window.location.search = queryParams.toString(); // does this cause a reload?
      // TODO use history.pushState or .replaceState instead

      pager.total = j.total ?? pager.total;

      // TODO allow loading the results without reloading the whole page
      const pageNav = searchPaging(pager);
      wrapper.append(results, pageNav);

      oldWrapper.replaceWith(wrapper);
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
  pager.offset = queryParams.get(pager.offsetArg) ?? pager.offset;
  pager.pageSize = queryParams.get(pager.pageSizeArg) ?? pager.pageSize;

  console.log('decorate called', pager, wrapper);
  await renderSearch(pager, wrapper); // TODO does this invalidate the div0 reference?
  console.log('got', wrapper);

  button0.onclick = async () => {
    await renderSearch(pager, wrapper);
  };
  /*
   * N.B. the block will be reported as failing to load if a matching stylesheet
   * is not found even if the JS loads
   */
}
