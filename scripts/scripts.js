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
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/* ============================================================
   PERSISTENT SPELLCHECK OVERLAY — API-backed (LanguageTool)
   Shows native underlines while typing (focus), and our
   persistent underlines after blur.
============================================================ */

const LT_ENDPOINT = 'https://api.languagetool.org/v2/check'; // public instance (rate-limited)
const LT_LANG = 'en-GB'; // change to en-US/en-AU/etc if desired

// Debounce to avoid spamming the API while typing
function debounce(fn, delay = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Cache per field: { txt, ranges }
const spellCache = new WeakMap();

/** Call LanguageTool for spelling errors; returns [{start,end}, ...] */
async function fetchSpellingRanges(text) {
  if (!text || !text.trim()) return [];
  const params = new URLSearchParams();
  params.set('language', LT_LANG);
  params.set('text', text);

  const res = await fetch(LT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) throw new Error('Spell API error: ' + res.status);
  const data = await res.json();

  const ranges = [];
  if (data && Array.isArray(data.matches)) {
    for (const m of data.matches) {
      // spelling-only to keep noise low
      const isSpelling =
        (m.rule && m.rule.issueType === 'misspelling') ||
        (m.rule && m.rule.category && /TYPOS|MISSPELLING/i.test(m.rule.category.id || ''));
      if (isSpelling && typeof m.offset === 'number' && typeof m.length === 'number') {
        ranges.push({ start: m.offset, end: m.offset + m.length });
      }
    }
  }
  return ranges;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/** Render text with <span class="spell-err"> wrappers for given ranges */
function renderWithRanges(text, ranges) {
  if (!ranges || !ranges.length) return escapeHtml(text);

  // Merge overlapping/adjacent ranges
  ranges.sort((a,b)=>a.start-b.start);
  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length-1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }

  let out = '';
  let idx = 0;
  for (const r of merged) {
    if (idx < r.start) out += escapeHtml(text.slice(idx, r.start));
    out += `<span class="spell-err">${escapeHtml(text.slice(r.start, r.end))}</span>`;
    idx = r.end;
  }
  if (idx < text.length) out += escapeHtml(text.slice(idx));
  return out;
}

function copyTextStyles(fromEl, toEl) {
  const cs = getComputedStyle(fromEl);
  [
    'font','fontSize','fontFamily','fontWeight','lineHeight','letterSpacing',
    'textTransform','textAlign',
    'paddingTop','paddingRight','paddingBottom','paddingLeft',
    'borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth',
    'boxSizing',
  ].forEach(p => { toEl.style[p] = cs[p]; });
  toEl.style.borderRadius = cs.borderRadius;
}

function attachPersistentSpellcheck(field) {
  if (!field || field.__spellAttached) return;
  field.__spellAttached = true;

  // Wrap the field so overlay can sit on top
  const wrap = document.createElement('div');
  wrap.className = 'spellwrap';

  // Keep wrapper behaving in flex/grid layouts
  const csField = getComputedStyle(field);
  wrap.style.flex = csField.flex;
  wrap.style.alignSelf = csField.alignSelf;
  wrap.style.width = '100%';
  wrap.style.minWidth = '0';

  field.parentNode.insertBefore(wrap, field);
  wrap.appendChild(field);

  const ghost = document.createElement('div');
  ghost.className = 'spell-ghost';
  wrap.appendChild(ghost);

  const showOverlay = (show) => { ghost.style.display = show ? 'block' : 'none'; };

  // Let the browser show its native underlines while typing
  field.setAttribute('spellcheck', 'true');

  const syncStyles = () => {
    copyTextStyles(field, ghost);
    ghost.style.width = `${field.offsetWidth}px`;
    ghost.style.height = `${field.offsetHeight}px`;
  };

  const getText = () =>
    field.matches('[contenteditable="true"]') ? (field.innerText || '') : (field.value || '');

  // Fetch-and-render with caching
  const render = async () => {
    const txt = getText();
    const cached = spellCache.get(field);
    if (cached && cached.txt === txt) {
      ghost.innerHTML = renderWithRanges(txt, cached.ranges);
      return;
    }
    try {
      const ranges = await fetchSpellingRanges(txt);
      spellCache.set(field, { txt, ranges });
      ghost.innerHTML = renderWithRanges(txt, ranges);
    } catch {
      ghost.innerHTML = renderWithRanges(txt, []);
    }
  };

  const debouncedRender = debounce(render, 350);
  const update = () => { syncStyles(); debouncedRender(); };
  const updateImmediate = () => { syncStyles(); render(); };

  // Initial paint — show overlay only if not focused
  updateImmediate();
  showOverlay(document.activeElement !== field);

  // Toggle overlay vs native based on focus
  field.addEventListener('focus', () => {
    showOverlay(false);                 // hide our overlay
    field.setAttribute('spellcheck', 'true'); // native on
  });
  field.addEventListener('blur', () => {
    updateImmediate();                  // fetch latest
    showOverlay(true);                  // show persistent overlay
  });

  // Keep in sync with edits and layout changes
  field.addEventListener('input', update);
  field.addEventListener('keyup', update);
  field.addEventListener('change', updateImmediate);
  window.addEventListener('resize', updateImmediate);

  // For contenteditable mutations
  if (field.isContentEditable || field.matches('[contenteditable="true"]')) {
    const mo = new MutationObserver(update);
    mo.observe(field, { characterData: true, subtree: true, childList: true });
  }
}

function enablePersistentSpellcheck(root = document) {
  const sel = 'input[type="text"], input[type="search"], textarea, [contenteditable="true"]';
  root.querySelectorAll(sel).forEach(attachPersistentSpellcheck);

  // Catch fields added later (Universal Author can inject dynamically)
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
