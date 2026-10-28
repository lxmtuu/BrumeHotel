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
  $("#roomGrid").innerHTML = ROOMS.map(cardHTML).join("");
  applyFilter(currentFilter);
  observeReveals();
}

function updatePrices() {
  ROOMS.forEach((room) => {
    const card = $(`.room[data-slug="${room.slug}"]`);
    if (!card) return;
    const price = roomPriceDisplay(room);
    $(".price__label", card).textContent = price.label;
    $(".price__value", card).textContent = vnd(price.value);
    $(".price__sub", card).textContent = `${price.otherLabel}: ${vnd(price.otherValue)}/đêm`;
  });
}

function applyFilter(filter) {
  currentFilter = filter;
  let visible = 0;
  $$(".room", $("#roomGrid")).forEach((card) => {
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
      status.textContent = `Đang xem ${SEASONS[currentSeason].label.toLowerCase()} thủ công, không đối chiếu theo ngày. Chọn lại ngày để tự động cập nhật.`;
      status.classList.add("is-unconfirmed");
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
          <li><span>Diện tích</span><strong>${room.area} m²</strong></li>
          <li><span>Giường</span><strong>${room.bed}</strong></li>
          <li><span>Sức chứa</span><strong>${room.capacity}</strong></li>
          <li><span>Số phòng</span><strong>${room.code.split(",").length} phòng</strong></li>
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

function renderChildAges() {
  const container = $("#childAges");
  const previous = { young: [], older: [] };
  $$("select[data-child-age]", container).forEach((select) => {
    previous[select.dataset.childGroup].push(select.value);
  });
  const groups = [
    { key: "young", label: "dưới 6 tuổi", start: 0, count: Number($("#rChildrenYoung").value) || 0 },
    { key: "older", label: "từ 6 đến dưới 12 tuổi", start: 6, count: Number($("#rChildrenOlder").value) || 0 },
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
  const room = roomBySlug($("#rRoom").value);
  const children = Number($("#rChildrenYoung").value) + Number($("#rChildrenOlder").value);
  const warning = guestCapacityWarning(room, Number($("#rAdults").value), children);
  ["#bookGuestWarning", "#requestGuestWarning"].forEach((selector) => {
    const el = $(selector);
    el.textContent = warning;
    el.hidden = !warning;
  });
}

function syncGuestCounts(fromModal = false) {
  const source = fromModal ? ["#rAdults", "#rChildrenYoung", "#rChildrenOlder"] : ["#adults", "#childrenYoung", "#childrenOlder"];
  const target = fromModal ? ["#adults", "#childrenYoung", "#childrenOlder"] : ["#rAdults", "#rChildrenYoung", "#rChildrenOlder"];
  source.forEach((selector, i) => { $(target[i]).value = $(selector).value; });
  renderChildAges();
  updateGuestWarnings();
}

function syncRoomChoice(fromModal = false) {
  const source = fromModal ? "#rRoom" : "#rtype";
  const target = fromModal ? "#rtype" : "#rRoom";
  $(target).value = $(source).value;
  updateGuestWarnings();
}

function initGuestFields() {
  ["#adults", "#childrenYoung", "#childrenOlder"].forEach((selector) => {
    $(selector).addEventListener("change", () => syncGuestCounts());
  });
  ["#rAdults", "#rChildrenYoung", "#rChildrenOlder"].forEach((selector) => {
    $(selector).addEventListener("change", () => syncGuestCounts(true));
  });
  $("#rtype").addEventListener("change", () => syncRoomChoice());
  $("#rRoom").addEventListener("change", () => syncRoomChoice(true));
  syncGuestCounts();
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
  $(targetCiSel).value = $(ciSel).value;
  $(targetCoSel).value = $(coSel).value;
  $(targetCiSel).min = todayISO();
  syncCheckoutMin(targetCiSel, targetCoSel, false);
  updateSeasonFromDates($(ciSel).value, $(coSel).value);
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
  if (prefill.adults) $("#rAdults").value = prefill.adults;
  if (prefill.childrenYoung !== undefined) $("#rChildrenYoung").value = prefill.childrenYoung;
  if (prefill.childrenOlder !== undefined) $("#rChildrenOlder").value = prefill.childrenOlder;
  if (Object.prototype.hasOwnProperty.call(prefill, "room")) $("#rRoom").value = prefill.room;
  syncRoomChoice(true);
  syncGuestCounts(true);
  $("#rCi").min = todayISO();
  syncCheckoutMin("#rCi", "#rCo");
  syncBookingDates("#rCi", "#rCo", "#ci", "#co");

  openModal(bookModal);
  $("#rName").focus({ preventScroll: true });
}

function syncCheckoutMin(ciSel, coSel, adjustValue = true) {
  const ci = $(ciSel).value;
  const co = $(coSel);
  const minISO = ci ? addDaysISO(ci, 1) : todayISO(1);
  co.min = minISO;
  if (adjustValue && co.value && co.value < minISO) co.value = minISO;
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
  $("#holidayCalendarSummary").innerHTML = holidayCalendarHTML();
}

function buildMessage() {
  const name = $("#rName").value.trim();
  const phone = $("#rPhone").value.trim();
  const ci = $("#rCi").value;
  const co = $("#rCo").value;
  const adults = $("#rAdults").value;
  const childrenYoung = $("#rChildrenYoung").value;
  const childrenOlder = $("#rChildrenOlder").value;
  const childAges = $$("#childAges select[data-child-age]");
  const roomValue = $("#rRoom").value;
  const room = roomValue ? roomBySlug(roomValue) : null;
  const note = $("#rNote").value.trim();

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
  lines.push(`• Tên: ${name}`, `• Điện thoại: ${phone}`);
  if (note) lines.push(`• Ghi chú: ${note}`);
  lines.push("", "Nhờ Brume kiểm tra phòng trống và báo giá giúp mình. Cảm ơn!");
  return lines.join("\n");
}

function initRequestForm() {
  requestForm.addEventListener("submit", (e) => {
    e.preventDefault();
    $("#rCi").min = todayISO();
    syncCheckoutMin("#rCi", "#rCo", false);
    if (!requestForm.reportValidity()) return;

    $("#requestText").textContent = buildMessage();
    requestForm.hidden = true;
    $("#requestResult").hidden = false;
    $("#copyBtn").focus({ preventScroll: true });
  });

  $("#rCi").addEventListener("change", () => {
    syncCheckoutMin("#rCi", "#rCo");
    syncBookingDates("#rCi", "#rCo", "#ci", "#co");
  });
  $("#rCo").addEventListener("change", () => syncBookingDates("#rCi", "#rCo", "#ci", "#co"));

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
let lightboxOpener = null;

function openLightbox(index) {
  const opening = lightbox.hidden;
  if (opening) lightboxOpener = document.activeElement;
  lightboxIndex = (index + GALLERY.length) % GALLERY.length;
  const item = GALLERY[lightboxIndex];
  const img = $("#lightboxImg");
  img.src = imgPath(item.img);
  img.alt = item.cap;
  $("#lightboxCap").textContent = `${item.cap} · ${lightboxIndex + 1}/${GALLERY.length}`;
  lightbox.hidden = false;
  lockScroll(true);
  if (opening) {
    const first = focusableElements(lightbox)[0];
    if (first) first.focus({ preventScroll: true });
  }
}

function closeLightbox() {
  lightbox.hidden = true;
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
      if (e.target.closest(".lightbox")) closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    const openModalEl = $(".modal:not([hidden])");
    if (e.key === "Escape") {
      if (!lightbox.hidden) closeLightbox();
      else if (openModalEl) closeModal(openModalEl);
      else if (document.body.classList.contains("nav-open")) {
        closeNav();
        $("#burger").focus();
      }
      return;
    }

    if (e.key === "Tab") {
      if (!lightbox.hidden) trapFocus(e, lightbox);
      else if (openModalEl) trapFocus(e, openModalEl);
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
  $("#burger").setAttribute("aria-label", "Mở menu");
}

/* ---------- Booking bar ---------- */

function initBookBar() {
  const form = $("#bookForm");
  syncCheckoutMin("#ci", "#co");
  syncBookingDates("#ci", "#co", "#rCi", "#rCo");
  $("#ci").addEventListener("change", () => {
    syncCheckoutMin("#ci", "#co");
    syncBookingDates("#ci", "#co", "#rCi", "#rCo");
  });
  $("#co").addEventListener("change", () => syncBookingDates("#ci", "#co", "#rCi", "#rCo"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    $("#ci").min = todayISO();
    syncCheckoutMin("#ci", "#co", false);
    if (!form.reportValidity()) return;
    openBooking({
      checkin: $("#ci").value,
      checkout: $("#co").value,
      adults: $("#adults").value,
      childrenYoung: $("#childrenYoung").value,
      childrenOlder: $("#childrenOlder").value,
      room: $("#rtype").value || "",
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
  $("#year").textContent = new Date().getFullYear();
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
