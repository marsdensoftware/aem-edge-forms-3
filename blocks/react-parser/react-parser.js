/* eslint-disable */
import React, { useState, createElement } from 'react';
import ReactDOMClient, { createRoot } from 'react-dom/client';

const REACT_KEY = 'gh-react'

function reactify(elem, fn) {
  const children = Array.from(elem.children)
    .filter(fn ? fn : () => true)
    .map((child) => reactify(child, fn));
  // TODO probably need to mimick id, className/classList, attributes, and handlers (how to get handlers?)
  // what about AEM comments?

  // localName or tagName?

  console.log('reactifying', elem, 'have desc', children);
  return createElement(elem.tagName, {className: elem.className}, ...children)
}

export default async function decorate(block) {
  // with child blocks; parse children (need to run after all decorate()s?), replace block with react root (create or hydrate)
  // with sibling blocks, find parent, parse blocks except this one, do the same, also need to ensure only one of these runs

  window.onbeforeunload = function() {
    sessionStorage.removeItem(REACT_KEY);
  }
  // TODO check this is async safe
  if (sessionStorage.getItem(REACT_KEY)) {
    return
  }
  sessionStorage.setItem(REACT_KEY, true);

  const container = block.closest('.section');
  //section
  // > div.name-wrapper (inc default-content-wrapper?)
  // > > div.name.block
  console.log('have container', container);
  // TODO need this to run AFTER all siblings have decorate()ed
  const app = reactify(container);

  // try rendering it along side to compare?
  const div = document.createElement('div');
  div.id = 'react-dynamic-root';
  container.append(div)
  const root = createRoot(div);
  root.render(app);
}
