const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const context = { document: { querySelector: () => null, addEventListener() {} }, Intl };
vm.createContext(context);
vm.runInContext(source + '\nglobalThis.api = { ROOMS, cardHTML, roomSheetHTML };', context);
const { ROOMS, cardHTML, roomSheetHTML } = context.api;

test('each room has the correct area, child capacity and rendered details', () => {
  const areas = [18, 20, 20, 25, 25, 50, 50, 28, 30, 30];
  assert.equal(ROOMS.length, areas.length);
  ROOMS.forEach((room, i) => {
    assert.equal(room.area, areas[i]);
    assert.match(room.capacity, /trẻ em dưới 12 tuổi/);
    assert.match(cardHTML(room), new RegExp(`Diện tích</dt><dd>${areas[i]} m²`));
    assert.match(roomSheetHTML(room), new RegExp(`Diện tích</span><strong>${areas[i]} m²`));
  });
});

test('existing prices remain unchanged', () => {
  const expected = [
    [400000,500000,650000,750000,850000,1200000],
    [450000,550000,700000,800000,900000,1350000],
    [500000,600000,900000,1000000,1250000,1900000],
    [600000,700000,1100000,1250000,1600000,2400000],
    [700000,800000,1150000,1300000,1650000,2600000],
    [750000,850000,1200000,1400000,1750000,2700000],
    [750000,850000,1250000,1450000,1800000,2800000],
    [800000,900000,1300000,1500000,1900000,3200000],
    [850000,950000,1400000,1600000,2000000,3400000],
    [900000,1000000,1500000,1700000,2100000,3600000],
  ];
  ROOMS.forEach((room, i) => {
    assert.equal(JSON.stringify([...room.prices.low, ...room.prices.high, ...room.prices.peak]), JSON.stringify(expected[i]));
  });
});

test('day-of-week labels are distinct from seasons and holiday rates', () => {
  const card = cardHTML(ROOMS[0]);
  assert.ok(card.includes('Thấp điểm · Ngày thường (CN–T5)'));
  assert.ok(card.includes('Cuối tuần (T6–T7): 500.000₫'));
  const sheet = roomSheetHTML(ROOMS[0]);
  assert.match(sheet, /Ngày thường <span class="cap">CN–T5<\/span>/);
  assert.match(sheet, /Cuối tuần <span class="cap">T6–T7<\/span>/);
  const peakRows = [...sheet.matchAll(/scope="row">(Lễ|Tết)<\/th><td colspan="2">(.*?)<\/td>/g)];
  assert.deepEqual(peakRows.map((row) => row[1]), ['Lễ', 'Tết']);
  assert.match(peakRows[0][2], /850\.000₫/);
  assert.match(peakRows[1][2], /1\.200\.000₫/);
  peakRows.forEach((row) => assert.match(row[2], /giá riêng/));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /ngày thường là Chủ nhật–thứ Năm/);
  assert.match(html, /cuối tuần là thứ Sáu–thứ Bảy/);
  assert.equal((html.match(/Ngày thường<span>CN–T5<\/span>/g) || []).length, 2);
  assert.equal((html.match(/Cuối tuần<span>T6–T7<\/span>/g) || []).length, 2);
});

test('price sheet columns are laid out as equal, right-aligned columns', () => {
  const css = fs.readFileSync(path.join(root, 'assets/css/style.css'), 'utf8');
  const block = css.slice(css.indexOf('.mini-table {'), css.indexOf('.room-sheet__actions {'));
  assert.match(block, /table-layout:\s*fixed/);
  assert.match(block, /\.mini-table thead th:first-child \{[^}]*width:\s*40%/);
  assert.match(block, /\.mini-table thead th:nth-child\(2\),\s*\.mini-table thead th:nth-child\(3\) \{[^}]*width:\s*30%/);
  // Nhãn cột phải canh phải để trùng mép với số tiền bên dưới.
  assert.match(block, /color:\s*var\(--brass\);\s*white-space:\s*nowrap;[\s\S]*?text-align:\s*right/);
  assert.doesNotMatch(block, /\.mini-table thead th \{[^}]*text-align:\s*left/);
});
