# AI Agent Supreme Code of Conduct & Strict Guidelines

Tệp tin này là **Bộ Luật Tối Cao** điều khiển hành vi của mọi AI Agent (Cursor, Claude Code, Aider, Antigravity,...) hoạt động trong dự án này. AI Agent bắt buộc phải đọc và tuân thủ 100% các nguyên tắc dưới đây. Bất kỳ sự lệch chuẩn nào đều bị coi là vi phạm nghiêm trọng.

---

## ⚠️ CẢNH BÁO: 21 LỖI LẬP TRÌNH AI AGENT THƯỜNG GẶP (PHẢI TRÁNH TUYỆT ĐỐI)

Hệ thống giám sát bảo mật liên tục chạy các script kiểm soát tự động để bắt lỗi AI Agent. Bất kỳ hành vi nào vi phạm các điểm dưới đây sẽ làm hỏng bản build hoặc chặn Git commit:

1. **Lệch yêu cầu giao diện:** Bảo mô tả chức năng giao diện kiểu này nhưng lại đi code kiểu khác.
2. **Xóa mất thư mục quan trọng:** Tự ý sửa file làm mất dữ liệu thư mục cấu hình, mã nguồn gốc.
3. **Fix test không triệt để:** Gây ra lỗi mới nghiêm trọng cho các phần xung quanh (Regression).
4. **Code qua loa cho có:** Không áp dụng đúng lý thuyết nền tảng (SOLID, Clean Architecture).
5. **Bố cục giao diện rời rạc:** Thiếu thẩm mỹ, không dùng responsive.
6. **Lạm dụng Mock Data:** Viết dữ liệu giả lập ở file code production thay vì liên kết API thực tế.
7. **Bị kẹt vòng lặp thought loop:** Sửa đi sửa lại một bug mà không thoát ra được, gây tốn token.
8. **Code sơ sài không chạy được:** Viết hàm rỗng hoặc thiếu dependency cốt lõi.
9. **Giao diện xấu:** Căn chỉnh lệch lạc, phối màu thô, kém thẩm mỹ.
10. **Lỗi liên kết lỏng lẻo:** UI và logic xử lý backend không khớp nối với nhau.
11. **Gây xung đột thư viện:** Cài đặt bừa bãi hoặc import sai làm màn hình nhấp nháy đen trắng khi chạy.
12. **Bịa đặt thông tin (Hallucination):** Tự bịa API thư viện thay vì đối chiếu tài liệu chính thức từ GitHub.
13. **Thiếu công cụ test/MCP:** Thiếu các module tự động hóa và test suite để chứng minh tính đúng đắn.
14. **Dung lượng build quá nhẹ (vài KB):** Đóng gói thiếu tài nguyên, thiếu mã nguồn lõi.
15. **Thiếu công cụ đi kèm:** Build file chất lượng thấp, thiếu tài nguyên bổ sung hỗ trợ hoạt động.
16. **Hoạt động lệch kỹ năng:** Không áp dụng đúng các kịch bản hành vi (Agent Skills).
17. **Hiểu sai ý người dùng:** Do lười biếng không xác nhận lại yêu cầu trước khi code.
18. **Không sử dụng Web Search/Deep Search:** Chọn đi con đường ngắn nhất, lấy giải pháp hời hợt.
19. **Bảo mật kém, thuật toán tệ:** Logic code yếu kém, chứa lỗ hổng bảo mật cơ bản (SQLi, XSS).
20. **Làm mất kết nối server (Proxy/VPN/VPS):** Cấu hình sai cổng hoặc dịch vụ mạng.
21. **Lãng phí Token cực hạn:** Không tối ưu hóa prompt và dữ liệu gửi đi làm tiêu tốn tiền API.

---

## 🛡️ BỘ QUY TẮC KỶ LUẬT THỰC THI (ENFORCED RULES)

### 1. NGUYÊN TẮC AN TOÀN DỮ LIỆU & FILE SYSTEM

- **Cấm tự ý xóa:** Tuyệt đối KHÔNG ĐƯỢC tự ý xóa bất kỳ tệp tin hoặc thư mục nào trong danh sách được bảo vệ (`src`, `config`, `public`, `assets`, `.agents`, `scripts`).
- **Sao lưu tự động:** Mọi hành vi sửa đổi file lớn phải đảm bảo Git sạch để có thể rollback khi cần.

### 2. PHÒNG CHỐNG MOCK DATA TRONG PRODUCTION

- **Dữ liệu thực tế:** Không được khai báo các biến chứa dữ liệu mock (ví dụ: `const mockUsers = [...]`) trong thư mục `src/` (trừ các file có hậu tố `.test.js` hoặc `.spec.js`).
- **Static analysis block:** Script `check-integrity.js` sẽ quét mã nguồn tự động, nếu phát hiện biến mock hoặc dummy data trong file production, tiến trình build sẽ bị hủy lập tức.

### 3. THIẾT KẾ UI/UX CHUẨN MỰC CHỐNG NHẤP NHÁY

- **Xác nhận Wireframe:** Trước khi viết code giao diện, AI phải vẽ bố cục ASCII hoặc bảng phân cấp Layout Grid/Flexbox và xin xác nhận từ lập trình viên.
- **Đồng bộ màu sắc:** Chỉ sử dụng màu HSL/RGB tinh tế từ hệ thống Design System hoặc Tailwind CSS cấu hình sẵn. Cấm dùng mã màu thô (`#ff0000`, `blue`).
- **Loading & Error handling:** Bắt buộc có trạng thái tải dữ liệu và Error Boundary để tránh giật lag hoặc màn hình nhấp nháy trắng đen khi render.

### 4. QUY TRÌNH KIỂM THỬ (TDD) & BẢO VỆ HỒI QUY

- **TDD quy chuẩn:** Viết Unit Test mô tả đúng tính năng trước khi code. Chạy test suite `npm test` để xác minh.
- **Không làm hỏng code cũ:** Mỗi thay đổi đối với hàm dùng chung bắt buộc phải chạy lại toàn bộ test suite để đảm bảo không đẻ ra lỗi mới nghiêm trọng.

### 5. WEB SEARCH & CHỐNG ẢO TƯỞNG THƯ VIỆN

- **Bắt buộc tra cứu:** AI Agent không được tự đoán API. Khi dùng bất kỳ thư viện bên thứ ba nào, AI phải sử dụng công cụ Web Search/Deep Search để tìm tài liệu chính thức từ GitHub của thư viện đó.
- **Cấu hình đóng gói:** File build đầu ra phải chứa đầy đủ nhân cốt lõi (Vite/Webpack cấu hình chuẩn bundle full dependencies), kiểm tra dung lượng gói build không được dưới mức tối thiểu.

### 6. ĐIỀU KHIỂN THÔNG MINH (HALT CONDITION & TOKEN)

- **Giới hạn Thought Loop:** Nếu sửa 1 bug quá 3 lần thất bại hoặc dính lỗi hồi quy lặp lại, AI **phải dừng ngay lập tức** và làm báo cáo chi tiết gửi người dùng.
- **Nén Token:** Chỉ giao tiếp trực diện ngắn gọn, gửi code dưới dạng `diff` cụ thể, không viết lại toàn bộ code của các file dài.
- **Kiểm tra mạng:** Chạy `npm run monitor` để rà soát kết nối proxy/mạng trước khi thực hiện các tác vụ API tầm xa.
