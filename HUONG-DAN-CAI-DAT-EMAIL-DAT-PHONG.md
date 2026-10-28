# Hướng Dẫn Cài Đặt Tự Động Gửi Email Đặt Phòng Về Lễ Tân
**Khách sạn:** Brume Hotel Đà Lạt — 44 Hồ Tùng Mậu  
**Email nhận thông báo hiện tại:** `lexuanminhtufw@gmail.com`  
**Chi phí:** 100% Miễn phí trọn đời (sử dụng Google Sheets & Google Apps Script chính chủ của Google)

---

## 🎯 Quy trình hoạt động sau khi cài đặt
1. Khách hàng vào website Brume Hotel điền thông tin và bấm **"Gửi yêu cầu đặt phòng"**.
2. **Khách hàng**: Lập tức thấy thông báo thành công đẹp mắt:  
   *"✓ Đã chuyển thông tin tới Lễ tân Brume Hotel thành công! Lễ tân sẽ gọi điện hoặc nhắn Zalo xác nhận phòng cho bạn trong ít phút."*
3. **Lễ tân Khách sạn**:
   * Nhận ngay một **Email HTML thông báo đặt phòng mới** gửi thẳng vào hòm thư Gmail của lễ tân (`lexuanminhtufw@gmail.com`).
   * Email có sẵn 2 nút: **"📞 Gọi khách ngay"** và **"💬 Mở Zalo nhắn khách"** để lễ tân xử lý chỉ bằng 1 cú chạm trên điện thoại.
   * Đồng thời, 1 dòng dữ liệu mới tự động lưu vào file **Google Sheets** để khách sạn theo dõi lịch phòng tổng thể.

---

## 📊 File Google Sheets Quản Lý Đặt Phòng (Đã tạo sẵn)
Tớ đã khởi tạo sẵn bảng Google Sheet chuyên nghiệp cho khách sạn Brume Hotel:
👉 **Link bảng tính:** [Brume Hotel - Quản Lý Đặt Phòng](https://docs.google.com/spreadsheets/d/106nU1qDQD_5B8yjgsBpKXB2VGU_81pVuUeDDKVZ_AfU/edit)

Bảng tính đã có sẵn:
- 14 cột tiêu đề chuẩn hóa (Thời gian, Họ tên, SĐT, Check-in, Check-out, Số đêm, Hạng phòng, Số lượng khách, Độ tuổi trẻ em, Phương tiện gửi xe, Ghi chú, Trạng thái).
- Màu xanh rừng thông đặc trưng của Brume Hotel `#16231e` sang trọng.
- Cột **Trạng thái xử lý** có sẵn menu chọn nhanh: *Chưa liên hệ, Đã gọi xác nhận, Đã cọc, Đã nhận phòng, Hoàn thành, Đã huỷ*.

---

## 🛠️ Các bước kích hoạt Webhook (Chỉ mất 2 phút)

### Bước 1: Mở Apps Script từ Google Sheets
1. Mở file [Brume Hotel - Quản Lý Đặt Phòng](https://docs.google.com/spreadsheets/d/106nU1qDQD_5B8yjgsBpKXB2VGU_81pVuUeDDKVZ_AfU/edit).
2. Trên thanh menu trên cùng, bấm chọn **Tiện ích mở rộng** (Extensions) ➔ **Apps Script**.

---

### Bước 2: Dán mã Script
1. Xóa hết các dòng chữ mặc định đang có trong ô soạn thảo (`function myFunction() {...}`).
2. Mở file `scripts/google-apps-script-booking.js` trong thư mục mã nguồn website, **copy toàn bộ nội dung** và dán vào Apps Script.
   *(Mã đã được cấu hình sẵn email nhận: `const EMAIL_LE_TAN = "lexuanminhtufw@gmail.com";`)*
3. Bấm biểu tượng 💾 **Lưu** (Save) trên thanh công cụ (hoặc nhấn Ctrl+S / Cmd+S).

---

### Bước 3: Triển khai Web App (Deploy) để lấy URL
1. Ở góc trên bên phải màn hình Apps Script, bấm nút màu xanh **Triển khai** (Deploy) ➔ chọn **Tùy chọn triển khai mới** (New deployment).
2. Nhấn vào biểu tượng bánh răng ⚙️ bên cạnh dòng "Chọn loại" (Select type), chọn **Ứng dụng web** (Web app).
3. Điền các mục như sau:
   * **Mô tả (Description):** `Brume Booking Webhook`
   * **Thực thi dưới dạng (Execute as):** `Tôi (email của bạn)`
   * **Người có quyền truy cập (Who has access):** Chọn **Bất kỳ ai (Anyone)** *(Bắt buộc chọn Anyone để website gửi yêu cầu mà không bị Google chặn quyền).*
4. Bấm nút **Triển khai** (Deploy).
   * *Google sẽ hiện cửa sổ yêu cầu cấp quyền (Review permissions), bạn bấm chọn tài khoản Google của mình ➔ Bấm "Advanced" (Nâng cao) ➔ Bấm "Go to Untitled project (unsafe)" ➔ Bấm "Allow" (Cho phép).*
5. Sao chép dòng **URL ứng dụng web** (Web app URL), có dạng:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

### Bước 4: Cập nhật URL vào Website
Mở file `assets/js/app.js` trên website (hoặc gửi URL đó cho tớ để tớ dán giúp bạn), thay vào dòng `bookingEndpoint`:
```javascript
const HOTEL = {
  phone: "0778888525",
  phoneLabel: "077 888 8525",
  zalo: "https://zalo.me/0778888525",
  facebook: "https://www.facebook.com/profile.php?id=61588141471436",
  maps: "https://www.google.com/maps/dir/...",
  // Dán Web App URL của Bước 3 vào đây:
  bookingEndpoint: "https://script.google.com/macros/s/AKfycbx.../exec",
};
```
Sau khi gắn URL, mọi yêu cầu từ website sẽ ngay lập tức:
- 📩 Gửi email thông báo HTML có nút Gọi & Zalo về `lexuanminhtufw@gmail.com`.
- 📊 Tự động điền 1 dòng mới vào file Google Sheets [Brume Hotel - Quản Lý Đặt Phòng](https://docs.google.com/spreadsheets/d/106nU1qDQD_5B8yjgsBpKXB2VGU_81pVuUeDDKVZ_AfU/edit).
