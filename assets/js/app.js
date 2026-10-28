/* =========================================================
   Brume Hotel Đà Lạt — dữ liệu phòng & tương tác
   Nguồn: bảng giá và mô tả phòng từ Google Sites của khách sạn
   ========================================================= */

const HOTEL = {
  phone: "0778888525",
  phoneLabel: "077 888 8525",
  zalo: "https://zalo.me/0778888525",
  facebook: "https://www.facebook.com/profile.php?id=61588141471436",
  maps:
    "https://www.google.com/maps/dir/?api=1&destination=Brume+Dalat+Hotel+Central,+44+H%E1%BB%93+T%C3%B9ng+M%E1%BA%ADu,+%C4%90%C3%A0+L%E1%BA%A1t",
};

const SEASONS = {
  low: { label: "Thấp điểm", a: "CN–T5", b: "T6–T7" },
  high: { label: "Cao điểm", a: "CN–T5", b: "T6–T7" },
  peak: { label: "Lễ & Tết", a: "Lễ", b: "Tết" },
};

/* prices: [ngày thường / lễ, cuối tuần / Tết] */
const ROOMS = [
  {
    slug: "double",
    name: "Double Room",
    code: "G07, 109",
    desc: "Phòng 2 khách có cửa sổ nhỏ thoáng mát.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 6 tuổi",
    tags: ["double", "window"],
    badges: ["Cửa sổ"],
    prices: { low: [400000, 500000], high: [650000, 750000], peak: [850000, 1200000] },
    images: ["double-2", "double-1", "double-4", "double-3"],
  },
  {
    slug: "superior",
    name: "Superior Double",
    code: "G02, G04, G06, 104, 106, 108",
    desc: "Phòng 2 khách không cửa sổ.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 6 tuổi",
    tags: ["double"],
    badges: ["Không cửa sổ"],
    prices: { low: [450000, 550000], high: [700000, 800000], peak: [900000, 1350000] },
    images: ["superior-1", "superior-3", "superior-2", "superior-4"],
  },
  {
    slug: "deluxe-window",
    name: "Deluxe Double with Window",
    code: "G08, 110",
    desc: "Phòng 2 khách có cửa sổ lớn thoáng mát.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 6 tuổi",
    tags: ["double", "window"],
    badges: ["Cửa sổ lớn"],
    prices: { low: [500000, 600000], high: [900000, 1000000], peak: [1250000, 1900000] },
    images: ["deluxe-window-2", "deluxe-window-1", "deluxe-window-4", "deluxe-window-3"],
  },
  {
    slug: "bathtub",
    name: "Deluxe Double with Bathtub",
    code: "202, 204",
    desc: "Phòng 2 khách có cửa sổ thoáng mát, bồn tắm.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 6 tuổi",
    tags: ["double", "window", "bathtub"],
    badges: ["Bồn tắm", "Cửa sổ"],
    prices: { low: [600000, 700000], high: [1100000, 1250000], peak: [1600000, 2400000] },
    images: ["bathtub-1", "bathtub-2", "bathtub-3", "bathtub-4"],
  },
  {
    slug: "balcony",
    name: "Deluxe Double with Balcony",
    code: "101",
    desc: "Phòng 2 khách có ban công, hướng đường phố.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 6 tuổi",
    tags: ["double", "balcony", "street"],
    badges: ["Ban công", "Hướng phố"],
    prices: { low: [700000, 800000], high: [1150000, 1300000], peak: [1650000, 2600000] },
    images: ["balcony-2", "balcony-1", "balcony-3", "balcony-4"],
  },
  {
    slug: "garden-suite",
    name: "Deluxe Suite – Garden View",
    code: "206",
    desc: "Phòng 2 khách có ban công hướng vườn, bồn tắm.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 6 tuổi",
    tags: ["double", "suite", "balcony", "garden", "bathtub"],
    badges: ["Hướng vườn", "Bồn tắm"],
    prices: { low: [750000, 850000], high: [1200000, 1400000], peak: [1750000, 2700000] },
    images: ["garden-suite-2", "garden-suite-1", "garden-suite-3", "garden-suite-4"],
  },
  {
    slug: "suite-balcony",
    name: "Deluxe Suite with Balcony",
    code: "201",
    desc: "Phòng hạng sang có ban công hướng đường phố.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 6 tuổi",
    tags: ["double", "suite", "balcony", "street"],
    badges: ["Hạng sang", "Hướng phố"],
    prices: { low: [750000, 850000], high: [1250000, 1450000], peak: [1800000, 2800000] },
    images: ["suite-balcony-1", "suite-balcony-2", "suite-balcony-4", "suite-balcony-3"],
  },
  {
    slug: "family-window",
    name: "Family Room with Window",
    code: "103, 105, 107, G05, G01, G03",
    desc: "Phòng gia đình có cửa sổ thoáng mát.",
    bed: "2 giường đôi 1m8",
    capacity: "4 người lớn + 2 trẻ em dưới 6 tuổi",
    tags: ["family", "window"],
    badges: ["Gia đình", "Cửa sổ"],
    prices: { low: [800000, 900000], high: [1300000, 1500000], peak: [1900000, 3200000] },
    images: ["family-window-1", "family-window-2", "family-window-3", "family-window-4"],
  },
  {
    slug: "family-garden",
    name: "Family Room – Garden View",
    code: "203, 205",
    desc: "Phòng gia đình có ban công rộng hướng vườn.",
    bed: "2 giường đôi 1m8",
    capacity: "4 người lớn + 2 trẻ em dưới 6 tuổi",
    tags: ["family", "balcony", "garden"],
    badges: ["Gia đình", "Hướng vườn"],
    prices: { low: [850000, 950000], high: [1400000, 1600000], peak: [2000000, 3400000] },
    images: ["family-garden-3", "family-garden-1", "family-garden-4", "family-garden-2"],
  },
  {
    slug: "family-balcony",
    name: "Family Room with Balcony",
    code: "102",
    desc: "Phòng gia đình có ban công, hướng đường phố.",
    bed: "2 giường đôi 1m8",
    capacity: "4 người lớn + 2 trẻ em dưới 6 tuổi",
    tags: ["family", "balcony", "street"],
    badges: ["Gia đình", "Hướng phố"],
    prices: { low: [900000, 1000000], high: [1500000, 1700000], peak: [2100000, 3600000] },
    images: ["family-balcony-2", "family-balcony-3", "family-balcony-1", "family-balcony-4"],
  },
];

const GALLERY = [
  { img: "suite-balcony-1", cap: "Deluxe Suite with Balcony (201)" },
  { img: "family-garden-3", cap: "Family Room – Garden View (203, 205)" },
  { img: "bathtub-2", cap: "Deluxe Double with Bathtub (202, 204)" },
  { img: "superior-3", cap: "Superior Double (G02, G04, G06…)" },
  { img: "family-garden-2", cap: "Bồn tắm bên cửa sổ nhìn vườn thông" },
  { img: "family-window-1", cap: "Family Room with Window (103, 105…)" },
  { img: "deluxe-window-2", cap: "Deluxe Double with Window (G08, 110)" },
  { img: "garden-suite-1", cap: "Deluxe Suite – Garden View (206)" },
  { img: "double-2", cap: "Double Room (G07, 109)" },
];

const imgPath = (name) => `assets/img/rooms/${name}.jpg`;
const vnd = (n) => `${new Intl.NumberFormat("vi-VN").format(n)}₫`;

let currentSeason = "low";
let currentFilter = "all";

/* ---------- Helpers ---------- */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const roomBySlug = (slug) => ROOMS.find((r) => r.slug === slug);

function lockScroll(on) {
  document.body.classList.toggle("is-locked", on);
}

/* ---------- Render room cards ---------- */

function cardHTML(room) {
  const season = SEASONS[currentSeason];
  const [a, b] = room.prices[currentSeason];
  const tags = room.tags.map((t) => `data-${t}="1"`).join(" ");

  return `
    <article class="room reveal" data-slug="${room.slug}" ${tags}>
      <div class="room__media">
        <img src="${imgPath(room.images[0])}" alt="${room.name} tại Brume Hotel Đà Lạt — ${room.desc}"
             loading="lazy" decoding="async" />
        <div class="room__badges">
          ${room.badges.map((b) => `<span class="room__badge">${b}</span>`).join("")}
        </div>
        <button class="room__expand" type="button" data-detail="${room.slug}" aria-label="Xem ảnh và chi tiết ${room.name}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>
          ${room.images.length} ảnh
        </button>
      </div>
      <div class="room__body">
        <h3 class="room__name">${room.name}</h3>
        <p class="room__rooms">Phòng ${room.code}</p>
        <p class="room__desc">${room.desc}</p>
        <dl class="room__meta">
          <div><dt>Giường</dt><dd>${room.bed}</dd></div>
          <div><dt>Sức chứa</dt><dd>${room.capacity}</dd></div>
        </dl>
        <div class="room__foot">
          <div class="price">
            <span class="price__label">${season.label} · ${season.a}</span>
            <span class="price__value">${vnd(a)}</span>
            <span class="price__unit">/đêm</span>
            <span class="price__sub">${season.b}: ${vnd(b)}/đêm</span>
          </div>
          <div class="room__cta">
            <button class="btn btn--ghost" type="button" data-detail="${room.slug}">Chi tiết</button>
            <button class="btn btn--solid" type="button" data-book="${room.slug}">Đặt</button>
          </div>
        </div>
      </div>
    </article>`;
}

function renderRooms() {
  $("#roomGrid").innerHTML = ROOMS.map(cardHTML).join("");
  applyFilter(currentFilter);
  observeReveals();
}

function updatePrices() {
  const season = SEASONS[currentSeason];
  ROOMS.forEach((room) => {
    const card = $(`.room[data-slug="${room.slug}"]`);
    if (!card) return;
    const [a, b] = room.prices[currentSeason];
    $(".price__label", card).textContent = `${season.label} · ${season.a}`;
    $(".price__value", card).textContent = vnd(a);
    $(".price__sub", card).textContent = `${season.b}: ${vnd(b)}/đêm`;
  });
}

function applyFilter(filter) {
  currentFilter = filter;
  let visible = 0;
  $$(".room").forEach((card) => {
    const show = filter === "all" || card.dataset[filter] === "1";
    card.classList.toggle("is-hidden", !show);
    if (show) visible++;
  });
  $("#roomsEmpty").hidden = visible > 0;
  $$("#filters .chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.filter === filter);
  });
}

/* ---------- Price table ---------- */

function renderPriceTable() {
  const head = `
    <thead>
      <tr>
        <th rowspan="2" scope="col">Hạng phòng</th>
        <th rowspan="2" scope="col">Số phòng</th>
        <th colspan="2" scope="colgroup" class="col-sep">Thấp điểm</th>
        <th colspan="2" scope="colgroup" class="col-sep">Cao điểm</th>
        <th colspan="2" scope="colgroup" class="col-sep">Lễ &amp; Tết</th>
      </tr>
      <tr>
        <th class="col-sep">CN–T5</th><th>T6–T7</th>
        <th class="col-sep">CN–T5</th><th>T6–T7</th>
        <th class="col-sep">Lễ</th><th>Tết</th>
      </tr>
    </thead>`;

  const body = ROOMS.map((room) => {
    const cells = ["low", "high", "peak"]
      .flatMap((s, i) =>
        room.prices[s].map(
          (p, j) => `<td class="${j === 0 ? "col-sep" : ""}">${vnd(p)}</td>`
        )
      )
      .join("");
    return `
      <tr>
        <th scope="row">${room.name}<span class="room-code">${room.code}</span></th>
        <td>${room.code.split(",").length} phòng</td>
        ${cells}
      </tr>`;
  }).join("");

  $("#priceTable").innerHTML = `<caption class="visually-hidden">Bảng giá 10 hạng phòng theo mùa</caption>${head}<tbody>${body}</tbody>`;
}

/* ---------- Gallery ---------- */

function renderGallery() {
  $("#galleryGrid").innerHTML = GALLERY.map(
    (item, i) => `
      <button class="gallery__item" type="button" data-lightbox="${i}" aria-label="Xem ảnh: ${item.cap}">
        <img src="${imgPath(item.img)}" alt="${item.cap}" loading="lazy" decoding="async" />
        <span>${item.cap}</span>
      </button>`
  ).join("");
}

/* ---------- Season / filter controls ---------- */

function initControls() {
  $$(".season__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.season === currentSeason) return;
      currentSeason = btn.dataset.season;
      $$(".season__btn").forEach((b) => b.classList.toggle("is-active", b === btn));
      updatePrices();
    });
  });

  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) applyFilter(chip.dataset.filter);
  });
}

/* ---------- Room detail modal ---------- */

const roomModal = $("#roomModal");
let lastFocused = null;

function openModal(el) {
  lastFocused = document.activeElement;
  el.hidden = false;
  lockScroll(true);
  const focusable = el.querySelector("button, a, input, select, textarea");
  if (focusable) focusable.focus({ preventScroll: true });
}

function closeModal(el) {
  el.hidden = true;
  if (!$$(".modal:not([hidden])").length && !$(".lightbox:not([hidden])")) lockScroll(false);
  if (lastFocused) lastFocused.focus({ preventScroll: true });
}

function roomSheetHTML(room) {
  return `
    <div class="room-sheet">
      <div class="room-sheet__media">
        <div class="room-sheet__main">
          <img id="roomMainImg" src="${imgPath(room.images[0])}" alt="${room.name} — ảnh 1" />
        </div>
        <div class="room-sheet__thumbs">
          ${room.images
            .map(
              (img, i) => `
            <button class="room-sheet__thumb ${i === 0 ? "is-active" : ""}" type="button"
                    data-img="${img}" data-alt="${room.name} — ảnh ${i + 1}" aria-label="Ảnh ${i + 1}">
              <img src="${imgPath(img)}" alt="" loading="lazy" />
            </button>`
            )
            .join("")}
        </div>
        <p class="room-sheet__note">Ảnh thật tại Brume Hotel Đà Lạt</p>
      </div>
      <div class="room-sheet__info">
        <p class="eyebrow">Hạng phòng</p>
        <h2 class="room-sheet__name" id="roomTitle">${room.name}</h2>
        <p class="room-sheet__code">Phòng ${room.code}</p>
        <p class="room-sheet__desc">${room.desc}</p>
        <ul class="spec-list">
          <li><span>Giường</span><strong>${room.bed}</strong></li>
          <li><span>Sức chứa</span><strong>${room.capacity}</strong></li>
          <li><span>Số phòng</span><strong>${room.code.split(",").length} phòng</strong></li>
        </ul>
        <table class="mini-table">
          <thead>
            <tr><th scope="col">Mùa</th><th scope="col">Ngày thường</th><th scope="col">Cuối tuần</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Thấp điểm</th><td>${vnd(room.prices.low[0])}</td><td>${vnd(room.prices.low[1])}</td></tr>
            <tr><th scope="row">Cao điểm</th><td>${vnd(room.prices.high[0])}</td><td>${vnd(room.prices.high[1])}</td></tr>
            <tr><th scope="row">Lễ &amp; Tết</th><td>${vnd(room.prices.peak[0])}<br /><span class="cap">Lễ</span></td><td>${vnd(room.prices.peak[1])}<br /><span class="cap">Tết</span></td></tr>
          </tbody>
        </table>
        <div class="room-sheet__actions">
          <button class="btn btn--solid" type="button" data-book="${room.slug}">Đặt phòng này</button>
          <a class="btn btn--ghost" href="tel:${HOTEL.phone}">Gọi ${HOTEL.phoneLabel}</a>
        </div>
      </div>
    </div>`;
}

function openRoom(slug) {
  const room = roomBySlug(slug);
  if (!room) return;
  $("#roomBody").innerHTML = roomSheetHTML(room);
  openModal(roomModal);

  $$(".room-sheet__thumb", roomModal).forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const main = $("#roomMainImg");
      main.src = imgPath(thumb.dataset.img);
      main.alt = thumb.dataset.alt;
      $$(".room-sheet__thumb", roomModal).forEach((t) => t.classList.toggle("is-active", t === thumb));
    });
  });
}

/* ---------- Booking modal ---------- */

const bookModal = $("#bookModal");
const requestForm = $("#requestForm");

function fillRoomSelect() {
  const options = ROOMS.map((r) => `<option value="${r.slug}">${r.name}</option>`).join("");
  const placeholder = `<option value="">Chưa chọn / nhờ tư vấn</option>`;
  $("#rtype").innerHTML = placeholder + options;
  $("#rRoom").innerHTML = placeholder + options;
}

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function initDates() {
  ["#ci", "#rCi"].forEach((sel) => {
    const input = $(sel);
    input.min = todayISO();
    if (!input.value) input.value = todayISO(1);
  });
  ["#co", "#rCo"].forEach((sel) => {
    const input = $(sel);
    input.min = todayISO(1);
    if (!input.value) input.value = todayISO(3);
  });
}

function openBooking(prefill = {}) {
  requestForm.hidden = false;
  $("#requestResult").hidden = true;
  $("#copyBtn").textContent = "Sao chép";

  if (prefill.checkin) $("#rCi").value = prefill.checkin;
  if (prefill.checkout) $("#rCo").value = prefill.checkout;
  if (prefill.guests) $("#rGuests").value = prefill.guests;
  if (prefill.room) $("#rRoom").value = prefill.room;
  syncCheckoutMin("#rCi", "#rCo");

  openModal(bookModal);
  setTimeout(() => $("#rName").focus({ preventScroll: true }), 120);
}

function syncCheckoutMin(ciSel, coSel) {
  const ci = $(ciSel).value;
  const co = $(coSel);
  if (ci) {
    const min = new Date(ci);
    min.setDate(min.getDate() + 1);
    const minISO = min.toISOString().slice(0, 10);
    co.min = minISO;
    if (co.value && co.value < minISO) co.value = minISO;
  }
}

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function buildMessage() {
  const name = $("#rName").value.trim();
  const phone = $("#rPhone").value.trim();
  const ci = $("#rCi").value;
  const co = $("#rCo").value;
  const guests = $("#rGuests").value;
  const roomValue = $("#rRoom").value;
  const room = roomValue ? roomBySlug(roomValue) : null;
  const note = $("#rNote").value.trim();

  const nights = ci && co ? Math.round((new Date(co) - new Date(ci)) / 86400000) : 0;
  const lines = [
    "Xin chào Brume Hotel, mình muốn đặt phòng:",
    `• Hạng phòng: ${room ? room.name : "nhờ Brume tư vấn"}`,
    `• Nhận phòng: ${fmtDate(ci)}`,
    `• Trả phòng: ${fmtDate(co)}${nights > 0 ? ` (${nights} đêm)` : ""}`,
    `• Số khách: ${guests}`,
    `• Tên: ${name}`,
    `• Điện thoại: ${phone}`,
  ];
  if (note) lines.push(`• Ghi chú: ${note}`);
  lines.push("", "Nhờ Brume kiểm tra phòng trống và báo giá giúp mình. Cảm ơn!");
  return lines.join("\n");
}

function initRequestForm() {
  requestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ci = $("#rCi");
    const co = $("#rCo");

    if (!requestForm.reportValidity()) return;

    if (ci.value && co.value && co.value <= ci.value) {
      co.setCustomValidity("Ngày trả phòng phải sau ngày nhận phòng.");
      co.reportValidity();
      return;
    }
    co.setCustomValidity("");

    $("#requestText").textContent = buildMessage();
    requestForm.hidden = true;
    $("#requestResult").hidden = false;
    $("#copyBtn").focus({ preventScroll: true });
  });

  ["#rCi", "#rCo"].forEach((sel) => {
    $(sel).addEventListener("change", () => syncCheckoutMin("#rCi", "#rCo"));
  });

  $("#copyBtn").addEventListener("click", async () => {
    const text = $("#requestText").textContent;
    try {
      await navigator.clipboard.writeText(text);
      $("#copyBtn").textContent = "Đã sao chép ✓";
    } catch {
      const range = document.createRange();
      range.selectNodeContents($("#requestText"));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      $("#copyBtn").textContent = "Chọn & Ctrl+C để chép";
    }
  });

  $("#backBtn").addEventListener("click", () => {
    $("#requestResult").hidden = true;
    requestForm.hidden = false;
  });
}

/* ---------- Lightbox ---------- */

const lightbox = $("#lightbox");
let lightboxIndex = 0;

function openLightbox(index) {
  lightboxIndex = (index + GALLERY.length) % GALLERY.length;
  const item = GALLERY[lightboxIndex];
  const img = $("#lightboxImg");
  img.src = imgPath(item.img);
  img.alt = item.cap;
  $("#lightboxCap").textContent = `${item.cap} · ${lightboxIndex + 1}/${GALLERY.length}`;
  lightbox.hidden = false;
  lockScroll(true);
}

function stepLightbox(dir) {
  openLightbox(lightboxIndex + dir);
}

/* ---------- Global events ---------- */

function initGlobalEvents() {
  document.addEventListener("click", (e) => {
    const detail = e.target.closest("[data-detail]");
    if (detail) {
      openRoom(detail.dataset.detail);
      return;
    }

    const book = e.target.closest("[data-book]");
    if (book) {
      if (book.closest("#roomModal")) closeModal(roomModal);
      openBooking({ room: book.dataset.book });
      return;
    }

    const openBook = e.target.closest("[data-open-book]");
    if (openBook) {
      const openModalEl = $(".modal:not([hidden])");
      if (openModalEl) closeModal(openModalEl);
      openBooking();
      return;
    }

    const galleryItem = e.target.closest("[data-lightbox]");
    if (galleryItem) {
      openLightbox(Number(galleryItem.dataset.lightbox));
      return;
    }

    if (e.target.closest("[data-prev]")) return stepLightbox(-1);
    if (e.target.closest("[data-next]")) return stepLightbox(1);

    if (e.target.closest("[data-close]")) {
      const modal = e.target.closest(".modal");
      if (modal) return closeModal(modal);
      if (e.target.closest(".lightbox")) {
        lightbox.hidden = true;
        if (!$(".modal:not([hidden])")) lockScroll(false);
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModalEl = $(".modal:not([hidden])");
      if (openModalEl) closeModal(openModalEl);
      if (!lightbox.hidden) {
        lightbox.hidden = true;
        if (!openModalEl) lockScroll(false);
      }
      closeNav();
    }

    if (!lightbox.hidden) {
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    }
  });
}

/* ---------- Header / nav ---------- */

function initHeader() {
  const siteTop = $("#siteTop");
  const onScroll = () => {
    siteTop.classList.toggle("is-stuck", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  $("#burger").addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
    const open = document.body.classList.contains("nav-open");
    $("#nav").classList.toggle("is-open", open);
    $("#burger").setAttribute("aria-expanded", String(open));
    $("#burger").setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  });

  $$("#nav a").forEach((a) => a.addEventListener("click", closeNav));
}

function closeNav() {
  document.body.classList.remove("nav-open");
  $("#nav").classList.remove("is-open");
  $("#burger").setAttribute("aria-expanded", "false");
}

/* ---------- Booking bar ---------- */

function initBookBar() {
  const form = $("#bookForm");
  syncCheckoutMin("#ci", "#co");
  $("#ci").addEventListener("change", () => syncCheckoutMin("#ci", "#co"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!$("#ci").value || !$("#co").value) {
      form.reportValidity();
      return;
    }
    if ($("#co").value <= $("#ci").value) {
      $("#co").setCustomValidity("Ngày trả phòng phải sau ngày nhận phòng.");
      $("#co").reportValidity();
      return;
    }
    $("#co").setCustomValidity("");
    openBooking({
      checkin: $("#ci").value,
      checkout: $("#co").value,
      guests: $("#guests").value,
      room: $("#rtype").value || "",
    });
  });
}

/* ---------- Reveal on scroll ---------- */

let revealObserver;

function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
  }
  $$(".reveal:not(.is-in)").forEach((el) => revealObserver.observe(el));
}

/* ---------- Init ---------- */

function init() {
  $("#year").textContent = new Date().getFullYear();
  initDates();
  renderRooms();
  renderPriceTable();
  fillRoomSelect();
  renderGallery();
  initControls();
  initRequestForm();
  initGlobalEvents();
  initHeader();
  initBookBar();
  observeReveals();
}

document.addEventListener("DOMContentLoaded", init);
