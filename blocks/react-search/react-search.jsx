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

  div0.append(div1);
  block.append(div0);

  const domNode = div1;// document.getElementById('test-root');
  const root = createRoot(domNode);
  root.render(<ReactTestHeader />);
}
