---
name: tdd-enforcement
description: Bộ quy tắc bắt buộc áp dụng quy trình kiểm thử và Test-Driven Development (TDD) để ngăn chặn các lỗi phát sinh ngoài ý muốn (regression bugs).
---

# Kỹ năng kiểm thử TDD (TDD Enforcement Skill)

Để đảm bảo tính đúng đắn và độ bền vững của mã nguồn theo thời gian, AI Agent phải thực hiện nghiêm ngặt quy trình TDD sau đây khi được yêu cầu sửa core logic:

## 1. Viết Test trước khi viết Code (TDD Cycle)

- **Bước 1: Viết test lỗi (Red):** Trước khi viết bất kỳ tính năng mới nào, hãy viết mã kiểm thử (Unit Test) cho tính năng đó. Chạy test suite để đảm bảo test bị lỗi (vì tính năng chưa được xây dựng).
- **Bước 2: Viết code tối thiểu (Green):** Viết đoạn code đơn giản nhất và đi thẳng vào mục tiêu để giúp bài test đó vượt qua (pass).
- **Bước 3: Tối ưu hóa (Refactor):** Cải tiến cấu trúc code, tối ưu thuật toán mà không làm hỏng bài test đã viết.

## 2. Kiểm thử hồi quy nghiêm ngặt (Strict Regression Check)

- **Sửa một chỗ không hỏng chỗ khác:** Mỗi lần sửa đổi một hàm tiện ích chung (utils) hoặc hàm cốt lõi, AI Agent **bắt buộc** phải chạy lại toàn bộ test suite của dự án để đảm bảo không có tính năng nào khác bị lỗi.
- **Cấm Mock bừa bãi:** Không được mock (giả lập) các hàm cần kiểm thử thực tế. Chỉ sử dụng mock đối với các dịch vụ bên thứ ba (như gửi email, SMS, Stripe payment) hoặc các kết nối API ngoài.

## 3. Quy chuẩn báo cáo kiểm thử

- Khi hoàn thành công việc, AI Agent phải đính kèm nhật ký chạy test (Test logs) để chứng minh toàn bộ các test cases đều đã chuyển sang màu xanh (Passed).
