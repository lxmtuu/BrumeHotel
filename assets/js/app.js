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
  // Điểm nhận dữ liệu đặt phòng tự động (Google Sheets Script / Webhook Telegram / Formspree / Supabase)
  bookingEndpoint:
    "https://script.google.com/macros/s/AKfycbzKNXFNw4kKtBCzoAJBhyUHPcEI6DK572534qX6-Iotmq0H-FAfJBe4ZbWF3hZRDzsC/exec",
};

const SEASONS = {
  low: { label: "Thấp điểm", a: "Ngày thường (CN–T5)", b: "Cuối tuần (T6–T7)" },
  high: { label: "Cao điểm", a: "Ngày thường (CN–T5)", b: "Cuối tuần (T6–T7)" },
  peak: { label: "Lễ & Tết", a: "Lễ", b: "Tết" },
};

// Nếu thiếu hoặc sai cấu hình, không suy đoán ngày Lễ/Tết và luôn yêu cầu xác nhận.
const validatedCalendar = validateHolidayCalendar(globalThis.BRUME_HOLIDAYS);
const HOLIDAY_CALENDAR_AVAILABLE = validatedCalendar !== null;
const PEAK_DATES = validatedCalendar || [];

/* prices: [ngày thường / lễ, cuối tuần / Tết] */
const ROOMS = [
  {
    slug: "double",
    area: 18,
    name: "Double Room",
    code: "G07, 109",
    desc: "Phòng 2 khách có cửa sổ nhỏ thoáng mát.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 12 tuổi",
    adultCapacity: 2,
    childCapacity: 1,
    tags: ["double", "window"],
    badges: ["Cửa sổ"],
    prices: { low: [400000, 500000], high: [650000, 750000], peak: [850000, 1200000] },
    images: ["double-2", "double-1", "double-4", "double-3"],
  },
  {
    slug: "superior",
    area: 20,
    name: "Superior Double",
    code: "G02, G04, G06, 104, 106, 108",
    desc: "Phòng 2 khách không cửa sổ.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 12 tuổi",
    adultCapacity: 2,
    childCapacity: 1,
    tags: ["double"],
    badges: ["Không cửa sổ"],
    prices: { low: [450000, 550000], high: [700000, 800000], peak: [900000, 1350000] },
    images: ["superior-1", "superior-3", "superior-2", "superior-4"],
  },
  {
    slug: "deluxe-window",
    area: 20,
    name: "Deluxe Double with Window",
    code: "G08, 110",
    desc: "Phòng 2 khách có cửa sổ lớn thoáng mát.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 12 tuổi",
    adultCapacity: 2,
    childCapacity: 1,
    tags: ["double", "window"],
    badges: ["Cửa sổ lớn"],
    prices: { low: [500000, 600000], high: [900000, 1000000], peak: [1250000, 1900000] },
    images: ["deluxe-window-2", "deluxe-window-1", "deluxe-window-4", "deluxe-window-3"],
  },
  {
    slug: "bathtub",
    area: 25,
    name: "Deluxe Double with Bathtub",
    code: "202, 204",
    desc: "Phòng 2 khách có cửa sổ thoáng mát, bồn tắm.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 12 tuổi",
    adultCapacity: 2,
    childCapacity: 1,
    tags: ["double", "window", "bathtub"],
    badges: ["Bồn tắm", "Cửa sổ"],
    prices: { low: [600000, 700000], high: [1100000, 1250000], peak: [1600000, 2400000] },
    images: ["bathtub-1", "bathtub-2", "bathtub-3", "bathtub-4"],
  },
  {
    slug: "balcony",
    area: 25,
    name: "Deluxe Double with Balcony",
    code: "101",
    desc: "Phòng 2 khách có ban công hướng đường phố và bồn tắm.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 12 tuổi",
    adultCapacity: 2,
    childCapacity: 1,
    tags: ["double", "balcony", "street", "bathtub"],
    badges: ["Ban công", "Hướng phố", "Bồn tắm"],
    prices: { low: [700000, 800000], high: [1150000, 1300000], peak: [1650000, 2600000] },
    images: ["balcony-2", "balcony-1", "balcony-3", "balcony-4"],
  },
  {
    slug: "garden-suite",
    area: 50,
    name: "Deluxe Suite – Garden View",
    code: "206",
    desc: "Phòng 2 khách có ban công hướng vườn, bồn tắm.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 12 tuổi",
    adultCapacity: 2,
    childCapacity: 1,
    tags: ["double", "suite", "balcony", "garden", "bathtub"],
    badges: ["Hướng vườn", "Bồn tắm"],
    prices: { low: [750000, 850000], high: [1200000, 1400000], peak: [1750000, 2700000] },
    images: ["garden-suite-2", "garden-suite-1", "garden-suite-3", "garden-suite-4"],
  },
  {
    slug: "suite-balcony",
    area: 50,
    name: "Deluxe Suite with Balcony",
    code: "201",
    desc: "Phòng hạng sang có ban công hướng đường phố.",
    bed: "1 giường đôi 1m8",
    capacity: "2 người lớn + 1 trẻ em dưới 12 tuổi",
    adultCapacity: 2,
    childCapacity: 1,
    tags: ["double", "suite", "balcony", "street"],
    badges: ["Hạng sang", "Hướng phố"],
    prices: { low: [750000, 850000], high: [1250000, 1450000], peak: [1800000, 2800000] },
    images: ["suite-balcony-1", "suite-balcony-2", "suite-balcony-4", "suite-balcony-3"],
  },
  {
    slug: "family-window",
    area: 28,
    name: "Family Room with Window",
    code: "103, 105, 107, G05, G01, G03",
    desc: "Phòng gia đình có cửa sổ thoáng mát.",
    bed: "2 giường đôi 1m8",
    capacity: "4 người lớn + 2 trẻ em dưới 12 tuổi",
    adultCapacity: 4,
    childCapacity: 2,
    tags: ["family", "window"],
    badges: ["Gia đình", "Cửa sổ"],
    prices: { low: [800000, 900000], high: [1300000, 1500000], peak: [1900000, 3200000] },
    images: ["family-window-1", "family-window-2", "family-window-3", "family-window-4"],
  },
  {
    slug: "family-garden",
    area: 30,
    name: "Family Room – Garden View",
    code: "203, 205",
    desc: "Phòng gia đình có ban công rộng hướng vườn.",
    bed: "2 giường đôi 1m8",
    capacity: "4 người lớn + 2 trẻ em dưới 12 tuổi",
    adultCapacity: 4,
    childCapacity: 2,
    tags: ["family", "balcony", "garden"],
    badges: ["Gia đình", "Hướng vườn"],
    prices: { low: [850000, 950000], high: [1400000, 1600000], peak: [2000000, 3400000] },
    images: ["family-garden-3", "family-garden-1", "family-garden-4", "family-garden-2"],
  },
  {
    slug: "family-balcony",
    area: 30,
    name: "Family Room with Balcony",
    code: "102",
    desc: "Phòng gia đình có ban công, hướng đường phố.",
    bed: "2 giường đôi 1m8",
    capacity: "4 người lớn + 2 trẻ em dưới 12 tuổi",
    adultCapacity: 4,
    childCapacity: 2,
    tags: ["family", "balcony", "street"],
    badges: ["Gia đình", "Hướng phố"],
    prices: { low: [900000, 1000000], high: [1500000, 1700000], peak: [2100000, 3600000] },
    images: ["family-balcony-2", "family-balcony-3", "family-balcony-1", "family-balcony-4"],
  },
];

const GALLERY = [
  { img: "suite-balcony-1", cap: "Deluxe Suite with Balcony (201)" },
  { img: "superior-3", cap: "Superior Double (G02, G04, G06…)" },
  { img: "family-garden-2", cap: "Bồn tắm bên cửa sổ nhìn vườn thông" },
  { img: "family-garden-3", cap: "Family Room – Garden View (203, 205)" },
  { img: "bathtub-2", cap: "Deluxe Double with Bathtub (202, 204)" },
  { img: "family-window-1", cap: "Family Room with Window (103, 105…)" },
  { img: "deluxe-window-2", cap: "Deluxe Double with Window (G08, 110)" },
  { img: "garden-suite-1", cap: "Deluxe Suite – Garden View (206)" },
  { img: "double-2", cap: "Double Room (G07, 109)" },
];

const imgPath = (name) => `assets/img/rooms/${name}.jpg`;
const vnd = (n) => `${new Intl.NumberFormat("vi-VN").format(n)}₫`;

let currentSeason = "low";
let currentPeakKind = null;
let currentPriceDay = null;
let currentPriceTentative = false;
let currentFilter = "all";

/* ---------- Helpers ---------- */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const roomBySlug = (slug) => ROOMS.find((r) => r.slug === slug);

function lockScroll(on) {
  document.body.classList.toggle("is-locked", on);
}

/* ---------- Render room cards ---------- */

function roomPriceDisplay(room) {
  const season = SEASONS[currentSeason];
  const [a, b] = room.prices[currentSeason];
  // Giá Lễ/Tết được ưu tiên hơn thứ trong tuần.
  const second = currentSeason === "peak"
    ? currentPeakKind === "tet"
    : currentPriceDay === 5 || currentPriceDay === 6;
  return {
    label: `${season.label} · ${second ? season.b : season.a}${currentPriceTentative ? " · Dự kiến" : ""}`,
    value: second ? b : a,
    otherLabel: second ? season.a : season.b,
    otherValue: second ? a : b,
  };
}

function cardHTML(room) {
  const price = roomPriceDisplay(room);
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
          <div><dt>Diện tích</dt><dd>${room.area} m²</dd></div>
          <div><dt>Giường</dt><dd>${room.bed}</dd></div>
          <div><dt>Sức chứa</dt><dd>${room.capacity}</dd></div>
        </dl>
        <div class="room__foot">
          <div class="price">
            <span class="price__label">${price.label}</span>
            <span class="price__value">${vnd(price.value)}</span>
            <span class="price__unit">/đêm</span>
            <span class="price__sub">${price.otherLabel}: ${vnd(price.otherValue)}/đêm</span>
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
  const grid = $("#roomGrid");
  if (!grid) return;
  grid.innerHTML = ROOMS.map(cardHTML).join("");
  applyFilter(currentFilter);
  observeReveals();
}

function updatePrices() {
  ROOMS.forEach((room) => {
    const card = $(`.room[data-slug="${room.slug}"]`);
    if (!card) return;
    const price = roomPriceDisplay(room);
    const label = $(".price__label", card);
    if (label) label.textContent = price.label;
    const val = $(".price__value", card);
    if (val) val.textContent = vnd(price.value);
    const sub = $(".price__sub", card);
    if (sub) sub.textContent = `${price.otherLabel}: ${vnd(price.otherValue)}/đêm`;
  });
}

function applyFilter(filter) {
  currentFilter = filter;
  let visible = 0;
  const grid = $("#roomGrid");
  if (!grid) return;
  $$(".room", grid).forEach((card) => {
    const show = filter === "all" || card.dataset[filter] === "1";
    card.classList.toggle("is-hidden", !show);
    if (show) visible++;
  });
  const empty = $("#roomsEmpty");
  if (empty) empty.hidden = visible > 0;
  $$("#filters .chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.filter === filter);
  });
}

/* ---------- Price table ---------- */

function renderPriceTable() {
  const table = $("#priceTable");
  if (!table) return;
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
        <th class="col-sep" scope="col">Ngày thường<span>CN–T5</span></th><th scope="col">Cuối tuần<span>T6–T7</span></th>
        <th class="col-sep" scope="col">Ngày thường<span>CN–T5</span></th><th scope="col">Cuối tuần<span>T6–T7</span></th>
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

  table.innerHTML = `<caption class="visually-hidden">Bảng giá 10 hạng phòng theo mùa</caption>${head}<tbody>${body}</tbody>`;
}

/* ---------- Gallery ---------- */

function renderGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;
  grid.innerHTML = GALLERY.map(
    (item, i) => `
      <button class="gallery__item" type="button" data-lightbox="${i}" aria-label="Xem ảnh: ${item.cap}">
        <img src="${imgPath(item.img)}" alt="${item.cap}" loading="lazy" decoding="async" />
        <span>${item.cap}</span>
      </button>`
  ).join("");
}

/* ---------- Season / filter controls ---------- */

function selectSeason(season, peakKind = null, dayOfWeek = null, tentative = false) {
  currentSeason = season;
  currentPeakKind = peakKind;
  currentPriceDay = dayOfWeek;
  currentPriceTentative = tentative;
  $$(".season__btn").forEach((btn) => {
    const active = btn.dataset.season === season;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  updatePrices();
}

function initControls() {
  $$(".season__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectSeason(btn.dataset.season);
      const status = $("#seasonStatus");
      if (status) {
        status.textContent = `Đang xem ${SEASONS[currentSeason].label.toLowerCase()} thủ công, không đối chiếu theo ngày. Chọn lại ngày để tự động cập nhật.`;
        status.classList.add("is-unconfirmed");
      }
    });
  });

  const filters = $("#filters");
  if (filters) {
    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (chip) applyFilter(chip.dataset.filter);
    });
  }
}

/* ---------- Room detail modal ---------- */

const roomModal = $("#roomModal");
let lastFocused = null;

function focusableElements(root) {
  return $$("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])", root)
    .filter((el) => el.getClientRects().length > 0);
}

function trapFocus(event, root) {
  const items = focusableElements(root);
  if (!items.length) {
    event.preventDefault();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
}

function openModal(el) {
  lastFocused = document.activeElement;
  el.hidden = false;
  lockScroll(true);
  const focusable = focusableElements(el)[0];
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
          <button class="room-sheet__nav room-sheet__nav--prev" type="button" aria-label="Xem ảnh trước">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="room-sheet__nav room-sheet__nav--next" type="button" aria-label="Xem ảnh sau">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <span class="room-sheet__counter" id="roomImgCounter">1 / ${room.images.length}</span>
        </div>
        <div class="room-sheet__thumbs">
          ${room.images
            .map(
              (img, i) => `
            <button class="room-sheet__thumb ${i === 0 ? "is-active" : ""}" type="button"
                    data-img="${img}" data-index="${i}" data-alt="${room.name} — ảnh ${i + 1}" aria-label="Ảnh ${i + 1}">
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
          <li><span class="spec-label"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M9 21V9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Diện tích</span><strong>${room.area} m²</strong></li>
          <li><span class="spec-label"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Giường</span><strong>${room.bed}</strong></li>
          <li><span class="spec-label"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Sức chứa</span><strong>${room.capacity}</strong></li>
          <li><span class="spec-label"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="7.5" cy="15.5" r="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m10.5 12.5 8-8M15 8l3 3M18.5 4.5l1 1" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Số phòng</span><strong>${room.code.split(",").length} phòng</strong></li>
        </ul>
        <table class="mini-table">
          <thead>
            <tr><th scope="col">Mùa giá</th><th scope="col">Ngày thường <span class="cap">CN–T5</span></th><th scope="col">Cuối tuần <span class="cap">T6–T7</span></th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Thấp điểm</th><td>${vnd(room.prices.low[0])}</td><td>${vnd(room.prices.low[1])}</td></tr>
            <tr><th scope="row">Cao điểm</th><td>${vnd(room.prices.high[0])}</td><td>${vnd(room.prices.high[1])}</td></tr>
            <tr><th scope="row">Lễ</th><td colspan="2">${vnd(room.prices.peak[0])} · giá riêng</td></tr>
            <tr><th scope="row">Tết</th><td colspan="2">${vnd(room.prices.peak[1])} · giá riêng</td></tr>
          </tbody>
        </table>
        <div class="room-sheet__actions">
          <button class="btn btn--solid" type="button" data-book="${room.slug}">Đặt phòng này</button>
          <a class="btn btn--ghost" href="tel:${HOTEL.phone}">Gọi ${HOTEL.phoneLabel}</a>
          <a class="btn btn--ghost" href="https://zalo.me/0778888525" target="_blank" rel="noopener">Nhắn Zalo</a>
        </div>
      </div>
    </div>`;
}

let currentRoomSlug = null;
let currentRoomImgIndex = 0;

function showRoomImage(index) {
  const room = roomBySlug(currentRoomSlug);
  if (!room) return;
  const count = room.images.length;
  currentRoomImgIndex = (index + count) % count;
  const imgName = room.images[currentRoomImgIndex];
  const main = $("#roomMainImg");
  if (main) {
    main.src = imgPath(imgName);
    main.alt = `${room.name} — ảnh ${currentRoomImgIndex + 1}`;
  }
  const counter = $("#roomImgCounter");
  if (counter) {
    counter.textContent = `${currentRoomImgIndex + 1} / ${count}`;
  }
  const modal = $("#roomModal") || roomModal;
  if (modal) {
    $$(".room-sheet__thumb", modal).forEach((t, i) => {
      t.classList.toggle("is-active", i === currentRoomImgIndex);
    });
  }
}

function openRoom(slug) {
  const room = roomBySlug(slug);
  if (!room) return;
  currentRoomSlug = slug;
  currentRoomImgIndex = 0;
  const body = $("#roomBody");
  if (body) body.innerHTML = roomSheetHTML(room);
  const modal = $("#roomModal") || roomModal;
  if (modal) {
    openModal(modal);
    $$(".room-sheet__thumb", modal).forEach((thumb, i) => {
      thumb.addEventListener("click", () => {
        showRoomImage(i);
      });
    });
    const prevBtn = $(".room-sheet__nav--prev", modal);
    if (prevBtn) {
      prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showRoomImage(currentRoomImgIndex - 1);
      });
    }
    const nextBtn = $(".room-sheet__nav--next", modal);
    if (nextBtn) {
      nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showRoomImage(currentRoomImgIndex + 1);
      });
    }
    const mainMedia = $(".room-sheet__main", modal);
    if (mainMedia) {
      let touchStartX = 0;
      mainMedia.addEventListener(
        "touchstart",
        (e) => {
          if (e.changedTouches && e.changedTouches[0]) {
            touchStartX = e.changedTouches[0].screenX;
          }
        },
        { passive: true }
      );
      mainMedia.addEventListener(
        "touchend",
        (e) => {
          if (e.changedTouches && e.changedTouches[0]) {
            const diff = e.changedTouches[0].screenX - touchStartX;
            if (diff < -35) {
              showRoomImage(currentRoomImgIndex + 1);
            } else if (diff > 35) {
              showRoomImage(currentRoomImgIndex - 1);
            }
          }
        },
        { passive: true }
      );
    }
  }
}

/* ---------- Booking modal ---------- */

const bookModal = $("#bookModal");
const requestForm = $("#requestForm");

function fillRoomSelect() {
  const options = ROOMS.map((r) => `<option value="${r.slug}">${r.name}</option>`).join("");
  const placeholder = `<option value="">Chưa chọn / nhờ tư vấn</option>`;
  ["#rtype", "#rRoom"].forEach((sel) => {
    const el = $(sel);
    if (el) el.innerHTML = placeholder + options;
  });
}

function renderChildAges() {
  const container = $("#childAges");
  if (!container) return;
  const previous = { young: [], older: [] };
  $$("select[data-child-age]", container).forEach((select) => {
    if (previous[select.dataset.childGroup]) {
      previous[select.dataset.childGroup].push(select.value);
    }
  });
  const rYoung = $("#rChildrenYoung");
  const rOlder = $("#rChildrenOlder");
  const groups = [
    { key: "young", label: "dưới 6 tuổi", start: 0, count: (rYoung ? Number(rYoung.value) : 0) || 0 },
    { key: "older", label: "từ 6 đến dưới 12 tuổi", start: 6, count: (rOlder ? Number(rOlder.value) : 0) || 0 },
  ];
  groups.forEach((group) => { group.count = Math.max(0, Math.min(6, group.count)); });
  container.hidden = groups.every((group) => group.count === 0);
  if (groups.every((group) => previous[group.key].length === group.count)) return;

  const fields = groups.map((group) => {
    const options = `<option value="">Chọn tuổi</option>` + Array.from({ length: 6 }, (_, i) => {
      const age = group.start + i;
      return `<option value="${age}">${age === 0 ? "Dưới 1 tuổi" : `${age} tuổi`}</option>`;
    }).join("");
    return Array.from({ length: group.count }, (_, i) => `
      <div class="field">
        <label for="childAge-${group.key}-${i + 1}">Bé ${i + 1} ${group.label}</label>
        <select id="childAge-${group.key}-${i + 1}" name="childAge-${group.key}-${i + 1}" data-child-age data-child-group="${group.key}" required>${options}</select>
      </div>`).join("");
  }).join("");
  container.innerHTML = `
    <p class="child-ages__title">Độ tuổi của trẻ</p>
    <p class="child-ages__hint">Trẻ dưới 6 tuổi không phụ thu; trẻ trên 6 tuổi có phụ thu. Với trẻ đúng 6 tuổi, vui lòng xác nhận với Brume.</p>
    <div class="child-ages__grid">${fields}</div>`;
  const index = { young: 0, older: 0 };
  $$("select[data-child-age]", container).forEach((select) => {
    const key = select.dataset.childGroup;
    select.value = previous[key][index[key]++] || "";
  });
}

function guestCapacityWarning(room, adults, children) {
  if (!room || (adults <= room.adultCapacity && children <= room.childCapacity)) return "";
  return `Số khách vượt sức chứa niêm yết của ${room.name} (${room.capacity}). Brume sẽ tư vấn phương án phù hợp khi xác nhận.`;
}

function updateGuestWarnings() {
  const rRoom = $("#rRoom");
  const room = rRoom ? roomBySlug(rRoom.value) : null;
  const rYoung = $("#rChildrenYoung");
  const rOlder = $("#rChildrenOlder");
  const rAdults = $("#rAdults");
  const children = (rYoung ? Number(rYoung.value) : 0) + (rOlder ? Number(rOlder.value) : 0);
  const adults = rAdults ? Number(rAdults.value) : 2;
  const warning = guestCapacityWarning(room, adults, children);
  ["#bookGuestWarning", "#requestGuestWarning"].forEach((selector) => {
    const el = $(selector);
    if (!el) return;
    el.textContent = warning;
    el.hidden = !warning;
  });
  $$(".room").forEach((card) => {
    const cardRoom = roomBySlug(card.dataset.slug);
    const cardWarn = cardRoom ? guestCapacityWarning(cardRoom, adults, children) : null;
    const warnEl = $(".room__warning", card);
    if (warnEl) {
      warnEl.hidden = !cardWarn;
      warnEl.textContent = cardWarn || "";
    }
  });
}

function syncGuestCounts(fromModal = false) {
  const source = fromModal ? ["#rAdults", "#rChildrenYoung", "#rChildrenOlder"] : ["#adults", "#childrenYoung", "#childrenOlder"];
  const target = fromModal ? ["#adults", "#childrenYoung", "#childrenOlder"] : ["#rAdults", "#rChildrenYoung", "#rChildrenOlder"];
  source.forEach((selector, i) => {
    const srcEl = $(selector);
    const tgtEl = $(target[i]);
    if (srcEl && tgtEl) tgtEl.value = srcEl.value;
  });
  renderChildAges();
  updateGuestWarnings();
}

function syncRoomChoice(fromModal = false) {
  const source = fromModal ? "#rRoom" : "#rtype";
  const target = fromModal ? "#rtype" : "#rRoom";
  const srcEl = $(source);
  const tgtEl = $(target);
  if (srcEl && tgtEl) tgtEl.value = srcEl.value;
  updateGuestWarnings();
}

const VEHICLE_HINTS = {
  car: {
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14v-5l-2-6H7L5 12v5Z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7.5" cy="16.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="16.5" r="1.5" fill="currentColor"/><path d="M7 12h10" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    text: "<strong>Khách đi ô tô:</strong> Khách sạn tại 44 Hồ Tùng Mậu có hỗ trợ tư vấn chỗ đỗ và hướng dẫn bãi gửi xe an toàn (có bảo vệ) gần khách sạn. Lễ tân sẽ liên hệ sắp xếp và hướng dẫn đường đi thuận tiện nhất cho bạn trước khi đến.",
  },
  motorbike: {
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="17.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18.5" cy="17.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 6h3m-6 5.5 3-5.5h-4l-3 6.5H5.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    text: "<strong>Khách đi xe máy:</strong> Khách sạn có khu vực để xe máy an toàn, miễn phí có mái che dành riêng cho khách lưu trú.",
  },
  rent_bike: {
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5.5" cy="17.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18.5" cy="17.5" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M15 6h3m-6 5.5 3-5.5h-4l-3 6.5H5.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    text: "<strong>Cần thuê xe máy tại Đà Lạt:</strong> Brume hỗ trợ kết nối xe máy (xe ga & xe số đời mới) giao nhận tận sảnh khách sạn với giá ưu đãi, kèm mũ bảo hiểm.",
  },
  transit: {
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7.5" cy="14.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="14.5" r="1.5" fill="currentColor"/><path d="M3 10h18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`,
    text: "<strong>Khách đi máy bay / xe khách:</strong> Khách sạn nhận gửi hành lý miễn phí nếu bạn đến sớm trước 14:00, đồng thời hỗ trợ tư vấn xe đưa đón sân bay Liên Khương và xe trung chuyển bến xe.",
  },
};

function syncVehicleHint() {
  const vEl = $("#rVehicle");
  const hintEl = $("#vehicleHint");
  if (!hintEl) return;
  const val = vEl ? vEl.value : "";
  const info = VEHICLE_HINTS[val];
  if (info) {
    hintEl.innerHTML = `${info.icon}<div>${info.text}</div>`;
    hintEl.hidden = false;
  } else {
    hintEl.hidden = true;
    hintEl.innerHTML = "";
  }
}

function initGuestFields() {
  ["#adults", "#childrenYoung", "#childrenOlder"].forEach((selector) => {
    const el = $(selector);
    if (el) el.addEventListener("change", () => syncGuestCounts());
  });
  ["#rAdults", "#rChildrenYoung", "#rChildrenOlder"].forEach((selector) => {
    const el = $(selector);
    if (el) el.addEventListener("change", () => syncGuestCounts(true));
  });
  const rtype = $("#rtype");
  if (rtype) rtype.addEventListener("change", () => syncRoomChoice());
  const rRoom = $("#rRoom");
  if (rRoom) rRoom.addEventListener("change", () => syncRoomChoice(true));
  const rVehicle = $("#rVehicle");
  if (rVehicle) {
    rVehicle.addEventListener("change", syncVehicleHint);
  }
  syncGuestCounts();
  syncVehicleHint();
}

// Ngày đặt phòng được tính theo lịch tại khách sạn, không theo múi giờ của khách.
function todayISO(offset = 0) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type).value;
  return addDaysISO(`${part("year")}-${part("month")}-${part("day")}`, offset);
}

function addDaysISO(iso, days) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isISODate(iso) {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === iso;
}

function validateHolidayCalendar(ranges) {
  if (!Array.isArray(ranges)) return null;
  if (!ranges.every((range) => range && isISODate(range.from) && isISODate(range.to) &&
      range.from <= range.to && ["holiday", "tet"].includes(range.kind))) return null;
  const sorted = [...ranges].sort((a, b) => a.from.localeCompare(b.from));
  if (sorted.some((range, i) => i > 0 && range.from <= sorted[i - 1].to)) return null;
  return sorted;
}

function seasonForDate(iso) {
  if (!isISODate(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  const peak = PEAK_DATES.find((range) => iso >= range.from && iso <= range.to);
  if (peak) return { season: "peak", kind: peak.kind };
  return { season: [1, 6, 7, 8, 12].includes(date.getUTCMonth() + 1) ? "high" : "low", kind: null };
}

function stayHasMultiplePeriods(checkin, checkout) {
  if (!seasonForDate(checkin) || !seasonForDate(checkout) || checkout <= checkin) return false;
  const nights = (new Date(`${checkout}T00:00:00Z`) - new Date(`${checkin}T00:00:00Z`)) / 86400000;
  // Bất kỳ kỳ nghỉ dài hơn một năm đều đi qua cả mùa thấp và cao điểm.
  if (nights > 370) return true;
  const first = seasonForDate(checkin);
  for (let i = 1; i < nights; i++) {
    const day = seasonForDate(addDaysISO(checkin, i));
    if (day.season !== first.season || day.kind !== first.kind) return true;
  }
  return false;
}

// Lịch chỉ xác nhận các khoảng đã liệt kê, không suy ra những ngày khác là ngày thường.
function holidayCalendarCovers(checkin, lastNight) {
  let next = checkin;
  for (const range of PEAK_DATES) {
    if (range.to < next) continue;
    if (range.from > next) return false;
    if (range.to >= lastNight) return true;
    next = addDaysISO(range.to, 1);
  }
  return false;
}

function updateSeasonFromDates(checkin, checkout) {
  const period = seasonForDate(checkin);
  if (!period || checkin < todayISO()) {
    selectSeason(currentSeason);
    const message = "Chọn ngày nhận phòng hợp lệ để tự động xem mùa giá.";
    ["#bookSeason", "#requestSeason", "#seasonStatus"].forEach((selector) => {
      const el = $(selector);
      el.textContent = message;
      el.classList.remove("is-unconfirmed");
    });
    return;
  }

  const dayOfWeek = new Date(`${checkin}T00:00:00Z`).getUTCDay();
  const label = period.kind === "tet" ? "Tết" : period.kind === "holiday" ? "Lễ" : SEASONS[period.season].label;
  const rateLabel = period.season === "peak" ? label : `${label} · ${dayOfWeek === 5 || dayOfWeek === 6 ? SEASONS[period.season].b : SEASONS[period.season].a}`;
  const multiple = stayHasMultiplePeriods(checkin, checkout);
  const lastNight = seasonForDate(checkout) && checkout > checkin ? addDaysISO(checkout, -1) : checkin;
  const needsConfirmation = !holidayCalendarCovers(checkin, lastNight);
  const warning = needsConfirmation
    ? "Chưa có lịch lễ/Tết đầy đủ cho kỳ nghỉ này. Giá theo mùa và thứ chỉ mang tính dự kiến; vui lòng xác nhận với Brume."
    : "Giá và tình trạng phòng cần được Brume xác nhận.";
  const detail = multiple
    ? "Kỳ nghỉ có nhiều mùa hoặc mức Lễ/Tết; giá cần được xác nhận theo từng đêm."
    : "Giá hiển thị theo đêm nhận phòng; các đêm khác có thể khác, vui lòng xác nhận với Brume.";
  const message = `Ngày nhận ${fmtDate(checkin)}: ${rateLabel}. ${detail} ${warning}`;
  ["#bookSeason", "#requestSeason"].forEach((selector) => {
    const el = $(selector);
    el.textContent = message;
    el.classList.toggle("is-unconfirmed", needsConfirmation);
  });
  const status = $("#seasonStatus");
  status.textContent = `Tự chọn theo ngày nhận phòng: ${rateLabel}. ${detail} ${warning}`;
  status.classList.toggle("is-unconfirmed", needsConfirmation);
  selectSeason(period.season, period.kind, dayOfWeek, period.season !== "peak");
}

function syncBookingDates(ciSel, coSel, targetCiSel, targetCoSel) {
  const srcCi = $(ciSel);
  const srcCo = $(coSel);
  const tgtCi = $(targetCiSel);
  const tgtCo = $(targetCoSel);
  if (srcCi && tgtCi) {
    tgtCi.value = srcCi.value;
    tgtCi.min = todayISO();
  }
  if (srcCo && tgtCo) {
    tgtCo.value = srcCo.value;
  }
  if (tgtCi && tgtCo) {
    syncCheckoutMin(targetCiSel, targetCoSel, false);
  }
  if (srcCi && srcCo) {
    updateSeasonFromDates(srcCi.value, srcCo.value);
  }
}

function initDates() {
  ["#ci", "#rCi"].forEach((sel) => {
    const input = $(sel);
    if (!input) return;
    input.min = todayISO();
    if (!input.value) input.value = todayISO(1);
  });
  ["#co", "#rCo"].forEach((sel) => {
    const input = $(sel);
    if (!input) return;
    input.min = todayISO(1);
    if (!input.value) input.value = todayISO(3);
  });
}

function openBooking(prefill = {}) {
  const modal = $("#bookModal") || bookModal;
  const form = $("#requestForm") || requestForm;
  if (!modal) return;
  if (form) form.hidden = false;
  const res = $("#requestResult");
  if (res) res.hidden = true;
  const copy = $("#copyBtn");
  if (copy) copy.textContent = "Sao chép";

  if (prefill.checkin && $("#rCi")) $("#rCi").value = prefill.checkin;
  if (prefill.checkout && $("#rCo")) $("#rCo").value = prefill.checkout;
  if (prefill.adults && $("#rAdults")) $("#rAdults").value = prefill.adults;
  if (prefill.childrenYoung !== undefined && $("#rChildrenYoung")) $("#rChildrenYoung").value = prefill.childrenYoung;
  if (prefill.childrenOlder !== undefined && $("#rChildrenOlder")) $("#rChildrenOlder").value = prefill.childrenOlder;
  if (Object.prototype.hasOwnProperty.call(prefill, "room") && $("#rRoom")) $("#rRoom").value = prefill.room;
  if (prefill.vehicle && $("#rVehicle")) $("#rVehicle").value = prefill.vehicle;
  syncRoomChoice(true);
  syncGuestCounts(true);
  syncVehicleHint();
  const rCi = $("#rCi");
  if (rCi) rCi.min = todayISO();
  syncCheckoutMin("#rCi", "#rCo");
  syncBookingDates("#rCi", "#rCo", "#ci", "#co");

  openModal(modal);
  const nameInput = $("#rName");
  if (nameInput) nameInput.focus({ preventScroll: true });
}

function syncCheckoutMin(ciSel, coSel, adjustValue = true) {
  const ciEl = $(ciSel);
  const coEl = $(coSel);
  if (!ciEl || !coEl) return;
  const ci = ciEl.value;
  const minISO = ci ? addDaysISO(ci, 1) : todayISO(1);
  coEl.min = minISO;
  if (adjustValue && coEl.value && coEl.value < minISO) coEl.value = minISO;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function holidayCalendarHTML() {
  if (!PEAK_DATES.length) {
    return "<p>Chưa có lịch Lễ/Tết được xác nhận. Vui lòng liên hệ Brume để kiểm tra.</p>";
  }
  const formatRange = (range) => range.from === range.to
    ? fmtDate(range.from)
    : `${fmtDate(range.from)}–${fmtDate(range.to)}`;
  const rows = [["holiday", "Lễ"], ["tet", "Tết"]].map(([kind, label]) => {
    const dates = PEAK_DATES.filter((range) => range.kind === kind).map(formatRange);
    return dates.length ? `<p><strong>${label}:</strong> ${dates.join(", ")}.</p>` : "";
  }).join("");
  return `${rows}<p>Đây là các mốc Brume đã cung cấp, chưa phải lịch đầy đủ. Các ngày khác vui lòng xác nhận với Brume.</p>`;
}

function renderHolidayCalendar() {
  const summary = $("#holidayCalendarSummary");
  if (!summary) return;
  summary.innerHTML = holidayCalendarHTML();
}

function buildMessage() {
  const nameEl = $("#rName");
  const phoneEl = $("#rPhone");
  const ciEl = $("#rCi");
  const coEl = $("#rCo");
  const adultsEl = $("#rAdults");
  const youngEl = $("#rChildrenYoung");
  const olderEl = $("#rChildrenOlder");
  const rRoomEl = $("#rRoom");
  const noteEl = $("#rNote");

  const name = nameEl ? nameEl.value.trim() : "";
  const phone = phoneEl ? phoneEl.value.trim() : "";
  const ci = ciEl ? ciEl.value : "";
  const co = coEl ? coEl.value : "";
  const adults = adultsEl ? adultsEl.value : "2";
  const childrenYoung = youngEl ? youngEl.value : "0";
  const childrenOlder = olderEl ? olderEl.value : "0";
  const childAges = $$("#childAges select[data-child-age]");
  const roomValue = rRoomEl ? rRoomEl.value : "";
  const room = roomValue ? roomBySlug(roomValue) : null;
  const note = noteEl ? noteEl.value.trim() : "";

  const nights = ci && co ? Math.round((new Date(co) - new Date(ci)) / 86400000) : 0;
  const lines = [
    "Xin chào Brume Hotel, mình muốn đặt phòng:",
    `• Hạng phòng: ${room ? room.name : "nhờ Brume tư vấn"}`,
    `• Nhận phòng: ${fmtDate(ci)}`,
    `• Trả phòng: ${fmtDate(co)}${nights > 0 ? ` (${nights} đêm)` : ""}`,
    `• Người lớn (từ 12 tuổi): ${adults}`,
    `• Trẻ dưới 6 tuổi: ${childrenYoung}`,
    `• Trẻ từ 6 đến dưới 12 tuổi: ${childrenOlder}`,
  ];
  [["young", "dưới 6 tuổi"], ["older", "từ 6 đến dưới 12 tuổi"]].forEach(([group, label]) => {
    const ages = childAges.filter((select) => select.dataset.childGroup === group)
      .map((select) => select.value === "0" ? "dưới 1 tuổi" : `${select.value} tuổi`);
    if (ages.length) lines.push(`• Tuổi trẻ ${label}: ${ages.join(", ")}`);
  });
  const vehicleEl = $("#rVehicle");
  const vehicle = vehicleEl ? vehicleEl.value : "";
  const vehicleMap = {
    car: "Đi ô tô riêng (nhờ lễ tân tư vấn chỗ đỗ / bãi gửi xe)",
    motorbike: "Đi xe máy cá nhân (cần chỗ gửi xe tại khách sạn)",
    rent_bike: "Cần thuê xe máy tại khách sạn (giao xe tại khách sạn)",
    transit: "Đi máy bay / xe khách (nhờ tư vấn đón / gửi hành lý sớm)",
  };
  if (vehicle && vehicleMap[vehicle]) {
    lines.push(`• Phương tiện: ${vehicleMap[vehicle]}`);
  }
  lines.push(`• Tên: ${name}`, `• Điện thoại: ${phone}`);
  if (note) lines.push(`• Ghi chú: ${note}`);
  lines.push("", "Nhờ Brume kiểm tra phòng trống và báo giá giúp mình. Cảm ơn!");
  return lines.join("\n");
}

async function copyTextToClipboard(text) {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    if (typeof document !== "undefined" && document.createElement) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    }
  } catch {}
  return false;
}

function getBookingPayload() {
  const nameEl = $("#rName");
  const phoneEl = $("#rPhone");
  const ciEl = $("#rCi");
  const coEl = $("#rCo");
  const adultsEl = $("#rAdults");
  const youngEl = $("#rChildrenYoung");
  const olderEl = $("#rChildrenOlder");
  const rRoomEl = $("#rRoom");
  const noteEl = $("#rNote");
  const vehicleEl = $("#rVehicle");

  const name = nameEl ? nameEl.value.trim() : "";
  const phone = phoneEl ? phoneEl.value.trim() : "";
  const ci = ciEl ? ciEl.value : "";
  const co = coEl ? coEl.value : "";
  const adults = adultsEl ? adultsEl.value : "2";
  const childrenYoung = youngEl ? youngEl.value : "0";
  const childrenOlder = olderEl ? olderEl.value : "0";
  const childAges = $$("#childAges select[data-child-age]");
  const roomValue = rRoomEl ? rRoomEl.value : "";
  const room = roomValue ? roomBySlug(roomValue) : null;
  const note = noteEl ? noteEl.value.trim() : "";
  const vehicle = vehicleEl ? vehicleEl.value : "";
  const vehicleMap = {
    car: "Đi ô tô riêng (nhờ lễ tân tư vấn chỗ đỗ / bãi gửi xe)",
    motorbike: "Đi xe máy cá nhân (cần chỗ gửi xe tại khách sạn)",
    rent_bike: "Cần thuê xe máy tại khách sạn (giao xe tại khách sạn)",
    transit: "Đi máy bay / xe khách (nhờ tư vấn đón / gửi hành lý sớm)",
  };

  const nights = ci && co ? Math.round((new Date(co) - new Date(ci)) / 86400000) : 0;
  const agesYoung = childAges.filter((s) => s.dataset.childGroup === "young")
    .map((s) => s.value === "0" ? "dưới 1 tuổi" : `${s.value} tuổi`);
  const agesOlder = childAges.filter((s) => s.dataset.childGroup === "older")
    .map((s) => s.value === "0" ? "dưới 1 tuổi" : `${s.value} tuổi`);

  return {
    name,
    phone,
    checkin: fmtDate(ci),
    checkout: fmtDate(co),
    nights,
    room: room ? room.name : "Chưa chọn (nhờ Brume tư vấn)",
    adults: Number(adults) || 2,
    childrenYoung: Number(childrenYoung) || 0,
    childrenOlder: Number(childrenOlder) || 0,
    childAges: [...agesYoung, ...agesOlder].join(", ") || "Không có",
    vehicle: vehicleMap[vehicle] || "Không có phương tiện riêng",
    note: note || "Không có",
    fullMessage: buildMessage(),
    createdAt: new Date().toISOString(),
  };
}

function initRequestForm() {
  const form = $("#requestForm") || requestForm;
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const rCi = $("#rCi");
    if (rCi) rCi.min = todayISO();
    syncCheckoutMin("#rCi", "#rCo", false);
    if (!form.reportValidity()) return;

    const message = buildMessage();
    const reqText = $("#requestText");
    if (reqText) reqText.textContent = message;
    form.hidden = true;
    const reqRes = $("#requestResult");
    if (reqRes) reqRes.hidden = false;

    // Tự động sao chép thông tin vào bộ nhớ tạm
    copyTextToClipboard(message);

    // Cập nhật link SMS tự động điền sẵn 100% nội dung
    const smsBtn = $("#smsBtn");
    if (smsBtn) {
      smsBtn.href = `sms:${HOTEL.phone}?&body=${encodeURIComponent(message)}`;
    }

    // Nếu có cấu hình bookingEndpoint (Google Sheets / Email Webhook), tự động gửi ngầm về lễ tân
    if (HOTEL.bookingEndpoint) {
      try {
        fetch(HOTEL.bookingEndpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getBookingPayload()),
        });
        const statusEl = $("#requestStatus");
        if (statusEl) {
          statusEl.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Đã tự động gửi thông tin đặt phòng tới <strong>Email Lễ tân Brume Hotel</strong>! Lễ tân sẽ liên hệ xác nhận phòng cho bạn trong ít phút.</span>`;
        }
      } catch {}
    }

    // Tự động mở Zalo tới số điện thoại của Brume Hotel
    const zaloUrl = `https://zalo.me/${HOTEL.phone}`;
    try {
      if (typeof window !== "undefined" && typeof window.open === "function") {
        window.open(zaloUrl, "_blank", "noopener,noreferrer");
      }
    } catch {}

    const copy = $("#copyBtn");
    if (copy) {
      copy.textContent = "Sao chép lại";
      copy.focus({ preventScroll: true });
    }
  });

  const rCi = $("#rCi");
  if (rCi) {
    rCi.addEventListener("change", () => {
      syncCheckoutMin("#rCi", "#rCo");
      syncBookingDates("#rCi", "#rCo", "#ci", "#co");
    });
  }
  const rCo = $("#rCo");
  if (rCo) {
    rCo.addEventListener("change", () => syncBookingDates("#rCi", "#rCo", "#ci", "#co"));
  }

  const copy = $("#copyBtn");
  if (copy) {
    copy.addEventListener("click", async () => {
      const reqText = $("#requestText");
      const text = reqText ? reqText.textContent : "";
      const copied = await copyTextToClipboard(text);
      if (copied) {
        copy.textContent = "Đã sao chép ✓";
      } else if (reqText) {
        try {
          const range = document.createRange();
          range.selectNodeContents(reqText);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          copy.textContent = "Chọn & Ctrl+C để chép";
        } catch {
          copy.textContent = "Đã sao chép";
        }
      }
    });
  }

  const back = $("#backBtn");
  if (back) {
    back.addEventListener("click", () => {
      const reqRes = $("#requestResult");
      if (reqRes) reqRes.hidden = true;
      form.hidden = false;
    });
  }
}

/* ---------- Lightbox ---------- */

const lightbox = $("#lightbox");
let lightboxIndex = 0;
let lightboxOpener = null;

function openLightbox(index) {
  const lb = $("#lightbox") || lightbox;
  if (!lb) return;
  const opening = lb.hidden;
  if (opening) lightboxOpener = document.activeElement;
  lightboxIndex = (index + GALLERY.length) % GALLERY.length;
  const item = GALLERY[lightboxIndex];
  const img = $("#lightboxImg");
  if (img) {
    img.src = imgPath(item.img);
    img.alt = item.cap;
  }
  const cap = $("#lightboxCap");
  if (cap) cap.textContent = `${item.cap} · ${lightboxIndex + 1}/${GALLERY.length}`;
  lb.hidden = false;
  lockScroll(true);
  if (opening) {
    const first = focusableElements(lb)[0];
    if (first) first.focus({ preventScroll: true });
  }
}

function closeLightbox() {
  const lb = $("#lightbox") || lightbox;
  if (!lb) return;
  lb.hidden = true;
  if (!$(".modal:not([hidden])")) lockScroll(false);
  if (lightboxOpener) lightboxOpener.focus({ preventScroll: true });
  lightboxOpener = null;
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
      const rm = $("#roomModal") || roomModal;
      if (rm && book.closest("#roomModal")) closeModal(rm);
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
      if (e.target.closest(".lightbox")) closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    const lb = $("#lightbox") || lightbox;
    const openModalEl = $(".modal:not([hidden])");
    if (e.key === "Escape") {
      if (lb && !lb.hidden) closeLightbox();
      else if (openModalEl) closeModal(openModalEl);
      else if (document.body.classList.contains("nav-open")) {
        closeNav();
        const burger = $("#burger");
        if (burger) burger.focus();
      }
      return;
    }

    if (e.key === "Tab") {
      if (lb && !lb.hidden) trapFocus(e, lb);
      else if (openModalEl) trapFocus(e, openModalEl);
    }

    if (lb && !lb.hidden) {
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    } else {
      const rm = $("#roomModal") || roomModal;
      if (rm && !rm.hidden) {
        if (e.key === "ArrowLeft") showRoomImage(currentRoomImgIndex - 1);
        if (e.key === "ArrowRight") showRoomImage(currentRoomImgIndex + 1);
      }
    }
  });
}

/* ---------- Header / nav ---------- */

function initHeader() {
  const siteTop = $("#siteTop");
  if (siteTop) {
    const onScroll = () => {
      siteTop.classList.toggle("is-stuck", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const burger = $("#burger");
  if (burger) {
    burger.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
      const open = document.body.classList.contains("nav-open");
      const nav = $("#nav");
      if (nav) nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    });
  }

  $$("#nav a").forEach((a) => a.addEventListener("click", closeNav));

  const backToTop = $("#backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", () => {
      backToTop.hidden = window.scrollY < 260;
    }, { passive: true });
  }
}

function closeNav() {
  document.body.classList.remove("nav-open");
  const nav = $("#nav");
  if (nav) nav.classList.remove("is-open");
  const burger = $("#burger");
  if (burger) {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Mở menu");
  }
}

/* ---------- Booking bar ---------- */

function initBookBar() {
  const form = $("#bookForm");
  if (!form) return;
  syncCheckoutMin("#ci", "#co");
  syncBookingDates("#ci", "#co", "#rCi", "#rCo");
  const ci = $("#ci");
  if (ci) {
    ci.addEventListener("change", () => {
      syncCheckoutMin("#ci", "#co");
      syncBookingDates("#ci", "#co", "#rCi", "#rCo");
    });
  }
  const co = $("#co");
  if (co) {
    co.addEventListener("change", () => syncBookingDates("#ci", "#co", "#rCi", "#rCo"));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (ci) ci.min = todayISO();
    syncCheckoutMin("#ci", "#co", false);
    if (!form.reportValidity()) return;
    openBooking({
      checkin: ci ? ci.value : "",
      checkout: co ? co.value : "",
      adults: $("#adults") ? $("#adults").value : "2",
      childrenYoung: $("#childrenYoung") ? $("#childrenYoung").value : "0",
      childrenOlder: $("#childrenOlder") ? $("#childrenOlder").value : "0",
      room: $("#rtype") ? $("#rtype").value || "" : "",
    });
  });
}

/* ---------- Reveal on scroll ---------- */

let revealObserver;

function observeReveals() {
  if (!("IntersectionObserver" in window)) return;
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
  $$(".reveal:not(.is-in):not(.is-pending)").forEach((el) => {
    revealObserver.observe(el);
    el.classList.add("is-pending");
  });
}

/* ---------- Init ---------- */

function init() {
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
  initDates();
  renderRooms();
  renderPriceTable();
  renderHolidayCalendar();
  fillRoomSelect();
  initGuestFields();
  renderGallery();
  initControls();
  initRequestForm();
  initGlobalEvents();
  initHeader();
  initBookBar();
  observeReveals();
  // Ẩn nội dung dự phòng cả bằng thuộc tính HTML, tránh hiện trùng khi CSS bị lưu đệm cũ.
  $$(".fallback-content").forEach((el) => { el.hidden = true; });
  document.body.classList.add("js-ready");
}

document.addEventListener("DOMContentLoaded", init);
