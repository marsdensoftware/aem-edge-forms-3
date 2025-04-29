function decorate(block) {
  const div0 = document.createElement('div');
  const button0 = document.createElement('button');
  button0.innerText = 'Custom Button';
  div0.append(button0);
  block.append(div0);
}

export default decorate;
