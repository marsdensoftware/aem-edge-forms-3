/* eslint-disable */
// eslint-disable-next-line import/extensions
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import InfiniteScroll from 'react-infinite-scroll-component';

// eslint-disable-next-line no-unused-vars
function ReactTestHeader() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);

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

  const search = async () => {
    const newResults = await fetch(`https://dummyjson.com/users?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${pager.offset}&select=id,firstName,lastName,age,gender,birthDate,company`)
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Received: ${r.status}`);
        }
        return r.json();
      })
      .catch((e) => console.log(`Error: ${e.message}`));
    pager.total = newResults.total;
    setResults(newResults.users);
    setTotal(newResults.total);
  };

  return (
    <div>
      <h1>Hello from React!</h1>
      <label>Total</label>
      <p>{total}</p>
      <button type="button" onClick={search}>React Search</button>
      <InfiniteScroll
        dataLength={total}
        next={() => {console.log('more'); }}
        hasMore={pager.next() !== null}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {results &&
          <table>
            <tbody>
              {results.map((row) => <tr key={row.id}>{
                Object.entries(row).map(([name, value]) => <td key={name}>{typeof value !== 'object' ? value : JSON.stringify(value)}</td>)
              }</tr>)}
            </tbody>
          </table>}
      </InfiniteScroll>
    </div>
  );
}

export default async function decorate(block) {
  const div0 = document.createElement('div');
  div0.id = 'div0';

  const div1 = document.createElement('div');
  div1.id = 'test-root';

  div0.append(div1);
  block.append(div0);

  const domNode = document.getElementById('test-root');
  const root = createRoot(domNode);
  root.render(<ReactTestHeader />);
}
