export default function decorate(block) {
  console.log('decorating', block);

  console.log(`got source`,  document.querySelector('[data-aue-prop="source"]'));
  console.log(`got offset-arg`,  document.querySelector('[data-aue-prop="offset-arg"]'));
  console.log(`got page-size-arg`,  document.querySelector('[data-aue-prop="page-size-arg"]'));
  console.log(`got page-size`,  document.querySelector('[data-aue-prop="page-size"]'));
  console.log(`got select-output`,  document.querySelector('[data-aue-prop="select-output"]'));
  /*select by data-aue-prop= like document.querySelector('[data-aue-prop="14"]');*/
}
