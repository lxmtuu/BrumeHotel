const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const calendarSource = fs.readFileSync(path.join(root, 'assets/js/holiday-calendar.js'), 'utf8');

const ALL_PAGES = [
  'index.html',
  'gioi-thieu.html',
  'phong.html',
  'bang-gia.html',
  'khong-gian.html',
  'vi-tri.html',
  'dat-phong.html',
];

const SUBPAGES = ALL_PAGES.filter((f) => f !== 'index.html');

function extractPageIds(html) {
  const ids = new Map();
  const tagRegex = /<([a-zA-Z0-9-]+)\b([^>]*)>/g;
  let match;
  while ((match = tagRegex.exec(html)) !== null) {
    const [, tag, attrs] = match;
    const idMatch = attrs.match(/\bid="([^"]+)"/);
    if (!idMatch) continue;
    const id = idMatch[1];
    const hidden = /\bhidden\b/.test(attrs);
    const valMatch = attrs.match(/\bvalue="([^"]*)"/);
    ids.set(id, {
      id,
      tagName: tag.toUpperCase(),
      hidden,
      defaultValue: valMatch ? valMatch[1] : '',
    });
  }
  return ids;
}

function makeElement(meta, docRef) {
  const classes = new Set();
  const listeners = {};
  let inner = '';
  const el = {
    id: meta.id,
    tagName: meta.tagName,
    value: meta.defaultValue || (meta.id === 'rAdults' || meta.id === 'adults' ? '2' : meta.id === 'rRoomCount' ? '1' : meta.id === 'rVehicle' ? 'none' : meta.id.includes('Children') ? '0' : ''),
    min: '',
    hidden: Boolean(meta.hidden),
    textContent: '',
    dataset: {},
    children: [],
    listeners,
    get innerHTML() {
      return inner;
    },
    set innerHTML(val) {
      inner = String(val);
    },
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      toggle(name, active) {
        if (active === undefined) {
          if (classes.has(name)) { classes.delete(name); return false; }
          classes.add(name); return true;
        }
        if (active) classes.add(name);
        else classes.delete(name);
        return Boolean(active);
      },
      contains(name) { return classes.has(name); },
    },
    addEventListener(type, fn) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(fn);
    },
    dispatch(type, extra = {}) {
      const fns = listeners[type] || [];
      fns.forEach((fn) => fn({ preventDefault() {}, ...extra }));
    },
    setAttribute(name, val) { this[name] = val; },
    getAttribute(name) { return this[name] || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    contains() { return false; },
    getClientRects() { return this.hidden ? [] : [1]; },
    focus() { docRef.activeElement = this; },
    reportValidity() { return true; },
  };
  return el;
}

function mountPage(html) {
  const idMetas = extractPageIds(html);
  const elements = new Map();
  const docListeners = {};
  const bodyClasses = new Set();

  const document = {
    activeElement: null,
    body: {
      classList: {
        add(name) { bodyClasses.add(name); },
        remove(name) { bodyClasses.delete(name); },
        toggle(name, active) {
          if (active) bodyClasses.add(name);
          else bodyClasses.delete(name);
        },
        contains(name) { return bodyClasses.has(name); },
      },
      insertAdjacentHTML(_pos, markup) {
        for (const [id, meta] of extractPageIds(markup)) {
          if (!elements.has(id)) elements.set(id, makeElement(meta, document));
        }
      },
    },
    querySelector(selector) {
      if (selector.startsWith('#')) {
        return elements.get(selector.slice(1)) || null;
      }
      if (selector === '.modal:not([hidden])') {
        for (const id of ['bookModal', 'roomModal']) {
          const m = elements.get(id);
          if (m && !m.hidden) return m;
        }
        return null;
      }
      if (selector === '.lightbox:not([hidden])') {
        const lb = elements.get('lightbox');
        return lb && !lb.hidden ? lb : null;
      }
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener(type, fn) {
      if (!docListeners[type]) docListeners[type] = [];
      docListeners[type].push(fn);
    },
  };

  for (const [id, meta] of idMetas) {
    elements.set(id, makeElement(meta, document));
  }

  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : ['2026-10-28T05:00:00Z']));
    }
  }

  const windowObj = {
    scrollY: 0,
    addEventListener() {},
    scrollTo() {},
  };

  const context = {
    document,
    window: windowObj,
    Intl,
    Date: FixedDate,
    fetch: () => Promise.resolve({ ok: true }),
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout() {},
  };

  vm.createContext(context);
  vm.runInContext(calendarSource, context);
  vm.runInContext(source + '\nglobalThis.api = { init, openBooking };', context);
  context.api.init();

  function clickOpenBookButton() {
    const openBtn = {
      closest(sel) {
        return sel === '[data-open-book]' ? openBtn : null;
      },
    };
    (docListeners.click || []).forEach((fn) => fn({ target: openBtn, preventDefault() {} }));
  }

  return { document, elements, bodyClasses, clickOpenBookButton };
}

test('clicking top "Đặt phòng" button opens booking modal across all 7 pages', () => {
  for (const page of ALL_PAGES) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(
      html,
      /<div class="header__actions">[\s\S]*?<button[^>]*\bdata-open-book\b[^>]*>\s*Đặt phòng\s*<\/button>/,
      `${page} must have top "Đặt phòng" button with data-open-book`
    );

    const { elements, bodyClasses, clickOpenBookButton } = mountPage(html);
    assert.equal(bodyClasses.has('js-ready'), true, `${page} must finish init() and set body.js-ready`);

    const modal = elements.get('bookModal');
    assert.ok(modal, `${page} must have #bookModal`);
    assert.equal(modal.hidden, true, `${page} #bookModal starts hidden`);

    clickOpenBookButton();

    assert.equal(modal.hidden, false, `${page} #bookModal must open on clicking "Đặt phòng"`);
    assert.equal(elements.get('requestForm').hidden, false, `${page} #requestForm must be visible`);
    assert.match(elements.get('rCi').value, /^\d{4}-\d{2}-\d{2}$/, `${page} #rCi has valid date`);
    assert.match(elements.get('rCo').value, /^\d{4}-\d{2}-\d{2}$/, `${page} #rCo has valid date`);
    assert.match(elements.get('requestSeason').textContent, /Ngày nhận/, `${page} #requestSeason is populated`);
    assert.match(elements.get('rRoom').innerHTML, /Superior/, `${page} #rRoom room options populated`);
  }
});

test('ensureBookModal injects and opens booking modal even on a page missing #bookModal markup', () => {
  const minimalHtml = `<!doctype html><html><body>
    <header><div class="header__actions"><button type="button" data-open-book>Đặt phòng</button></div></header>
  </body></html>`;
  const { elements, bodyClasses, clickOpenBookButton } = mountPage(minimalHtml);
  assert.equal(bodyClasses.has('js-ready'), true);
  assert.ok(elements.get('bookModal'));
  assert.equal(elements.get('bookModal').hidden, true);

  clickOpenBookButton();
  assert.equal(elements.get('bookModal').hidden, false);
  assert.match(elements.get('requestSeason').textContent, /Ngày nhận/);
});

test('breadcrumb "Trang chủ" button on vi-tri.html and all subpages has explicit 14x14 icon sizing', () => {
  for (const page of SUBPAGES) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(
      html,
      /<nav class="breadcrumbs"[\s\S]*?<a href="index\.html" class="breadcrumb-home">\s*<svg width="14" height="14" viewBox="0 0 24 24"/,
      `${page} breadcrumb Trang chủ link must use .breadcrumb-home and 14x14 intrinsic SVG`
    );
  }
});

test('official Brume Hotel logo assets and placements are wired across all 7 main pages', () => {
  for (const asset of [
    'assets/img/logo.jpg',
    'assets/img/logo-mark.png',
    'assets/img/logo-full.png',
    'assets/img/favicon-32.png',
    'assets/img/favicon-192.png',
    'assets/img/apple-touch-icon.png',
  ]) {
    assert.equal(fs.existsSync(path.join(root, asset)), true, `${asset} must exist`);
  }

  const logoBuf = fs.readFileSync(path.join(root, 'assets/img/logo.jpg'));
  const heroBuf = fs.readFileSync(path.join(root, 'assets/img/hero.jpg'));
  assert.notEqual(logoBuf.length, heroBuf.length, 'logo.jpg must be the real logo, not a duplicate of hero.jpg');

  for (const page of ALL_PAGES) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    assert.match(html, /assets\/img\/favicon-32\.png/, `${page} has 32x32 favicon`);
    assert.match(html, /assets\/img\/apple-touch-icon\.png/, `${page} has apple-touch-icon`);
    assert.match(html, /class="brand__mark"\s+src="assets\/img\/logo-mark\.png"/, `${page} header uses logo-mark.png`);
    assert.match(html, /class="footer__logo"\s+src="assets\/img\/logo-full\.png"/, `${page} footer uses logo-full.png`);
    assert.match(html, /class="modal__brand"[\s\S]*?assets\/img\/logo-mark\.png/, `${page} booking modal uses logo-mark.png`);
  }
});

