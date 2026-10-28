// Keep static room, price, gallery and holiday fallback content in sync.
// Run: node scripts/update-fallback.js (or pass --check to verify without writing).
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
const source = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const priceTable = { innerHTML: '' };
const context = {
  document: {
    querySelector: (selector) => selector === '#priceTable' ? priceTable : null,
    addEventListener() {},
  },
  Intl,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/holiday-calendar.js'), 'utf8'), context);
vm.runInContext(source + '\nrenderPriceTable(); globalThis.fallbackData = { ROOMS, GALLERY, HOLIDAY_CALENDAR_AVAILABLE, holidayHTML: holidayCalendarHTML() };', context);
const { ROOMS, GALLERY, HOLIDAY_CALENDAR_AVAILABLE, holidayHTML } = context.fallbackData;
if (!HOLIDAY_CALENDAR_AVAILABLE) throw new Error('Invalid holiday calendar. Check dates, kinds and overlapping ranges.');
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

const rooms = `          <div class="fallback-content">
            <p>Để đặt phòng, vui lòng <a href="tel:0778888525">gọi 077 888 8525</a> hoặc <a href="https://zalo.me/0778888525">nhắn Zalo</a>.</p>
            <div class="room-grid">
${ROOMS.map((r) => `              <article class="room">
                <div class="room__media"><img src="assets/img/rooms/${escape(r.images[0])}.jpg" alt="${escape(r.name)}" loading="lazy" /></div>
                <div class="room__body">
                  <h3 class="room__name">${escape(r.name)}</h3>
                  <p class="room__rooms">Phòng ${escape(r.code)}</p>
                  <p class="room__desc">${escape(r.desc)}</p>
                  <dl class="room__meta"><div><dt>Diện tích</dt><dd>${escape(r.area)} m²</dd></div><div><dt>Giường</dt><dd>${escape(r.bed)}</dd></div><div><dt>Sức chứa</dt><dd>${escape(r.capacity)}</dd></div></dl>
                </div>
              </article>`).join('\n')}
            </div>
          </div>`;
const prices = `            <table class="price-table fallback-content">${priceTable.innerHTML}</table>`;
const holidays = `              <div class="fallback-content">${holidayHTML}</div>`;
const gallery = `          <div class="gallery__grid fallback-content">
${GALLERY.map((item) => `            <a class="gallery__item" href="assets/img/rooms/${escape(item.img)}.jpg" aria-label="Xem ảnh: ${escape(item.cap)}"><img src="assets/img/rooms/${escape(item.img)}.jpg" alt="${escape(item.cap)}" loading="lazy" /><span>${escape(item.cap)}</span></a>`).join('\n')}
          </div>`;

const original = fs.readFileSync(htmlPath, 'utf8');
let updated = original;
for (const [name, content] of Object.entries({ rooms, prices, gallery, holidays })) {
  const pattern = new RegExp(`( *<!-- fallback-${name}:start -->)\\n[\\s\\S]*?( *<!-- fallback-${name}:end -->)`);
  if (!pattern.test(updated)) throw new Error(`Missing fallback markers: ${name}`);
  updated = updated.replace(pattern, (_, start, end) => `${start}\n${content}\n${end}`);
}
if (process.argv.includes('--check')) {
  if (updated !== original) {
    console.error('No-JavaScript fallback is out of date. Run node scripts/update-fallback.js');
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(htmlPath, updated);
}
