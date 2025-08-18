/* eslint-disable no-console */
/* eslint-disable no-cond-assign */
/* eslint-disable import/prefer-default-export */

// group editable texts in single wrappers if applicable.
// this script should execute after script.js but before the the universal editor cors script
// and any block being loaded

function waitForTinyMCE(callback) {
  const interval = setInterval(() => {
    if (window.tinymce) {
      clearInterval(interval);
      callback();
    }
  }, 50);
}

// Usage:
waitForTinyMCE(() => {
  console.log('TinyMCE is available!');

  window.tinymce.on('AddEditor', ({editor}) => {
    editor.on('init', () => {
      console.log(`Editor ${editor.id} initialized from global listener`);
    });
  });
});
