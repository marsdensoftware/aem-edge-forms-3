/* eslint-disable */
// eslint-disable-next-line import/extensions
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import InfiniteScroll from 'react-infinite-scroll-component';

async function searchResults(pager) {
  return await fetch(`https://dummyjson.com/users?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${pager.offset}&select=id,firstName,lastName,age,gender,birthDate,company`)
    .then((r) => {
      if (!r.ok) {
        throw new Error(`Received: ${r.status}`);
      }
      return r.json();
    })
    .catch((e) => console.log(`Error: ${e.message}`));
}

// eslint-disable-next-line no-unused-vars
function ReactTestHeader() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);
  let offset = 0;

  //  prev() {
  //  return this.offset > 0 ? this.offset - this.pageSize : null;
  //},

  // TODO make pager extend react.component or make separate usestate vars for parts

  const nextPage = function(total, offset, pageSize) {
    return (total !== null && offset + pageSize < total)
      ? offset + pageSize : null;
  };

  const pager = {
    loading: false,

    infinite: false,
    infiniteArg: 'infinite',

    offset: 0,
    offsetArg: 'skip',

    pageSize: 10,
    pageSizeArg: 'limit',

    total: null,
    // TODO clamp?
  };

  const search = async () => {
    const newResults = await searchResults({...pager, total: total, offset: offset});
    //setPager({...pager, total: newResults.total}); //  TODO this will retrigger useffect?
    setResults([...results.concat(newResults.users)]);
    console.log('new res', newResults, newResults.users);
    console.log('users', [...results.concat(newResults.users)]);
    console.log('user ids', [...results.concat(newResults.users)].map((row) => row))
    setTotal(newResults.total);
  };

  /*useEffect(async () => {
    console.log('useEffect fired', pager);
    await search();
  }, [pager]);*/

  return (
    <div>
      <h1>Hello from React!</h1>
      <label>Total</label>
      <p>{total}</p>
      <button type="button" onClick={search}>React Search</button>
      {results &&
        <InfiniteScroll
        dataLength={total}
        next={async () => {
          const next = nextPage(total, offset, pager.pageSize);
          console.log('more?:', next);
          if (next !== null) {
            offset = next;
            await searchResults();
          }
        }}
        hasMore={true}
        //loader={<h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <table>
          <tbody>
            {
              results.map((row) => {
                console.log('row', results, row);
                let rid = row.id;
                return (<tr key={rid}>JSON.stringify(row)</tr>);
              })
            }
          </tbody>
        </table>
      </InfiniteScroll>}
    </div>
  );
}//Object.entries(row).map(([name, value]) => <td key={name}>{typeof value !== 'object' ? value : JSON.stringify(value)}</td>)

export default async function decorate(block) {
  const div0 = document.createElement('div');
  div0.id = 'div0';

  const div1 = document.createElement('div');
  div1.id = 'test-root';

  div0.append(div1);
  block.append(div0);

  console.log('React running on the next commit after ' + __COMMIT_HASH__);
  const domNode = document.getElementById('test-root');
  const root = createRoot(domNode);
  root.render(<ReactTestHeader />);
}
