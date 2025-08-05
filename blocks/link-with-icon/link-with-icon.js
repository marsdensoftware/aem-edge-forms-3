export default function decorate(block) {
  const children = [...block.children];

  const openInNewTab = children[2]?.textContent.trim();
  const id = children[3]?.textContent.trim();

  if (id == 'shielded-logo') {
    const a = block.querySelector('a');
    if (a) {
      a.innerHTML = '';
      a.id = 'shielded-logo';
      a.href = '#';

      // Move image to a
      const imgDiv = children[0];
      const img = block.querySelector('picture');
      if (img) {
        a.append(img);
        imgDiv.style.display = 'none';

        const script = document.createElement('script');
        const src = 'https://staticcdn.co.nz/embed/embed.js';
        script.src = src;

        script.onload = () => {
          console.log(`Script loaded: ${src}`);
          (function() {
            window.onload = function() {
              var frameName = new ds07o6pcmkorn({ openElementId: "#shielded-logo", modalID: "modal", });
              frameName.init();
            }
          })();
        };
        a.parentElement.append(script);
      }
    }
  }
  else {
    block.id = id;
  }

  children[0]?.classList.add('icon')
  const icon = children[0]?.querySelector('picture')

  if (!icon) {
    block.classList.add('no-icon');
  }

  if (openInNewTab) {
    children[1]?.querySelector('a')?.setAttribute('target', '_blank')
  }
}
