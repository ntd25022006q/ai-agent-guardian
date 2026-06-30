---
name: specification-alignment
description: Bắt buộc AI đối chiếu chặt chẽ đặc tả yêu cầu, thiết kế sơ đồ luồng dữ liệu trước khi code để tránh hiểu sai ý đồ người dùng.
---

# Kỹ năng Đối chiếu Đặc tả & Thiết kế (Specification Alignment Skill)

Để chấm dứt hoàn toàn lỗi "AI hiểu sai ý đồ, bảo làm một đằng code một nẻo", AI Agent bắt buộc phải thực thi quy trình sau:

## 1. Trình bày Đặc tả & Kế hoạch trước khi code (Requirement Verification)

- Khi nhận yêu cầu mới phức tạp, AI Agent **không được phép bắt đầu viết code ngay**.
- Trước tiên, AI phải viết một bản tóm tắt ngắn bao gồm:
  1. **Hiểu biết của tôi:** Mục đích thực sự của tính năng này là gì?
  2. **Giao diện mẫu (Mockup/Layout Spec):** Phác thảo bố cục (Header, Sidebar, Content, Footer) bằng bảng Markdown hoặc ký tự ASCII.
  3. **Quyết định công nghệ:** Sử dụng những thư viện nào, xử lý logic ở file nào?
- Gửi bản tóm tắt này cho lập trình viên và chờ phản hồi đồng ý hoặc điều chỉnh.

## 2. Kiểm tra tính liên kết (Integrity Validation)

- Đảm bảo mọi luồng dữ liệu của UI phải tương tác với backend/controller.
- Thiết lập rõ ràng các trường hợp biên (Edge cases) và luồng xử lý lỗi của người dùng (e.g. form validation fail, server timeout) để tránh lỗi rời rạc hệ thống.
