# Cập nhật lịch Lễ/Tết của Brume

Lịch hiện chỉ gồm những ngày Brume đã cung cấp. Những ngày khác **không tự được coi là ngày thường**: website hiển thị giá dự kiến và đề nghị khách xác nhận với Brume. Giá phòng và tình trạng phòng không tự cập nhật theo lịch này.

## Khi có lịch mới

1. Mở `assets/js/holiday-calendar.js`. Mỗi dòng là một khoảng ngày:

   ```js
   { from: "2027-02-07", to: "2027-02-10", kind: "tet" },
   ```

2. Thêm hoặc sửa các khoảng theo thông tin do Brume xác nhận:
   - Ngày viết theo định dạng `YYYY-MM-DD`; ngày bắt đầu và ngày kết thúc đều được tính.
   - `kind: "holiday"` cho Lễ, `kind: "tet"` cho Tết.
   - Khoảng một ngày có cùng ngày bắt đầu và kết thúc. Các khoảng không được chồng lấn.
   - Không tự thêm ngày lễ chưa được Brume xác nhận.
3. Tại thư mục repo, chạy:

   ```sh
   node scripts/update-fallback.js
   node --test tests/*.test.js
   ```

   Lệnh đầu cập nhật phần bảng lịch dự phòng cho khách không bật JavaScript. Lệnh sẽ báo lỗi nếu ngày sai, loại ngày không hợp lệ hoặc các khoảng chồng lấn.
4. Kiểm tra lại mục **Bảng giá** và thử các ngày đầu/cuối của từng khoảng trên preview trước khi triển khai website.

Chỉnh file trong repo không tự cập nhật website đã triển khai: cần triển khai lại sau khi kiểm tra. Nếu không trực tiếp sửa mã, cậu có thể gửi ngày bắt đầu, ngày kết thúc và cho biết là Lễ hay Tết để người quản lý website cập nhật.
