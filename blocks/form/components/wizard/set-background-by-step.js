window.addEventListener('load', function () {
  const stepEl = document.querySelector('[data-index].current-wizard-step');
  const main = document.querySelector('main');
  if (!stepEl || !main) return;

  const index = parseInt(stepEl.dataset.index, 10);

  if (!isNaN(index)) {
    if (index === 0 || index === 1) {
      main.classList.add('wizard--bg-dark');
      main.classList.remove('wizard--bg-light');
    } else {
      main.classList.add('wizard--bg-light');
      main.classList.remove('wizard--bg-dark');
    }
  }
});
