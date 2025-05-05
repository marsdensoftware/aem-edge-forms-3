export default function decorate(panel) {
  panel.classList.add('panel-formwelcome');
  
  // select all items
  const items = panel.querySelectorAll('>fieldset>fieldset');
  items.forEach((e)=>{
      e.classList.add('panel-formwelcome-item');
  });
  return panel;
}
