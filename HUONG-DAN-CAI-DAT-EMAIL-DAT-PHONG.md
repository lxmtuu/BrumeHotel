# Hướng Dẫn Cài Đặt Tự Động Gửi Email Đặt Phòng Về Lễ Tân
**Khách sạn:** Brume Hotel Đà Lạt — 44 Hồ Tùng Mậu  
**Chi phí:** 100% Miễn phí trọn đời (sử dụng Google Sheets & Google Apps Script chính chủ của Google)

---

## 🎯 Quy trình hoạt động sau khi cài đặt
1. Khách hàng vào website Brume Hotel điền thông tin và bấm **"Gửi yêu cầu đặt phòng"**.
2. **Khách hàng**: Lập tức thấy thông báo thành công đẹp mắt:  
   *"✓ Đã chuyển thông tin tới Lễ tân Brume Hotel thành công! Lễ tân sẽ gọi điện hoặc nhắn Zalo xác nhận phòng cho bạn trong ít phút."*
3. **Lễ tân Khách sạn**:
   * Nhận ngay một **Email HTML thông báo đặt phòng mới** gửi thẳng vào hòm thư Gmail của lễ tân.
   * Email có sẵn 2 nút: **"📞 Gọi khách ngay"** và **"💬 Mở Zalo nhắn khách"** để lễ tân xử lý chỉ bằng 1 cú chạm trên điện thoại.
   * Đồng thời, 1 dòng dữ liệu mới tự động lưu vào file **Google Sheets** để khách sạn theo dõi lịch phòng tổng thể.

---

## 🛠️ Hướng dẫn 3 bước cài đặt (Mất khoảng 3 - 5 phút)

### Bước 1: Tạo file Google Sheets
1. Đăng nhập tài khoản Google của khách sạn (ví dụ: `brumedalathotel@gmail.com`).
2. Truy cập [Google Sheets](https://sheets.google.com) và tạo một trang tính mới.
3. Đổi tên trang tính thành: **"Brume Hotel - Quản lý đặt phòng"**.

---

### Bước 2: Dán mã Script & Nhập Email Lễ tân
1. Trên thanh menu của Google Sheets, chọn **Tiện ích mở rộng** (Extensions) ➔ **Apps Script**.
2. Xóa hết tất cả các dòng chữ mặc định đang có.
3. Mở file `scripts/google-apps-script-booking.js` trong thư mục này, **copy toàn bộ nội dung** và dán vào Apps Script.
4. Tìm dòng số 20:
   ```javascript
   const EMAIL_LE_TAN = "brumedalathotel@gmail.com";
   ```
   **Thay bằng địa chỉ email thực tế của Lễ tân** (nếu muốn gửi cho nhiều người, có thể điền các email cách nhau bằng dấu phẩy: `"letan1@gmail.com, quanly@gmail.com"`).
5. Bấm biểu tượng 💾 **Lưu** (Save).

---

### Bước 3: Triển khai Web App (Deploy) để lấy URL Webhook
1. Ở góc trên bên phải màn hình Apps Script, bấm nút màu xanh **Triển khai** (Deploy) ➔ chọn **Tùy chọn triển khai mới** (New deployment).
2. Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh "Chọn loại", chọn **Ứng dụng web** (Web app).
3. Điền các mục như sau:
   * **Mô tả (Description):** `Brume Booking Webhook`
   * **Thực thi dưới dạng (Execute as):** `Tôi (email của bạn)`
   * **Người có quyền truy cập (Who has access):** Chọn **Bất kỳ ai (Anyone)** *(Rất quan trọng: Phải chọn Anyone để website gửi dữ liệu được mà không bị chặn quyền).*
4. Bấm **Triển khai** (Deploy).
   * *Google sẽ hiện thông báo yêu cầu cấp quyền (Review permissions), bạn bấm chọn tài khoản của mình ➔ Bấm "Advanced" (Nâng cao) ➔ Bấm "Go to Untitled project (unsafe)" ➔ Bấm "Allow" (Cho phép).*
5. Sao chép dòng **URL ứng dụng web** (Web app URL), có dạng:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

### Bước 4: Dán URL vào Website
Mở file `assets/js/app.js` trên website, tìm đoạn đầu:
```javascript
const HOTEL = {
  phone: "0778888525",
  phoneLabel: "077 888 8525",
  zalo: "https://zalo.me/0778888525",
  facebook: "https://www.facebook.com/profile.php?id=61588141471436",
  maps: "https://www.google.com/maps/dir/...",
  // DÁN URL BƯỚC 3 VÀO ĐÂY:
  bookingEndpoint: "https://script.google.com/macros/s/AKfycbx.../exec",
};
```
👉 Lưu file lại. Từ thời điểm này, mỗi khi có khách đặt phòng trên web, **Email sẽ tự động bay về hòm thư lễ tân ngay lập tức**!
