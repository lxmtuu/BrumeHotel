const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');

function makeApp() {
  const elements = new Map();
  const document = {
    activeElement: null,
    querySelector(selector) {
      if (selector.startsWith('.modal') || selector.startsWith('.lightbox')) return null;
      return get(selector.slice(1));
    },
    querySelectorAll() { return []; },
    addEventListener() {},
    body: { classList: { toggle() {} } },
  };
  function element(id) {
    return {
      id, hidden: true, children: [],
      querySelectorAll() { return this.children; },
      contains(el) { return this.children.includes(el); },
      getClientRects() { return [1]; },
      focus() { document.activeElement = this; },
    };
  }
  function get(id) {
    if (!elements.has(id)) elements.set(id, element(id));
    return elements.get(id);
  }
  const context = { document, Intl };
  vm.createContext(context);
  vm.runInContext(source + '\nglobalThis.api = { openModal, closeModal, trapFocus, openLightbox, stepLightbox, closeLightbox };', context);
  return { api: context.api, document, get, element };
}

test('modal focus wraps in both directions and returns to its opener', () => {
  const { api, document, get, element } = makeApp();
  const opener = element('opener');
  const modal = get('roomModal');
  const first = element('first');
  const last = element('last');
  const hidden = element('hidden');
  hidden.getClientRects = () => [];
  modal.children = [first, hidden, last];
  opener.focus();
  api.openModal(modal);
  assert.equal(document.activeElement, first);
  let prevented = false;
  api.trapFocus({ shiftKey: true, preventDefault() { prevented = true; } }, modal);
  assert.equal(prevented, true);
  assert.equal(document.activeElement, last);
  api.trapFocus({ shiftKey: false, preventDefault() {} }, modal);
  assert.equal(document.activeElement, first);
  api.closeModal(modal);
  assert.equal(document.activeElement, opener);
});

test('lightbox navigation keeps its original opener for closing', () => {
  const { api, document, get, element } = makeApp();
  const opener = element('opener');
  const close = element('close');
  get('lightbox').children = [close];
  opener.focus();
  api.openLightbox(0);
  assert.equal(document.activeElement, close);
  api.stepLightbox(1);
  assert.match(get('lightboxCap').textContent, /2\/9/);
  api.closeLightbox();
  assert.equal(document.activeElement, opener);
});

test('static fallback stays in sync with room and gallery data', () => {
  execFileSync(process.execPath, [path.join(root, 'scripts/update-fallback.js'), '--check']);
});
