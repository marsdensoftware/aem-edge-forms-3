/* eslint-disable */
// eslint-disable-next-line import/extensions
import { createRoot } from 'react-dom/client';

// eslint-disable-next-line no-unused-vars
function ReactTestHeader() {
  return <h1>Hello from React!</h1>;
}

export default async function decorate(block) {
  const div0 = document.createElement('div');
  div0.id = 'div0';

  const div1 = document.createElement('div');
  div1.id = 'test-root';
  const p = document.createElement('p');
  p.innerText = 'This is a paragraph';
  p.id = 'test-test';

  div0.append(div1, p);
  block.append(div0);

  console.log('adding html!');


  const domNode = div1;// document.getElementById('test-root');
  const root = createRoot(domNode);
  root.render(<ReactTestHeader />);
}
