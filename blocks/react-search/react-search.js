/* eslint-disable */
// eslint-disable-next-line import/extensions
//import * as React from 'react';
//import * as ReactDOM from 'react-dom/client';
import React, { useState, useEffect } from 'react';
import ReactDOMClient, { createRoot } from 'react-dom/client';
import InfiniteScroll from 'react-infinite-scroll-component';
async function searchResults(pager) {
  return await fetch(`https://dummyjson.com/users?${pager.pageSizeArg}=${pager.pageSize}&${pager.offsetArg}=${pager.offset}&select=id,firstName,lastName,age,gender,birthDate,company`).then(r => {
    if (!r.ok) {
      throw new Error(`Received: ${r.status}`);
    }
    return r.json();
  }).catch(e => console.log(`Error: ${e.message}`));
}

// eslint-disable-next-line no-unused-vars
function ReactTestHeader() {
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(null);
  const [offset, setOffset] = useState(null);

  //  prev() {
  //  return this.offset > 0 ? this.offset - this.pageSize : null;
  //},

  // TODO make pager extend react.component or make separate usestate vars for parts

  const nextPage = function (total, offset, pageSize) {
    return total !== null && offset + pageSize < total ? offset + pageSize : null;
  };
  const pager = {
    loading: false,
    infinite: false,
    infiniteArg: 'infinite',
    offset: 0,
    offsetArg: 'skip',
    pageSize: 10,
    pageSizeArg: 'limit',
    total: null
    // TODO clamp?
  };
  const search = async pager => {
    const newResults = await searchResults({
      ...pager,
      offset: offset
    });
    setResults([...results.concat(newResults.users)]);
    console.log('new results', newResults, newResults.users);
    setTotal(newResults.total);
  };
  useEffect(() => {
    if (offset === null) {
      return;
    }
    async function wrapper() {
      await search({
        ...pager,
        offset: offset
      });
    }
    ;
    wrapper();
  }, [offset]);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Hello from React!"), /*#__PURE__*/React.createElement("label", null, "Total available: ", total || 'unknown'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setOffset(0)
  }, "React Search"), results && /*#__PURE__*/React.createElement(InfiniteScroll, {
    dataLength: offset,
    next: () => {
      const next = nextPage(total, offset, pager.pageSize);
      console.log('more?:', next);
      if (next !== null) {
        setOffset(next);
      }
    },
    hasMore: true
    //loader={<h4>Loading...</h4>}
    ,
    endMessage: /*#__PURE__*/React.createElement("p", {
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("b", null, "Yay! You have seen it all"))
  }, /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("tbody", null, results.map(row => {
    return /*#__PURE__*/React.createElement("tr", {
      key: row.id
    }, Object.entries(row).map(([name, value]) => /*#__PURE__*/React.createElement("td", {
      key: name
    }, typeof value !== 'object' ? value : JSON.stringify(value))));
  })))));
}
export default async function decorate(block) {
  const div0 = document.createElement('div');
  div0.id = 'div0';
  const div1 = document.createElement('div');
  div1.id = 'test-root';
  div0.append(div1);
  block.append(div0);
  const prev = typeof __COMMIT_HASH__ === 'undefined' ? 'unknown' : __COMMIT_HASH__;
  console.log('React running on the next commit after ' + prev);
  const domNode = document.getElementById('test-root');
  const root = createRoot(domNode);
  root.render(/*#__PURE__*/React.createElement(ReactTestHeader, null));
}