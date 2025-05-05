// TODO can we import?
// TODO can we export and use other functions??

export default function decorate(block) {
  const Pager = {
    offset: 0,
    offsetArg: 'skip',

    pageSize: 10,
    pageSizeArg: 'limit',

    total: null,
    // TODO clamp?
    prev: () => (this.offset > 0 ? this.offset - this.pageSize : null),

    next: () => (this.total !== null ? this.offset + this.pageSize : null),
  };

  // eslint-disable-next-line no-unused-vars -- development WIP
  const pager = Object.create(Pager);

  const div0 = document.createElement('div');
  const button0 = document.createElement('button');
  button0.innerText = 'Custom Button';

  button0.onclick = async function () {
    const queryParams = new URLSearchParams(window.location.search);
    pager.offset = queryParams.get(pager.offsetArg) ?? pager.offset;
    pager.pageSize = queryParams.get(pager.pageSizeArg) ?? pager.pageSize;

    await fetch(`https://dummyjson.com/users?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${pager.offset}&select=id,firstName,lastName,age,gender,birthDate,company`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Received: ${r.status}`);
        }
        return r.json();
      })
      .then((j) => {
        pager.total = j.total ?? pager.total;
        let results = document.getElementById('results');
        if (results === null) {
          results = document.createElement('table');
          results.id = 'results';
          div0.append(results);
        }
        // TODO need to nuke previous contents of results if using AJAX without infinite paging
        j.users.forEach((resultRow) => {
          const row = document.createElement('tr');

          Object.entries(resultRow)
            .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
            .forEach(([_, value]) => {
              const elem = document.createElement('td');
              elem.innerText = typeof value !== 'object' ? value : JSON.stringify(value);
              row.append(elem);
            });

          results.append(row);
          // window.location.search = queryParams.toString(); // does this cause a reload?

          // TODO allow loading the results without reloading the whole page
          const nav = document.createElement('p');
          const prev = document.createElement('a');
          const prevOffset = pager.prev();
          if (prevOffset !== null) {
            prev.href = `https://dummyjson.com/users?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${prevOffset}&select=id,firstName,lastName,age,gender,birthDate,company`;
          } else {
            prev.disabled = true;
          }

          const next = document.createElement('a');
          const nextOffset = pager.prev();
          if (nextOffset !== null) {
            next.href = `https://dummyjson.com/users?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${nextOffset}&select=id,firstName,lastName,age,gender,birthDate,company`;
          } else {
            next.disabled = true;
          }

          nav.append(prev);
          nav.append(next);
          results.append(nav);
        });
      })
      .catch((e) => console.log(`Error: ${e.message}`));
  };

  div0.append(button0);
  block.append(div0);
}
