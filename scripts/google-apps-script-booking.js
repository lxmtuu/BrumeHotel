/**
 * ===================================================================
 * GOOGLE APPS SCRIPT: TỰ ĐỘNG GỬI EMAIL ĐẶT PHÒNG & LƯU GOOGLE SHEETS
 * Khách sạn: Brume Hotel Đà Lạt (44 Hồ Tùng Mậu)
 * ===================================================================
 */

// CẤU HÌNH ĐỊA CHỈ EMAIL NHẬN THÔNG BÁO (có thể điền 1 hoặc nhiều email cách nhau bởi dấu phẩy)
const EMAIL_LE_TAN = "octieuwayway@gmail.com"; // Email Lễ tân nhận thông báo đặt phòng

// ID FILE GOOGLE SHEETS (Dùng ID này để script hoạt động tốt dù tạo độc lập hay tạo từ Sheets)
const SPREADSHEET_ID = "106nU1qDQD_5B8yjgsBpKXB2VGU_81pVuUeDDKVZ_AfU";

function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else {
      data = e.parameter || {};
    }

    // Thời gian định dạng Việt Nam
    const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    // 1. GỬI EMAIL HTML THÔNG BÁO CHO LỄ TÂN (Ưu tiên gửi trước để không bị nghẽn)
    if (EMAIL_LE_TAN) {
      try {
        sendBookingEmail(data, nowStr);
      } catch (mailErr) {
        console.error("Lỗi gửi email: " + mailErr);
      }
    }

    // 2. LƯU DÒNG DỮ LIỆU MỚI VÀO GOOGLE SHEETS
    try {
      let sheet = null;
      if (SPREADSHEET_ID) {
        try {
          const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
          sheet = ss.getSheetByName("Danh Sách Đặt Phòng") || ss.getSheets()[0];
        } catch (err) {}
      }
      if (!sheet && SpreadsheetApp.getActiveSpreadsheet()) {
        sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      }

      if (sheet) {
        // Nếu bảng tính chưa có tiêu đề cột thì tự động tạo hàng tiêu đề
        if (sheet.getLastRow() === 0) {
          const headers = [
            "Thời gian gửi",
            "Họ và tên",
            "Số điện thoại",
            "Check-in",
            "Check-out",
            "Số đêm",
            "Hạng phòng",
            "Người lớn",
            "Trẻ em <6t",
            "Trẻ em 6-11t",
            "Tuổi trẻ em",
            "Phương tiện & Gửi xe",
            "Ghi chú",
            "Trạng thái xử lý"
          ];
          sheet.appendRow(headers);
          sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#16231e").setFontColor("#ffffff");
          sheet.setFrozenRows(1);
        }

        // Ghi dòng mới vào Google Sheets
        sheet.appendRow([
          nowStr,
          data.name || "—",
          "'" + (data.phone || "—"), // dấu ' để giữ nguyên số 0 ở đầu
          data.checkin || "—",
          data.checkout || "—",
          data.nights ? data.nights + " đêm" : "—",
          data.room || "Chưa chọn (nhờ tư vấn)",
          data.adults || 2,
          data.childrenYoung || 0,
          data.childrenOlder || 0,
          data.childAges || "—",
          data.vehicle || "Không có",
          data.note || "—",
          "Chưa liên hệ"
        ]);
      }
    } catch (sheetErr) {
      console.error("Lỗi ghi bảng tính: " + sheetErr);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Đã lưu và gửi thông báo thành công" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendBookingEmail(data, timeStr) {
  const cleanPhone = (data.phone || "").replace(/[^0-9]/g, "");
  const zaloUrl = cleanPhone ? "https://zalo.me/" + cleanPhone : "https://zalo.me/0778888525";
  const callUrl = cleanPhone ? "tel:" + cleanPhone : "tel:0778888525";

  const subject = "🛎️ [ĐẶT PHÒNG MỚI] " + (data.name || "Khách") + " - " + (data.room || "Tư vấn phòng") + " (" + (data.checkin || "") + ")";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d9d4c7; border-radius: 8px; overflow: hidden; background: #faf8f5;">
      <!-- Header -->
      <div style="background: #16231e; padding: 24px; text-align: center; color: #f7f5ee;">
        <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; color: #c99a5e; letter-spacing: 0.05em;">BRUME HOTEL ĐÀ LẠT</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #a4b3aa; letter-spacing: 0.1em; text-transform: uppercase;">44 Hồ Tùng Mậu, Phường Xuân Hương, Đà Lạt</p>
      </div>

      <!-- Banner thông báo -->
      <div style="background: #eaf4ed; border-bottom: 1px solid #c3e0cb; padding: 14px 20px; text-align: center;">
        <span style="color: #1e7e34; font-weight: bold; font-size: 15px;">🛎️ CÓ YÊU CẦU ĐẶT PHÒNG MỚI TỪ WEBSITE</span>
        <div style="font-size: 12px; color: #555; margin-top: 4px;">Thời gian gửi: ${timeStr}</div>
      </div>

      <!-- Body -->
      <div style="padding: 24px;">
        <h2 style="font-size: 18px; color: #16231e; margin-top: 0; border-bottom: 2px solid #c99a5e; padding-bottom: 8px;">Thông tin khách hàng</h2>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #666; width: 140px;">Họ và tên:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #16231e; font-size: 16px;">${data.name || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #666;">Số điện thoại:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #0068ff; font-size: 16px;">
              <a href="${callUrl}" style="color: #0068ff; text-decoration: none;">${data.phone || "—"}</a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #666;">Hạng phòng:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #c99a5e; font-size: 15px;">${data.room || "Chưa chọn (nhờ tư vấn)"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #666;">Ngày nhận phòng:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #16231e;">${data.checkin || "—"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #666;">Ngày trả phòng:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #16231e;">${data.checkout || "—"} ${data.nights ? `(${data.nights} đêm)` : ""}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #666;">Số lượng khách:</td>
            <td style="padding: 10px 0; color: #16231e;">
              ${data.adults || 2} người lớn
              ${Number(data.childrenYoung) > 0 ? `, ${data.childrenYoung} trẻ <6t` : ""}
              ${Number(data.childrenOlder) > 0 ? `, ${data.childrenOlder} trẻ 6-11t` : ""}
              ${data.childAges && data.childAges !== "Không có" ? `<div style="font-size: 12px; color: #888;">(Độ tuổi: ${data.childAges})</div>` : ""}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; color: #666;">Phương tiện & Gửi xe:</td>
            <td style="padding: 10px 0; font-weight: bold; color: #b05c19; background: #fff8f0; border-radius: 4px;">
              ${data.vehicle || "Không có phương tiện riêng"}
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #666;">Ghi chú thêm:</td>
            <td style="padding: 10px 0; color: #333; font-style: italic;">${data.note || "Không có"}</td>
          </tr>
        </table>

        <!-- Nút hành động nhanh cho lễ tân -->
        <div style="text-align: center; margin: 26px 0 10px; display: flex; gap: 10px; justify-content: center;">
          <a href="${callUrl}" style="display: inline-block; background: #16231e; color: #f7f5ee; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: bold; font-size: 14px; margin-right: 8px;">
            📞 Gọi khách ngay
          </a>
          <a href="${zaloUrl}" target="_blank" style="display: inline-block; background: #0068ff; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 6px; font-weight: bold; font-size: 14px;">
            💬 Mở Zalo nhắn khách
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #ede9e1; padding: 14px 20px; text-align: center; font-size: 12px; color: #666;">
        Email tự động từ hệ thống đặt phòng <strong>Brume Hotel Đà Lạt</strong>.<br />
        Vui lòng liên hệ xác nhận phòng với khách trong thời gian sớm nhất.
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: EMAIL_LE_TAN,
    subject: subject,
    htmlBody: htmlBody
  });
}
