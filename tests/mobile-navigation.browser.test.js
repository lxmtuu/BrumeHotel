// Runs without npm dependencies when Chromium is available. Set CHROME_BIN to
// the browser executable if it is not on PATH, then run `node --test tests/*.test.js`.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn, spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const pages = [
  'index.html', 'gioi-thieu.html', 'phong.html', 'bang-gia.html',
  'khong-gian.html', 'vi-tri.html', 'dat-phong.html',
];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findBrowser() {
  if (process.env.CHROME_BIN) return process.env.CHROME_BIN;
  for (const name of ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable']) {
    const result = spawnSync('which', [name], { encoding: 'utf8' });
    if (result.status === 0) return result.stdout.trim();
  }
  return null;
}

async function openBrowser(t, executable) {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'brume-menu-test-'));
  const args = [
    '--headless', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    '--disable-background-networking', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank',
  ];
  const child = spawn(executable, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let socket;
  t.after(async () => {
    if (socket) socket.close();
    if (child.pid && child.exitCode === null && child.signalCode === null) {
      const exited = new Promise((resolve) => child.once('exit', resolve));
      const forceKill = setTimeout(() => child.kill('SIGKILL'), 2000);
      forceKill.unref();
      child.kill('SIGTERM');
      await exited;
      clearTimeout(forceKill);
    }
    await fs.promises.rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });

  let log = '';
  const url = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Chromium did not start: ${log}`)), 10000);
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Chromium exited (${code}): ${log}`)); });
    child.stderr.on('data', (data) => {
      log += data;
      const match = log.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });

  socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(`${request.method}: ${message.error.message}`));
    else request.resolve(message.result);
  });
  socket.addEventListener('close', () => {
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(new Error(`Browser disconnected during ${request.method}`));
    }
    pending.clear();
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timed out: ${method}`));
      }, 10000);
      pending.set(id, { resolve, reject, timer, method });
      try {
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      } catch (error) {
        clearTimeout(timer);
        pending.delete(id);
        reject(error);
      }
    });
  }

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Target.activateTarget', { targetId });

  async function evaluate(fn, ...args) {
    const expression = `(${fn.toString()})(${args.map((arg) => JSON.stringify(arg)).join(',')})`;
    const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, sessionId);
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
    return response.result.value;
  }

  async function viewport(width, height, mobile = true) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, mobile, deviceScaleFactor: 1 }, sessionId);
    await send('Emulation.setTouchEmulationEnabled', { enabled: mobile }, sessionId);
  }

  async function load(page) {
    await send('Page.navigate', { url: pathToFileURL(path.join(root, page)).href }, sessionId);
    const deadline = Date.now() + 10000;
    while (Date.now() < deadline) {
      try {
        if (await evaluate((name) => location.pathname.endsWith('/' + name) &&
          document.body && document.body.classList.contains('js-ready'), page)) {
          await evaluate(async () => { await document.fonts.ready; });
          return;
        }
      } catch {
        // The execution context is replaced while the page navigates.
      }
      await sleep(50);
    }
    throw new Error(`Page did not initialize: ${page}`);
  }

  return { evaluate, viewport, load, send, sessionId };
}

const executable = findBrowser();
const skip = !executable ? 'Chromium not found; set CHROME_BIN to run this test' :
  typeof WebSocket !== 'function' ? 'Node.js with a built-in WebSocket is required' : false;

test('mobile menu covers the viewport before and after scrolling, including on short screens', { skip, timeout: 60000 }, async (t) => {
  const browser = await openBrowser(t, executable);
  const { evaluate, viewport, load } = browser;

  async function openAt(scrollTop) {
    return evaluate(async (top) => {
      window.scrollTo({ top, behavior: 'instant' });
      await new Promise((resolve) => setTimeout(resolve, 100));
      const before = window.scrollY;
      const button = document.querySelector('#burger');
      button.click();
      await new Promise(requestAnimationFrame);
      const nav = document.querySelector('#nav');
      const rect = nav.getBoundingClientRect();
      return {
        before, scrollY: window.scrollY, stuck: document.querySelector('.site-top').classList.contains('is-stuck'),
        width: innerWidth, height: innerHeight, navWidth: rect.width, navHeight: rect.height,
        siteTransform: getComputedStyle(document.querySelector('.site-top')).transform,
        siteFilter: getComputedStyle(document.querySelector('.site-top')).backdropFilter,
        headerFilter: getComputedStyle(document.querySelector('.header')).backdropFilter,
        expanded: button.getAttribute('aria-expanded'),
      };
    }, scrollTop);
  }

  function assertOpen(state, label) {
    assert.equal(state.navWidth, state.width, `${label}: menu width`);
    assert.equal(state.navHeight, state.height, `${label}: menu height`);
    assert.equal(state.siteTransform, 'none', `${label}: header transform`);
    assert.equal(state.siteFilter, 'none', `${label}: header container filter`);
    assert.equal(state.headerFilter, 'none', `${label}: sticky header filter`);
    assert.equal(state.expanded, 'true', `${label}: aria-expanded`);
    assert.equal(state.scrollY, state.before, `${label}: page scroll position`);
  }

  async function assertSettled(label) {
    // Wait for the menu's opening animation, allowing for slower CI machines.
    const deadline = Date.now() + 3000;
    let state;
    do {
      await sleep(50);
      state = await evaluate(() => {
        const nav = document.querySelector('#nav');
        const rect = nav.getBoundingClientRect();
        const hit = document.elementFromPoint(5, innerHeight - 5);
        return { top: rect.top, opacity: getComputedStyle(nav).opacity,
          visible: getComputedStyle(nav).visibility, coversBottom: nav.contains(hit) || hit === nav };
      });
    } while ((Math.abs(state.top) > 0.5 || state.opacity !== '1') && Date.now() < deadline);
    assert.ok(Math.abs(state.top) <= 0.5, `${label}: menu top`);
    assert.equal(state.opacity, '1', `${label}: menu opacity`);
    assert.equal(state.visible, 'visible', `${label}: menu visibility`);
    assert.equal(state.coversBottom, true, `${label}: menu covers page content`);
  }

  await viewport(390, 844);
  for (const page of pages) {
    await load(page);
    const state = await openAt(1400);
    assert.equal(state.stuck, true, `${page}: header should be sticky`);
    assertOpen(state, page);
    await assertSettled(page);
    const links = await evaluate(() => [...document.querySelectorAll('#nav > a')].map((link) => {
      const r = link.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return r.top >= 0 && r.bottom <= innerHeight && (hit === link || link.contains(hit));
    }));
    assert.deepEqual(links, [true, true, true, true, true, true], `${page}: page links should be usable`);
  }

  for (const [width, height] of [[320, 568], [375, 400], [760, 700], [761, 700], [960, 700]]) {
    await viewport(width, height);
    await load('phong.html');
    let state = await openAt(0);
    assertOpen(state, `${width}x${height} at top`);
    await assertSettled(`${width}x${height} at top`);
    await evaluate(() => document.querySelector('#burger').click());
    await sleep(500);
    state = await openAt(1400);
    assertOpen(state, `${width}x${height} after scroll`);
    await assertSettled(`${width}x${height} after scroll`);

    if (height === 400) {
      const before = await evaluate(() => ({ page: scrollY, menu: document.querySelector('#nav').scrollTop }));
      await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 330, id: 1 }] }, browser.sessionId);
      for (const y of [310, 280, 240, 200, 160, 120, 80]) {
        await browser.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y, id: 1 }] }, browser.sessionId);
        await sleep(30);
      }
      await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, browser.sessionId);
      await sleep(300);
      const after = await evaluate(() => ({ page: scrollY, menu: document.querySelector('#nav').scrollTop }));
      assert.ok(after.menu > before.menu, 'touch swipe should scroll the short menu');
      assert.equal(after.page, before.page, 'touch swipe should not scroll the page behind the menu');
    }

    const scrolling = await evaluate(async () => {
      const nav = document.querySelector('#nav');
      const last = nav.querySelector('.nav__foot a:last-child');
      last.scrollIntoView({ block: 'end', behavior: 'instant' });
      await new Promise(requestAnimationFrame);
      const r = last.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { scrollable: nav.scrollHeight > nav.clientHeight, scrollTop: nav.scrollTop,
        lastReachable: hit === last || last.contains(hit) };
    });
    assert.equal(scrolling.lastReachable, true, `${width}x${height}: final contact link`);
    if (height === 400) {
      assert.equal(scrolling.scrollable, true, 'short menu should scroll');
      assert.ok(scrolling.scrollTop > 0, 'short menu should reach its lower links');
    }

    const reopened = await evaluate(async () => {
      const nav = document.querySelector('#nav');
      const button = document.querySelector('#burger');
      const previousY = scrollY;
      button.click();
      await new Promise(requestAnimationFrame);
      button.click(); // Reopen while the sticky header may still be transitioning.
      await new Promise(requestAnimationFrame);
      return { scrollTop: nav.scrollTop, height: nav.getBoundingClientRect().height,
        viewportHeight: innerHeight, filter: getComputedStyle(document.querySelector('.header')).backdropFilter,
        scrollY, previousY, expanded: button.getAttribute('aria-expanded') };
    });
    assert.equal(reopened.scrollTop, 0, `${width}x${height}: reopening resets menu scroll`);
    assert.equal(reopened.height, reopened.viewportHeight, `${width}x${height}: rapid reopen height`);
    assert.equal(reopened.filter, 'none', `${width}x${height}: rapid reopen filter`);
    assert.equal(reopened.scrollY, reopened.previousY, `${width}x${height}: page position`);
    assert.equal(reopened.expanded, 'true');
    const closed = await evaluate(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return { expanded: document.querySelector('#burger').getAttribute('aria-expanded'),
        focus: document.activeElement.id, open: document.body.classList.contains('nav-open') };
    });
    assert.deepEqual(closed, { expanded: 'false', focus: 'burger', open: false });
  }

  await viewport(390, 844);
  await browser.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, browser.sessionId);
  await load('phong.html');
  assertOpen(await openAt(1400), 'reduced motion');
  await assertSettled('reduced motion');
  await browser.send('Emulation.setEmulatedMedia', { features: [] }, browser.sessionId);

  await load('phong.html');
  assertOpen(await openAt(1400), 'navigation');
  await assertSettled('navigation');
  const point = await evaluate(() => {
    const r = document.querySelector('#nav a[href="bang-gia.html"]').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  await browser.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...point, id: 1 }] }, browser.sessionId);
  await browser.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, browser.sessionId);
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try { if (await evaluate(() => location.pathname.endsWith('/bang-gia.html'))) break; } catch {}
    await sleep(50);
  }
  assert.equal(await evaluate(() => location.pathname.endsWith('/bang-gia.html')), true, 'page link navigates');

  await viewport(1024, 768, false);
  await load('phong.html');
  await evaluate(() => window.scrollTo({ top: 1400, behavior: 'instant' }));
  await sleep(600);
  const desktop = await evaluate(() => ({
    burger: getComputedStyle(document.querySelector('#burger')).display,
    nav: getComputedStyle(document.querySelector('#nav')).visibility,
    filter: getComputedStyle(document.querySelector('.header')).backdropFilter,
  }));
  assert.deepEqual(desktop, { burger: 'none', nav: 'visible', filter: 'blur(14px)' });
});
