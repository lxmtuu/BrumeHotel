const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');

function makeApp(now = '2026-10-27T18:00:00Z') {
  const elements = new Map();
  class Element {
    constructor(id) {
      this.id = id;
      this.value = '';
      this.min = '';
      this.hidden = false;
      this.textContent = '';
      this.listeners = {};
      this.classList = { add() {}, remove() {}, toggle() {} };
    }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    focus() {}
    querySelector() { return null; }
    querySelectorAll() { return []; }
    reportValidity() {
      const ids = this.id === 'bookForm' ? ['ci', 'co'] : ['rCi', 'rCo'];
      return ids.every((id) => {
        const field = get(id);
        return field.value && (!field.min || field.value >= field.min);
      });
    }
    submit() { this.listeners.submit({ preventDefault() {} }); }
  }
  function get(id) {
    if (!elements.has(id)) elements.set(id, new Element(id));
    return elements.get(id);
  }
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
  }
  const document = {
    querySelector: (selector) => selector.startsWith('.room[') ? null : get(selector.slice(1)),
    querySelectorAll: () => [],
    addEventListener() {},
    body: { classList: { toggle() {} } },
    activeElement: { focus() {} },
  };
  const context = { document, Intl, Date: FixedDate, setTimeout() {} };
  vm.createContext(context);
  vm.runInContext(source + '\nglobalThis.api = {todayISO, addDaysISO, initDates, syncCheckoutMin, openBooking, initBookBar, initRequestForm};', context);
  return { api: context.api, get };
}

test('hotel calendar uses Vietnam time at midnight and handles leap years', () => {
  assert.equal(makeApp('2026-10-27T16:59:59Z').api.todayISO(), '2026-10-27');
  assert.equal(makeApp('2026-10-27T17:00:00Z').api.todayISO(), '2026-10-28');
  assert.equal(makeApp('2024-02-28T17:00:00Z').api.todayISO(1), '2024-03-01');
});

test('checkout minimum uses calendar days even across DST changes', () => {
  const { api, get } = makeApp();
  get('ci').value = '2026-03-08';
  get('co').value = '2026-03-08';
  api.syncCheckoutMin('#ci', '#co');
  assert.equal(get('co').min, '2026-03-09');
  assert.equal(get('co').value, '2026-03-09');
  assert.equal(api.addDaysISO('2024-02-28', 1), '2024-02-29');
});

test('choosing advice clears a previously selected room', () => {
  const { api, get } = makeApp();
  api.initDates();
  get('rRoom').value = 'balcony';
  api.openBooking({ room: '' });
  assert.equal(get('rRoom').value, '');
  api.openBooking({ room: 'bathtub' });
  assert.equal(get('rRoom').value, 'bathtub');
});

test('booking bar rejects past or invalid dates without changing them', () => {
  const { api, get } = makeApp();
  api.initDates();
  api.initBookBar();
  get('bookModal').hidden = true;
  get('ci').value = '2026-10-27';
  get('co').value = '2026-10-29';
  get('bookForm').submit();
  assert.equal(get('bookModal').hidden, true);
  get('ci').value = '2026-10-29';
  get('co').value = '2026-10-29';
  get('bookForm').submit();
  assert.equal(get('bookModal').hidden, true);
  assert.equal(get('co').value, '2026-10-29');
  get('co').value = '2026-10-30';
  get('rtype').value = '';
  get('rRoom').value = 'balcony';
  get('bookForm').submit();
  assert.equal(get('bookModal').hidden, false);
  assert.equal(get('rRoom').value, '');
});

test('request form rechecks dates before generating a message', () => {
  const { api, get } = makeApp();
  api.initDates();
  api.initRequestForm();
  get('rCi').value = '2026-10-27';
  get('rCo').value = '2026-10-29';
  get('requestForm').submit();
  assert.equal(get('requestForm').hidden, false);
  get('rCi').value = '2026-10-28';
  get('rCo').value = '2026-10-28';
  get('requestForm').submit();
  assert.equal(get('requestForm').hidden, false);
  assert.equal(get('rCo').value, '2026-10-28');
  get('rCo').value = '2026-10-29';
  get('requestForm').submit();
  assert.equal(get('requestForm').hidden, true);
  assert.match(get('requestText').textContent, /28\/10\/2026/);
});
