import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from './aem.js';

/**
 * Moves all the attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/* ============================================================
   PERSISTENT SPELLCHECK OVERLAY (stays after blur)
   ------------------------------------------------------------
   - Requires CSS:
      .spellwrap{position:relative;display:inline-block;width:100%}
      .spell-ghost{position:absolute;inset:0;pointer-events:none;white-space:pre-wrap;overflow:hidden;color:transparent}
      .spell-err{ text-decoration: underline wavy; text-decoration-color: red; }
   - Extend dictionary via: window.SPELLCHECK_EXTRA_WORDS = ['Aotearoa','Auckland']
============================================================ */

const DEMO_DICT = new Set([
  'a','about','and','are','as','at','be','can','do','for','from','have','i',
  'in','is','it','my','of','on','or','our','please','that','the','this',
  'to','we','with','you','your','search','work','experience','form','name',
]);

function isWordLikelyWrong(word) {
  if (!word) return false;
  if (word.length < 3) return false;
  if (/\d/.test(word)) return false;
  const base = word.toLowerCase();
  if (DEMO_DICT.has(base)) return false;
  if (Array.isArray(window.SPELLCHECK_EXTRA_WORDS)
    && window.SPELLCHECK_EXTRA_WORDS.map(w => String(w).toLowerCase()).includes(base)) {
    return false;
  }
  return true;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlightText(text) {
  // Split into word tokens while preserving spaces/punctuation
  const parts = text.split(/(\b[A-Za-z']+\b)/g);
  return parts.map(tok => {
    if (/^\b[A-Za-z']+\b$/.test(tok) && isWordLikelyWrong(tok)) {
      return `<span class="spell-err">${escapeHtml(tok)}</span>`;
    }
    return escapeHtml(tok);
  }).join('');
}

function copyTextStyles(fromEl, toEl) {
  const cs = getComputedStyle(fromEl);
  const props = [
    'font','fontSize','fontFamily','fontWeight','lineHeight','letterSpacing',
    'textTransform','textAlign',
    'paddingTop','paddingRight','paddingBottom','paddingLeft',
    'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
    'boxSizing',
  ];
  props.forEach(p => { toEl.style[p] = cs[p]; });
  toEl.style.borderRadius = cs.borderRadius;
}

function attachPersistentSpellcheck(field) {
  if (!field || field.__spellAttached) return;
  field.__spellAttached = true;

  // Wrap field so overlay can sit on top
  const wrap = document.createElement('div');
  wrap.className = 'spellwrap';
  field.parentNode.insertBefore(wrap, field);
  wrap.appendChild(field);

  const ghost = document.createElement('div');
  ghost.className = 'spell-ghost';
  wrap.appendChild(ghost);

  const syncStyles = () => {
    copyTextStyles(field, ghost);
    ghost.style.width = `${field.offsetWidth}px`;
    ghost.style.height = `${field.offsetHeight}px`;
  };

  const render = () => {
    const val = field.matches('[contenteditable="true"]') ? (field.innerText || '') : (field.value || '');
    ghost.innerHTML = highlightText(val);
  };

  const update = () => { syncStyles(); render(); };

  // Initial paint
  update();

  // Keep in sync with user actions and layout changes
  ['input','change','blur','focus','keyup'].forEach(e => field.addEventListener(e, update));
  window.addEventListener('resize', update);

  // For contenteditable where mutations may not fire standard input events
  if (field.isContentEditable || field.matches('[contenteditable="true"]')) {
    const mo = new MutationObserver(update);
    mo.observe(field, { characterData: true, subtree: true, childList: true });
  }
}

function enablePersistentSpellcheck(root = document) {
  const sel = 'input[type="text"], input[type="search"], textarea, [contenteditable="true"]';
  root.querySelectorAll(sel).forEach(attachPersistentSpellcheck);

  // Also catch fields added later (Universal Author can inject content dynamically)
  const mo = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return;
        if (n.matches?.(sel)) attachPersistentSpellcheck(n);
        n.querySelectorAll?.(sel).forEach(attachPersistentSpellcheck);
      });
    });
  });
  mo.observe(root.body || root, { childList: true, subtree: true });
}

/* ============================================================
   PAGE LIFECYCLE
============================================================ */

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    // if desktop (proxy for fast connection) or fonts already loaded, load fonts.css
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  // Turn on our persistent spellcheck overlay for all existing + future fields
  enablePersistentSpellcheck(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
