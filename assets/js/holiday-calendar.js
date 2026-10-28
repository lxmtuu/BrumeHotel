/* Lịch Lễ/Tết được Brume cung cấp.
 * Thêm mỗi khoảng ngày vào danh sách dưới đây, dùng YYYY-MM-DD (bao gồm cả hai đầu).
 * kind: "holiday" là Lễ, "tet" là Tết. Các khoảng không được chồng lấn.
 * Sau khi sửa, chạy: node scripts/update-fallback.js
 * Hướng dẫn đầy đủ: docs/cap-nhat-lich-le-tet.md
 */
globalThis.BRUME_HOLIDAYS = [
  { from: "2026-08-29", to: "2026-09-01", kind: "holiday" },
  { from: "2027-01-01", to: "2027-01-01", kind: "holiday" },
  { from: "2027-02-07", to: "2027-02-10", kind: "tet" },
  { from: "2027-02-11", to: "2027-02-15", kind: "holiday" },
];
