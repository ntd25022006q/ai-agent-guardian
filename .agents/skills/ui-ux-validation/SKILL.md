---
name: ui-ux-validation
description: Hướng dẫn và quy tắc để thiết kế giao diện (UI) chuyên nghiệp, đẹp mắt, chống nhấp nháy màn hình và đồng bộ trải nghiệm người dùng (UX).
---

# Kỹ năng kiểm tra giao diện & Trải nghiệm (UI/UX Validation Skill)

AI Agent bắt buộc phải tuân thủ bộ quy chuẩn này khi thiết kế giao diện:

## 1. Thiết lập Bố cục & Hệ màu (Layout & Theme System)
* **Bảng màu nhất quán:** Tuyệt đối không dùng các màu nguyên bản chô (e.g. `#ff0000` đỏ chóe, `#0000ff` xanh lam thô). Hãy sử dụng hệ màu HSL/RGB tinh tế với độ bão hòa (saturation) vừa phải, hoặc áp dụng các palette màu chuyên nghiệp (như Slate, Indigo, Emerald).
* **Grid & Flexbox:** Bố cục của trang web/ứng dụng phải sử dụng Grid Layout hoặc Flexbox có căn chỉnh hợp lý. Không được để các thành phần bị lệch hàng, tràn viền hoặc co giãn dị dạng trên các màn hình khác nhau (Responsive design).
* **Typography:** Sử dụng các font chữ hệ thống hiện đại (như Inter, Roboto, SF Pro) thay cho font mặc định của trình duyệt. Quản lý cỡ chữ (font-size) và khoảng cách dòng (line-height) rõ ràng theo chuẩn phân cấp tiêu đề (H1, H2, H3, Body).

## 2. Ngăn chặn lỗi nhấp nháy & Giật lag (Anti-Flicker & Render Optimization)
* **Loading States:** Mọi thao tác tải dữ liệu bất đồng bộ (API fetch, database query) đều phải có Loading skeleton hoặc Spinner đẹp mắt. Không để màn hình trống rỗng hoặc nhấp nháy đen trắng trong lúc đợi dữ liệu.
* **Error Boundaries:** Xử lý các trường hợp API lỗi một cách mượt mà. Hiển thị thông báo lỗi thân thiện thay vì làm đơ giao diện hoặc crash toàn bộ trang.
* **CSS Transitions:** Thêm các hiệu ứng chuyển động vi mô (Micro-animations) mượt mà (smooth hover, fade-in nhẹ nhàng) cho các nút bấm và menu để tạo cảm giác giao diện "sống động" và cao cấp.

## 3. Liên kết luồng dữ liệu (Data Integration)
* **Liên kết chặt chẽ:** Không tạo ra các form ảo không có nút submit hoạt động, hoặc các menu bấm vào không có phản hồi. Mọi nút bấm tương tác phải được gắn kết với hàm xử lý logic tương ứng.
