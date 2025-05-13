/* eslint-disable */
// eslint-disable-next-line import/extensions
import React from 'react';
import { createRoot } from 'react-dom/client';

import InfiniteScroll from 'react-infinite-scroll-component';

// eslint-disable-next-line no-unused-vars
function ReactTestHeader() {
  return (
    <div>
      <h1>Hello from React!</h1>
      <button type="button">React Search</button>
    </div>
  );
}



function Scroll() {
  <InfiniteScroll
    dataLength={items.length}
    next={fetchData}
    hasMore={true}
    loader={<h4>Loading...</h4>}
    endMessage={
      <p style={{ textAlign: 'center' }}>
        <b>Yay! You have seen it all</b>
      </p>
    }
  >
    {items}
  </InfiniteScroll>
}

export default async function decorate(block) {
  const div0 = document.createElement('div');
  div0.id = 'div0';

  const div1 = document.createElement('div');
  div1.id = 'test-root';

  div0.append(div1);
  block.append(div0);

  console.log('adding html!');

  const domNode = document.getElementById('test-root');
  const root = createRoot(domNode);
  root.render(<ReactTestHeader />);
}
