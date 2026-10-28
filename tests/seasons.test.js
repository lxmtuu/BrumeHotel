const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');
const calendarSource = fs.readFileSync(path.join(__dirname, '../assets/js/holiday-calendar.js'), 'utf8');
function makeApp(calendar = calendarSource) {
  const elements = new Map();
  const cards = new Map();
  const buttons = ['low', 'high', 'peak'].map((season) => ({
    dataset: { season },
    classList: { toggle(_name, active) { this.active = active; } },
    setAttribute(name, value) { this[name] = value; },
    addEventListener(name, fn) { this[name] = fn; },
  }));
  function get(id) {
    if (!elements.has(id)) elements.set(id, {
      value: '', min: '', textContent: '', listeners: {},
      classList: {
        items: new Set(),
        add(name) { this.items.add(name); },
        remove(name) { this.items.delete(name); },
        toggle(name, active) { if (active) this.items.add(name); else this.items.delete(name); },
        contains(name) { return this.items.has(name); },
      },
      addEventListener(type, handler) { this.listeners[type] = handler; },
    });
    return elements.get(id);
  }
  function card(slug) {
    if (!cards.has(slug)) {
      const fields = new Map();
      cards.set(slug, { querySelector(selector) {
        if (!fields.has(selector)) fields.set(selector, { textContent: '' });
        return fields.get(selector);
      } });
    }
    return cards.get(slug);
  }
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-10-28T05:00:00Z'])); }
  }
  const document = {
    querySelector(selector) {
      const match = selector.match(/^\.room\[data-slug="(.+)"\]$/);
      return match ? card(match[1]) : get(selector.slice(1));
    },
    querySelectorAll(selector) { return selector === '.season__btn' ? buttons : []; },
    addEventListener() {},
    body: { classList: { toggle() {} } },
  };
  const context = { document, Intl, Date: FixedDate };
  vm.createContext(context);
  if (calendar !== null) vm.runInContext(calendar, context);
  vm.runInContext(source + '\nglobalThis.api = {seasonForDate, stayHasMultiplePeriods, updateSeasonFromDates, initBookBar, initRequestForm, initControls, validateHolidayCalendar, holidayCalendarCovers, holidayCalendarHTML, HOLIDAY_CALENDAR_AVAILABLE};', context);
  return { api: context.api, get, card, buttons };
}

test('season selection follows months and exact holiday boundaries', () => {
  const { api } = makeApp();
  for (const [day, season, kind] of [
    ['2026-01-15', 'high', null], ['2026-02-15', 'low', null],
    ['2026-05-31', 'low', null], ['2026-06-01', 'high', null],
    ['2026-08-28', 'high', null], ['2026-08-29', 'peak', 'holiday'],
    ['2026-09-01', 'peak', 'holiday'], ['2026-09-02', 'low', null],
    ['2027-01-01', 'peak', 'holiday'], ['2027-01-02', 'high', null],
    ['2027-02-06', 'low', null], ['2027-02-07', 'peak', 'tet'],
    ['2027-02-10', 'peak', 'tet'], ['2027-02-11', 'peak', 'holiday'],
    ['2027-02-15', 'peak', 'holiday'], ['2027-02-16', 'low', null],
    ['2028-02-07', 'low', null],
  ]) {
    const result = api.seasonForDate(day);
    assert.equal(result.season, season, day);
    assert.equal(result.kind, kind, day);
  }
  assert.equal(api.seasonForDate('2027-02-30'), null);
  assert.equal(api.seasonForDate(''), null);
});

test('checkout is excluded and crossing rate periods is flagged', () => {
  const { api } = makeApp();
  assert.equal(api.stayHasMultiplePeriods('2026-12-31', '2027-01-01'), false);
  assert.equal(api.stayHasMultiplePeriods('2026-12-31', '2027-01-02'), true);
  assert.equal(api.stayHasMultiplePeriods('2027-02-10', '2027-02-11'), false);
  assert.equal(api.stayHasMultiplePeriods('2027-02-10', '2027-02-12'), true);
  assert.equal(api.stayHasMultiplePeriods('2027-05-30', '2027-06-02'), true);
  assert.equal(api.stayHasMultiplePeriods('2027-02-20', '2027-02-21'), false);
  assert.equal(api.stayHasMultiplePeriods('2027-01-01', '2030-01-01'), true);
});

test('weekday and weekend prices follow the actual check-in date', () => {
  const { api, get, card } = makeApp();
  for (const [date, checkout, expected, label, other] of [
    ['2026-10-29', '2026-10-30', '400.000₫', 'Ngày thường (CN–T5)', 'Cuối tuần (T6–T7): 500.000₫'],
    ['2026-10-30', '2026-10-31', '500.000₫', 'Cuối tuần (T6–T7)', 'Ngày thường (CN–T5): 400.000₫'],
    ['2026-10-31', '2026-11-01', '500.000₫', 'Cuối tuần (T6–T7)', 'Ngày thường (CN–T5): 400.000₫'],
    ['2026-11-01', '2026-11-02', '400.000₫', 'Ngày thường (CN–T5)', 'Cuối tuần (T6–T7): 500.000₫'],
    ['2026-12-04', '2026-12-05', '750.000₫', 'Cuối tuần (T6–T7)', 'Ngày thường (CN–T5): 650.000₫'],
    ['2026-12-06', '2026-12-07', '650.000₫', 'Ngày thường (CN–T5)', 'Cuối tuần (T6–T7): 750.000₫'],
  ]) {
    api.updateSeasonFromDates(date, checkout);
    assert.equal(card('double').querySelector('.price__value').textContent, expected, date);
    assert.ok(card('double').querySelector('.price__label').textContent.includes(label), date);
    assert.ok(card('double').querySelector('.price__sub').textContent.startsWith(other), date);
    assert.ok(get('bookSeason').textContent.includes(label), date);
  }
  api.updateSeasonFromDates('2026-10-30', '2026-11-02');
  assert.match(get('bookSeason').textContent, /các đêm khác có thể khác/);
});

test('Tet puts the Tet price first, and unknown holidays need confirmation', () => {
  const { api, get, card, buttons } = makeApp();
  api.updateSeasonFromDates('2027-02-07', '2027-02-11');
  assert.equal(buttons[2]['aria-pressed'], 'true');
  assert.equal(card('double').querySelector('.price__value').textContent, '1.200.000₫');
  assert.match(card('double').querySelector('.price__label').textContent, /Tết/);
  assert.match(get('bookSeason').textContent, /Tết/);
  api.updateSeasonFromDates('2027-02-11', '2027-02-12');
  assert.equal(card('double').querySelector('.price__value').textContent, '850.000₫');
  // Holiday takes precedence even when it falls on a Friday.
  api.updateSeasonFromDates('2027-01-01', '2027-01-02');
  assert.equal(card('double').querySelector('.price__value').textContent, '850.000₫');
  assert.match(card('double').querySelector('.price__label').textContent, /Lễ/);
  api.updateSeasonFromDates('2028-02-07', '2028-02-09');
  assert.match(get('bookSeason').textContent, /Chưa có lịch lễ\/Tết/);
  assert.equal(buttons[0]['aria-pressed'], 'true');
});

test('warnings distinguish listed holiday nights from unconfirmed dates', () => {
  const { api, get, card } = makeApp();
  api.updateSeasonFromDates('2027-02-07', '2027-02-11');
  assert.equal(get('bookSeason').classList.contains('is-unconfirmed'), false);
  assert.doesNotMatch(card('double').querySelector('.price__label').textContent, /Dự kiến/);
  // Adjacent Tet and holiday ranges cover every night, but the price period changes.
  api.updateSeasonFromDates('2027-02-10', '2027-02-12');
  assert.equal(get('bookSeason').classList.contains('is-unconfirmed'), false);
  assert.match(get('bookSeason').textContent, /nhiều mùa/);
  api.updateSeasonFromDates('2027-02-15', '2027-02-17');
  assert.equal(get('bookSeason').classList.contains('is-unconfirmed'), true);
  assert.match(get('bookSeason').textContent, /Chưa có lịch lễ\/Tết đầy đủ/);
  api.updateSeasonFromDates('2027-02-16', '2027-02-17');
  assert.equal(get('seasonStatus').classList.contains('is-unconfirmed'), true);
  assert.match(card('double').querySelector('.price__label').textContent, /Dự kiến/);
});

test('calendar validation rejects invalid and conflicting ranges', () => {
  const { api } = makeApp();
  assert.equal(api.validateHolidayCalendar([{from:'2027-02-30', to:'2027-03-02', kind:'holiday'}]), null);
  assert.equal(api.validateHolidayCalendar([{from:'2027-02-02', to:'2027-02-01', kind:'holiday'}]), null);
  assert.equal(api.validateHolidayCalendar([{from:'2027-02-01', to:'2027-02-02', kind:'unknown'}]), null);
  assert.equal(api.validateHolidayCalendar([
    {from:'2027-02-01', to:'2027-02-03', kind:'holiday'},
    {from:'2027-02-03', to:'2027-02-04', kind:'tet'},
  ]), null);
  const sorted = api.validateHolidayCalendar([
    {from:'2027-02-04', to:'2027-02-05', kind:'tet'},
    {from:'2027-02-01', to:'2027-02-03', kind:'holiday'},
  ]);
  assert.equal(sorted[0].from, '2027-02-01');
});

test('missing or invalid calendar fails safely and updated ranges appear in the summary', () => {
  const missing = makeApp(null);
  assert.equal(missing.api.HOLIDAY_CALENDAR_AVAILABLE, false);
  assert.match(missing.api.holidayCalendarHTML(), /Chưa có lịch/);
  missing.api.updateSeasonFromDates('2027-02-07', '2027-02-08');
  assert.equal(missing.get('bookSeason').classList.contains('is-unconfirmed'), true);
  assert.match(missing.card('double').querySelector('.price__label').textContent, /Dự kiến/);

  const invalid = makeApp('globalThis.BRUME_HOLIDAYS = [{from: "2027-02-30", to: "2027-02-30", kind: "tet"}];');
  assert.equal(invalid.api.HOLIDAY_CALENDAR_AVAILABLE, false);
  assert.match(invalid.api.holidayCalendarHTML(), /Chưa có lịch/);

  const updated = makeApp('globalThis.BRUME_HOLIDAYS = [{from: "2028-01-02", to: "2028-01-03", kind: "holiday"}];');
  assert.equal(updated.api.seasonForDate('2028-01-02').kind, 'holiday');
  assert.match(updated.api.holidayCalendarHTML(), /02\/01\/2028–03\/01\/2028/);
});

test('manual selection and invalid dates do not retain a previous date-specific price', () => {
  const { api, get, card, buttons } = makeApp();
  api.initControls();
  api.updateSeasonFromDates('2026-10-30', '2026-10-31');
  assert.equal(card('double').querySelector('.price__value').textContent, '500.000₫');
  buttons[0].click();
  assert.equal(card('double').querySelector('.price__value').textContent, '400.000₫');
  assert.match(get('seasonStatus').textContent, /thủ công/);
  api.updateSeasonFromDates('2026-10-30', '2026-10-31');
  api.updateSeasonFromDates('', '');
  assert.equal(card('double').querySelector('.price__value').textContent, '400.000₫');
  assert.match(get('seasonStatus').textContent, /Chọn ngày/);
});

test('both date forms synchronize and the manual season selector still works', () => {
  const { api, get, buttons } = makeApp();
  get('ci').value = '2026-10-29'; get('co').value = '2026-10-30';
  api.initControls();
  api.initRequestForm();
  api.initBookBar();
  get('ci').value = '2026-12-30'; get('ci').listeners.change();
  assert.equal(get('rCi').value, '2026-12-30');
  assert.equal(get('co').value, '2026-12-31');
  assert.equal(buttons[1]['aria-pressed'], 'true');
  get('co').value = '2027-01-02'; get('co').listeners.change();
  assert.match(get('bookSeason').textContent, /nhiều mùa/);
  assert.equal(get('rCo').value, '2027-01-02');
  get('rCi').value = '2027-02-07'; get('rCi').listeners.change();
  assert.equal(get('ci').value, '2027-02-07');
  assert.equal(get('co').value, '2027-02-08');
  assert.equal(buttons[2]['aria-pressed'], 'true');
  buttons[0].click();
  assert.equal(buttons[0]['aria-pressed'], 'true');
  assert.match(get('seasonStatus').textContent, /thủ công/);
  get('rCo').value = '2027-02-12'; get('rCo').listeners.change();
  assert.equal(buttons[2]['aria-pressed'], 'true');
  assert.match(get('requestSeason').textContent, /nhiều mùa/);
});
