// TODO can we import?
// TODO can we export and use other functions??


export default function decorate(block) {
  const pageSize = 10;

  const Pager = {
    offset: 0,
    offsetArg: 'skip',

    pageSize: 10,
    pageSizeArg: 'limit',

    total: 0,
    // TODO clamp?
    prev: () => this.offset > 0 ? this.offset - this.pageSize : null,

    next: () => this.total !== null ? this.offset + this.pageSize : null,
  };

  const pager = Object.create(Pager);

  const div0 = document.createElement('div');
  const button0 = document.createElement('button');
  button0.innerText = 'Custom Button';

  button0.onclick = async function () {
    await fetch(`https://dummyjson.com/users?limit=${pageSize}&select=id,firstName,lastName,age,gender,birthDate,company`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Received: ${r.status}`);
        }
        return r.json();
      })
      .then((j) => {
        let results = document.getElementById('results');
        if (results === null) {
          results = document.createElement('table');
          results.id = 'results';
          div0.append(results);
        }
        j.users.forEach((resultRow) => {
          const row = document.createElement('tr');

          for (let [_, value] of Object.entries(resultRow).sort((a, b) => a < b ? -1 : a > b ? 1 : 0)) {
            const elem = document.createElement('td');
            elem.innerText = typeof value !== 'object' ? value : JSON.stringify(value);
            row.append(elem);
          }

          results.append(row);
        });

        // if j.skip+j.limit >= j.total, no more pages
        // if j.skip == 0, no previous pages
        // next page = pagecount++ * limit, or skip+limit
        // prev page = skip-pageSize (not limit, as on the last page it may be truncated)
      })
      .catch((e) => console.log(`Error: ${e.message}`));
  };

  div0.append(button0);
  block.append(div0);
}
