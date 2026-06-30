---
name: security-check
description: Quét và kiểm tra các lỗ hổng bảo mật, rò rỉ thông tin nhạy cảm (API keys, secrets) và lỗi logic bảo mật của code.
---

# Kỹ năng kiểm tra bảo mật (Security Check Skill)

Khi kỹ năng này được kích hoạt hoặc khi bạn đang viết code xử lý các dữ liệu nhạy cảm, giao dịch, xác thực người dùng, bạn bắt buộc phải tuân theo các quy tắc sau:

## 1. Phòng chống rò rỉ thông tin (Secret Leakage Prevention)

- **Cấm tuyệt đối:** Lưu trữ trực tiếp API Keys, Passwords, Token, SSH Keys vào bất kỳ file code nào.
- **Quy chuẩn:** Sử dụng tệp tin biến môi trường `.env` hoặc hệ thống quản lý Secret.
- **Kiểm tra trước khi commit:** Quét toàn bộ nội dung file thay đổi để đảm bảo không có chuỗi ký tự nào trông giống API key (ví dụ: `ghp_...`, `sk-proj-...`, `AIzaSy...`) bị ghi đè vào code.

## 2. Kiểm tra các lỗ hổng OWASP Top 10 phổ biến

- **SQL Injection:** Luôn sử dụng Parameterized Queries hoặc ORM chuẩn (như Prisma, Mongoose, SQLAlchemy). Không cộng chuỗi SQL trực tiếp với biến đầu vào của người dùng.
- **Cross-Site Scripting (XSS):** Khi hiển thị dữ liệu người dùng nhập lên giao diện, phải sử dụng các cơ chế sanitize dữ liệu (như `DOMPurify` hoặc các cơ chế escaping mặc định của React/Vue).
- **Broken Authentication & Session Management:** Sử dụng thư viện JWT chuẩn, mã hóa hash mật khẩu bằng `bcrypt` hoặc `argon2` với số vòng lặp tối thiểu khuyến nghị. Không tự chế thuật toán mã hóa riêng.

## 3. Quản lý phân quyền và dữ liệu đầu vào (Input Validation)

- **Kiểm tra tính hợp lệ (Validation):** Sử dụng các thư viện validation chuẩn như `Zod`, `Joi`, hoặc `Pydantic` để kiểm tra kiểu dữ liệu đầu vào trước khi xử lý.
- **Phân quyền chặt chẽ:** Kiểm tra xem user có thực sự sở hữu hoặc có quyền truy cập vào bản ghi dữ liệu đó trước khi thực hiện hành động DELETE/UPDATE.
