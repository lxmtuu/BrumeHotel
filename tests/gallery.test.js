const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/app.js'), 'utf8');
const grid = { innerHTML: '' };
const document = {
  querySelector: (selector) => selector === '#galleryGrid' ? grid : null,
  addEventListener() {},
};
const context = { document, Intl };
vm.createContext(context);
vm.runInContext(source + '\nrenderGallery(); globalThis.gallery = GALLERY;', context);

test('gallery renders every real photo with its matching lightbox index and caption', () => {
  assert.equal(context.gallery.length, 9);
  context.gallery.forEach((item, i) => {
    assert.ok(fs.existsSync(path.join(root, 'assets/img/rooms', item.img + '.jpg')));
    const button = grid.innerHTML.match(new RegExp(`<button class="gallery__item"[^>]*data-lightbox="${i}"[\\s\\S]*?</button>`));
    assert.ok(button, `missing button ${i}`);
    assert.ok(button[0].includes(`assets/img/rooms/${item.img}.jpg`));
    assert.ok(button[0].includes(`<span>${item.cap}</span>`));
    assert.ok(button[0].includes(`aria-label="Xem ảnh: ${item.cap}"`));
  });
});

test('static gallery fallback uses the same photos and order', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const fallback = html.split('<!-- fallback-gallery:start -->')[1].split('<!-- fallback-gallery:end -->')[0];
  let previous = -1;
  for (const item of context.gallery) {
    const index = fallback.indexOf(`href="assets/img/rooms/${item.img}.jpg"`);
    assert.ok(index > previous, `fallback image ${item.img} is missing or out of order`);
    assert.ok(fallback.includes(`<span>${item.cap}</span>`));
    previous = index;
  }
});
