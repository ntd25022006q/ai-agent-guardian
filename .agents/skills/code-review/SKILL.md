---
name: code-review
description: Hướng dẫn AI tự rà soát, đánh giá cấu trúc thuật toán, bộ nhớ, độ bảo mật và tính vững chắc của code trước khi bàn giao.
---

# Kỹ năng Đánh giá Mã nguồn Chuyên sâu (Code Review Skill)

Mỗi khi được giao tác vụ refactor, viết thuật toán phức tạp hoặc hoàn thiện tính năng, AI Agent phải tự chạy qua checklist đánh giá sau:

## 1. Tối ưu thuật toán & Bộ nhớ (Complexity & Memory Leak Check)

- **Độ phức tạp thời gian:** Xem xét thuật toán có thể tối ưu từ độ phức tạp $O(n^2)$ về $O(n \log n)$ hoặc $O(n)$ không? Báo cáo độ phức tạp Big O của thuật toán chính trong phần mô tả.
- **Rò rỉ bộ nhớ (Memory leaks):** Khi viết các vòng lặp lắng nghe sự kiện (`addEventListener`) hoặc bộ đếm thời gian (`setInterval`), AI Agent bắt buộc phải thiết lập cơ chế xóa bỏ (`removeEventListener`, `clearInterval`) khi component bị unmount.

## 2. Thiết kế Kiến trúc & Hướng đối tượng

- **SOLID Principles:**
  - _Single Responsibility:_ Mỗi class/hàm chỉ làm đúng 1 nhiệm vụ duy nhất.
  - _Open/Closed:_ Thiết kế code dễ mở rộng thêm tính năng mới mà không phải sửa trực tiếp mã nguồn cốt lõi cũ.
- **Cơ cấu Modular:** Tách logic nghiệp vụ (business logic) ra khỏi tầng hiển thị (UI components) và các hàm tiện ích dùng chung (helper utils).

## 3. Rà soát an toàn hệ thống (Security Review)

- Không sử dụng các hàm nguy hiểm như `eval()` hay `exec()` trực tiếp với dữ liệu thô đầu vào của người dùng.
- Thực hiện mã hóa các thông tin nhạy cảm ở phía client trước khi lưu trữ hoặc truyền đi.
- Kiểm tra kĩ các giá trị null/undefined để tránh crash ứng dụng.
