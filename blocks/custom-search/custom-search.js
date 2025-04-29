export default function decorate(block) {
  const page_size = 10;
  const div0 = document.createElement('div');
  const button0 = document.createElement('button');
  button0.innerText = 'Custom Button';

  button0.onclick = async function() {
    await fetch(`https://dummyjson.com/users?limit=${page_size}`)
      .then(r => {
        if (!r.ok) {
          throw new Error(`Received: ${r.status}`);
        }
        return r.json();
      })
      .then(j => {
        let results = document.getElementById('results');
        if (results === null) {
          results = document.createElement('table');
          results.id = 'results';
          div0.append(results);
        }
        for (const result of j.users) {
          let row = document.createElement('tr');

          let id = document.createElement('td');
          id.innerText = result.id;
          row.append(id);
          let given = document.createElement('td');
          given.innerText = result.firstName;
          row.append(given);
          let surname = document.createElement('td');
          surname.innerText = result.lastName;
          row.append(surname);

          results.append(row);
        }
      })
      .catch(e => console.log(`Error: ${e.message}`));
  };

  div0.append(button0);
  block.append(div0);
}
