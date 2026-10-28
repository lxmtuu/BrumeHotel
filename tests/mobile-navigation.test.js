const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const pages = [
  'index.html', 'gioi-thieu.html', 'phong.html', 'bang-gia.html',
  'khong-gian.html', 'vi-tri.html', 'dat-phong.html',
];

function classList() {
  const values = new Set();
  return {
    contains: (name) => values.has(name),
    add: (name) => values.add(name),
    remove: (name) => values.delete(name),
    toggle(name, force) {
      const active = force === undefined ? !values.has(name) : Boolean(force);
      if (active) values.add(name);
      else values.delete(name);
      return active;
    },
  };
}

function eventTarget() {
  const handlers = {};
  return {
    classList: classList(),
    attributes: {},
    addEventListener(type, handler) { (handlers[type] ||= []).push(handler); },
    setAttribute(name, value) { this.attributes[name] = value; },
    dispatch(type) { (handlers[type] || []).forEach((handler) => handler()); },
  };
}

test('mobile menu resets its own scroll on reopen and keeps its state in sync', () => {
  const siteTop = eventTarget();
  const burger = eventTarget();
  const nav = Object.assign(eventTarget(), { scrollTop: 0 });
  const link = eventTarget();
  const body = { classList: classList() };
  const nodes = { '#siteTop': siteTop, '#burger': burger, '#nav': nav };
  const document = {
    body,
    querySelector: (selector) => nodes[selector] || null,
    querySelectorAll: (selector) => selector === '#nav a' ? [link] : [],
    addEventListener() {},
  };
  const window = Object.assign(eventTarget(), { scrollY: 0 });
  const context = vm.createContext({ document, window, Intl });
  const source = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
  vm.runInContext(source + '\nglobalThis.initHeaderForTest = initHeader;', context);
  context.initHeaderForTest();

  window.scrollY = 120;
  window.dispatch('scroll');
  assert.equal(siteTop.classList.contains('is-stuck'), true);

  nav.scrollTop = 180;
  burger.dispatch('click');
  assert.equal(nav.scrollTop, 0);
  assert.equal(body.classList.contains('nav-open'), true);
  assert.equal(nav.classList.contains('is-open'), true);
  assert.equal(burger.attributes['aria-expanded'], 'true');
  assert.equal(burger.attributes['aria-label'], 'Đóng menu');

  nav.scrollTop = 220;
  burger.dispatch('click');
  assert.equal(body.classList.contains('nav-open'), false);
  assert.equal(burger.attributes['aria-expanded'], 'false');
  burger.dispatch('click');
  assert.equal(nav.scrollTop, 0);
  link.dispatch('click');
  assert.equal(nav.classList.contains('is-open'), false);
  assert.equal(body.classList.contains('nav-open'), false);
  assert.equal(burger.attributes['aria-label'], 'Mở menu');
});

test('all pages use the updated shared menu assets rather than the old cached versions', () => {
  const cssVersions = new Set();
  const jsVersions = new Set();
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const css = html.match(/assets\/css\/style\.css\?v=([^"']+)/);
    const js = html.match(/assets\/js\/app\.js\?v=([^"']+)/);
    assert.ok(css, `${page}: missing versioned CSS`);
    assert.ok(js, `${page}: missing versioned JavaScript`);
    cssVersions.add(css[1]);
    jsVersions.add(js[1]);
  }
  assert.equal(cssVersions.size, 1);
  assert.equal(jsVersions.size, 1);
  assert.notEqual([...cssVersions][0], '20261028-v9');
  assert.notEqual([...jsVersions][0], '20261028-v9');
});
