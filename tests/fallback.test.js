const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');

function makeApp() {
  const fallback = [{ hidden: false }, { hidden: false }];
  const mainCards = ['balcony', 'family'].map((tag) => ({
    dataset: { [tag]: '1' },
    classList: { toggle(_name, hidden) { this.hidden = hidden; } },
  }));
  const fallbackCard = { dataset: {}, classList: { toggle() { throw new Error('Fallback should not be filtered'); } } };
  const grid = { querySelectorAll: (selector) => selector === '.room' ? mainCards : [] };
  const empty = { hidden: true };
  const year = { textContent: '' };
  const bodyClasses = new Set();
  const nodes = { '#roomGrid': grid, '#roomsEmpty': empty, '#year': year };
  const document = {
    querySelector: (selector) => nodes[selector] || null,
    querySelectorAll(selector) {
      if (selector === '.fallback-content') return fallback;
      if (selector === '.room') return [...mainCards, fallbackCard];
      return [];
    },
    addEventListener() {},
    body: { classList: { add: (value) => bodyClasses.add(value) } },
  };
  const context = { document, Intl };
  vm.createContext(context);
  vm.runInContext(source + `
    initDates = renderRooms = renderPriceTable = renderHolidayCalendar = fillRoomSelect =
      initGuestFields = renderGallery = initControls = initRequestForm = initGlobalEvents =
      initHeader = initBookBar = observeReveals = () => {};
    globalThis.api = { init, applyFilter, failInitialization: () => { initBookBar = () => { throw new Error('init failure'); }; } };
  `, context);
  return { api: context.api, fallback, mainCards, empty, bodyClasses };
}

test('fallback content is hidden only after successful initialization', () => {
  const app = makeApp();
  app.api.init();
  assert.deepEqual(app.fallback.map((el) => el.hidden), [true, true]);
  assert.equal(app.bodyClasses.has('js-ready'), true);
});

test('fallback remains available if initialization fails', () => {
  const app = makeApp();
  app.api.failInitialization();
  assert.throws(() => app.api.init(), /init failure/);
  assert.deepEqual(app.fallback.map((el) => el.hidden), [false, false]);
  assert.equal(app.bodyClasses.has('js-ready'), false);
});

test('room filter only considers the interactive room grid', () => {
  const app = makeApp();
  app.api.applyFilter('balcony');
  assert.equal(app.mainCards[0].classList.hidden, false);
  assert.equal(app.mainCards[1].classList.hidden, true);
  assert.equal(app.empty.hidden, true);
  app.api.applyFilter('bathtub');
  assert.equal(app.empty.hidden, false);
});
