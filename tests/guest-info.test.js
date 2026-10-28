const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/app.js'), 'utf8');

function makeApp() {
  const fields = new Map();
  class Element {
    constructor(id) {
      this.id = id;
      this.value = ['adults', 'rAdults'].includes(id) ? '2' : ['childrenYoung', 'childrenOlder', 'rChildrenYoung', 'rChildrenOlder'].includes(id) ? '0' : '';
      this.hidden = false;
      this.textContent = '';
      this.min = '';
      this.listeners = {};
      this.children = [];
      this.classList = { add() {}, remove() {}, toggle() {} };
      this._innerHTML = '';
    }
    set innerHTML(value) {
      this._innerHTML = value;
      if (this.id === 'childAges') {
        const matches = [...value.matchAll(/data-child-age data-child-group="(young|older)" required/g)];
        this.children = matches.map((match, i) => {
          const child = new Element(`childAge${i + 1}`);
          child.dataset = { childGroup: match[1] };
          return child;
        });
      }
    }
    get innerHTML() { return this._innerHTML; }
    querySelectorAll(selector) {
      return this.id === 'childAges' && selector === 'select[data-child-age]' ? this.children : [];
    }
    querySelector() { return null; }
    addEventListener(type, listener) { this.listeners[type] = listener; }
    emit(type) { this.listeners[type]({ preventDefault() {} }); }
    focus() {}
    reportValidity() {
      if (this.id !== 'requestForm') return true;
      return get('childAges').children.every((select) => select.value !== '');
    }
  }
  function get(id) {
    if (!fields.has(id)) fields.set(id, new Element(id));
    return fields.get(id);
  }
  const document = {
    querySelector(selector) {
      return selector.startsWith('.room[') ? null : get(selector.slice(1));
    },
    querySelectorAll(selector) {
      return selector === '#childAges select[data-child-age]' ? get('childAges').children : [];
    },
    addEventListener() {},
    body: { classList: { toggle() {} } },
    activeElement: { focus() {} },
  };
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-10-28T05:00:00Z'])); }
  }
  const context = { document, Intl, Date: FixedDate };
  vm.createContext(context);
  vm.runInContext(source + '\nglobalThis.api = { ROOMS, initGuestFields, initRequestForm, initBookBar, initDates, openBooking, guestCapacityWarning, buildMessage };', context);
  return { api: context.api, get };
}

test('room capacity data matches the displayed descriptions', () => {
  const { api } = makeApp();
  for (const room of api.ROOMS) {
    assert.equal(room.adultCapacity, room.tags.includes('family') ? 4 : 2, room.slug);
    assert.equal(room.childCapacity, room.tags.includes('family') ? 2 : 1, room.slug);
    assert.match(room.capacity, new RegExp(`${room.adultCapacity} người lớn \\+ ${room.childCapacity} trẻ em`));
  }
});

test('guest counts and room choices synchronize with non-blocking capacity warnings', () => {
  const { api, get } = makeApp();
  api.initGuestFields();
  assert.equal(get('rAdults').value, '2');
  assert.equal(get('rChildrenYoung').value, '0');
  assert.equal(get('rChildrenOlder').value, '0');
  get('childrenYoung').value = '1'; get('childrenYoung').emit('change');
  get('childrenOlder').value = '1'; get('childrenOlder').emit('change');
  assert.equal(get('rChildrenYoung').value, '1');
  assert.equal(get('rChildrenOlder').value, '1');
  assert.equal(get('childAges').children.length, 2);
  get('rtype').value = 'double'; get('rtype').emit('change');
  assert.match(get('bookGuestWarning').textContent, /vượt sức chứa/);
  assert.equal(get('requestGuestWarning').hidden, false);
  get('rRoom').value = 'family-window'; get('rRoom').emit('change');
  assert.equal(get('rtype').value, 'family-window');
  assert.equal(get('bookGuestWarning').hidden, true);
  get('rAdults').value = '5'; get('rAdults').emit('change');
  assert.equal(get('adults').value, '5');
  assert.match(get('requestGuestWarning').textContent, /vượt sức chứa/);
  get('rRoom').value = ''; get('rRoom').emit('change');
  assert.equal(get('requestGuestWarning').hidden, true);
});

test('child ages are required, preserved when counts change, and sent in the message', () => {
  const { api, get } = makeApp();
  api.initDates();
  api.initGuestFields();
  api.initRequestForm();
  get('childrenYoung').value = '1'; get('childrenYoung').emit('change');
  get('childrenOlder').value = '1'; get('childrenOlder').emit('change');
  assert.match(get('childAges').innerHTML, /Dưới 1 tuổi/);
  assert.match(get('childAges').innerHTML, /trẻ đúng 6 tuổi/);
  get('requestForm').emit('submit');
  assert.equal(get('requestForm').hidden, false);
  get('childAges').children[0].value = '0';
  get('childAges').children[1].value = '6';
  get('rChildrenYoung').value = '2'; get('rChildrenYoung').emit('change');
  assert.equal(get('childAges').children[0].value, '0');
  assert.equal(get('childAges').children[2].value, '6');
  get('rChildrenYoung').value = '1'; get('rChildrenYoung').emit('change');
  assert.equal(get('childAges').children[0].value, '0');
  assert.equal(get('childAges').children[1].value, '6');
  get('rAdults').value = '4'; get('rAdults').emit('change');
  get('rRoom').value = 'family-window'; get('rRoom').emit('change');
  get('rName').value = 'Nguyễn An';
  get('rPhone').value = '0912345678';
  get('requestForm').emit('submit');
  assert.equal(get('requestForm').hidden, true);
  assert.match(get('requestText').textContent, /Người lớn \(từ 12 tuổi\): 4/);
  assert.match(get('requestText').textContent, /Trẻ dưới 6 tuổi: 1/);
  assert.match(get('requestText').textContent, /Trẻ từ 6 đến dưới 12 tuổi: 1/);
  assert.match(get('requestText').textContent, /Tuổi trẻ dưới 6 tuổi: dưới 1 tuổi/);
  assert.match(get('requestText').textContent, /Tuổi trẻ từ 6 đến dưới 12 tuổi: 6 tuổi/);
  assert.match(get('requestText').textContent, /Hạng phòng: Family Room with Window/);
});

test('request without children does not include ages and room cards update warning', () => {
  const { api, get } = makeApp();
  api.initDates();
  api.initGuestFields();
  get('adults').value = '4'; get('adults').emit('change');
  api.openBooking({ room: 'double' });
  assert.match(get('requestGuestWarning').textContent, /vượt sức chứa/);
  assert.equal(get('rtype').value, 'double');
  const message = api.buildMessage();
  assert.match(message, /Trẻ dưới 6 tuổi: 0/);
  assert.match(message, /Trẻ từ 6 đến dưới 12 tuổi: 0/);
  assert.doesNotMatch(message, /Tuổi trẻ/);
});

test('vehicle choice updates message and advice for reception', () => {
  const { api, get } = makeApp();
  api.initDates();
  api.initGuestFields();
  api.initRequestForm();

  get('rVehicle').value = 'car';
  get('rVehicle').emit('change');
  assert.equal(get('vehicleHint').hidden, false);
  assert.match(get('vehicleHint').innerHTML, /bãi gửi xe/);

  get('rName').value = 'Trần Bình';
  get('rPhone').value = '0988776655';
  get('requestForm').emit('submit');
  assert.match(get('requestText').textContent, /• Phương tiện: Đi ô tô riêng \(nhờ lễ tân tư vấn chỗ đỗ \/ bãi gửi xe\)/);

  get('rVehicle').value = 'motorbike';
  get('rVehicle').emit('change');
  assert.match(get('vehicleHint').innerHTML, /khu vực để xe máy an toàn/);

  get('rVehicle').value = 'rent_bike';
  get('rVehicle').emit('change');
  assert.match(get('vehicleHint').innerHTML, /thuê xe máy/);
});
