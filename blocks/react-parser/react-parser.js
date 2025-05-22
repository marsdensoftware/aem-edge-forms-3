/* eslint-disable */
import React, { useState, createElement } from 'react';
import ReactDOMClient, { createRoot } from 'react-dom/client';

const REACT_KEY = 'gh-react'

function reactifyChildren(elem, fn) {
  return Array.from(elem.childNodes)
    .filter(fn ? fn : () => true)
    .reduce((acc, child) => {
      switch (child.nodeType) {
        case Node.ELEMENT_NODE:
          acc.push(reactify(child, fn));
          break;
        case Node.TEXT_NODE:
          acc.push(child.textContent); // N.B. newlines
          break;
        case Node.COMMENT_NODE:
          // TODO FIXME
          // there is not a good way to support HTML comments in react
          // https://stackoverflow.com/questions/40015336/how-to-render-a-html-comment-in-react
          // requires special hackery and still may not be the same
          acc.push(`<!--\n${child.textContent}\n-->`);
          break;
        default:
          console.log('Uh oh, unexpected node type', child);
          break; // TODO throw an error here?
      }
      return acc;
    }, []);
}

function reactify(elem, fn) {
  const children = reactifyChildren(elem, fn)
  // TODO probably need to mimick id, className/classList, attributes, and handlers (how to get handlers?)

  console.log('reactifying', elem, 'have desc', children);
  return createElement(elem.tagName, {className: elem.className}, ...children)
}


function setup(block) {
  console.log('running setup!')
  // TODO check this is async safe
  if (sessionStorage.getItem(REACT_KEY)) {
    console.log('react key already set, returning');
    return
  }
  sessionStorage.setItem(REACT_KEY, true);

  const container = block.closest('.section');
  //section
  // > div.name-wrapper (inc default-content-wrapper?)
  // > > div.name.block
  console.log('have container', container);
  //
  //const app = reactify(container, (elem) => elem.className != block.className); // TODO not sure if className is ordered
  const app = reactifyChildren(container, (elem) => elem.className != block.className); // TODO not sure if className is ordered

  // try rendering it along side to compare?
  const div = document.createElement('div');
  div.className = container.className;
  div.id = 'react-dynamic-root';
  container.insertAdjacentElement('afterend', div); // for testing
  const root = createRoot(div);
  root.render(app);
}

export default async function decorate(block) {
  // with child blocks; parse children (need to run after all decorate()s?), replace block with react root (create or hydrate)
  // with sibling blocks, find parent, parse blocks except this one, do the same, also need to ensure only one of these runs

  window.addEventListener('onbeforeunload', () => {
    //sessionStorage.removeItem(REACT_KEY);
    sessionStorage.clear();
  }); //turns out this is unreliable and especially so when added this way???
  // onbeforeunload is also not supported on Safari or WebView on iOS

  window.onbeforeunload = () => { // this unfortunately nukes other handlers
    //sessionStorage.removeItem(REACT_KEY);
    sessionStorage.clear();
  };

  const poll = setInterval(() => {
    console.log('checking!');
    if (!sessionStorage.getItem('sections-loaded'))
      return;
    clearInterval(poll);
    setup(block);
  }, 10);
  const timeout = setTimeout(() => {
    console.log('timeout');
    clearInterval(poll);
  }, 3000);
}
