# FitDesk — Quản lý phòng gym

Website quản lý phòng gym, xây dựng bằng HTML5 semantic, SCSS/CSS và JavaScript thuần. Các trang chia theo nghiệp vụ: tổng quan, hội viên, check-in, gói tập, lịch lớp, thu chi và gợi ý tập luyện.

## Chạy ứng dụng

Cần có Node.js. Trong PowerShell, tại thư mục dự án:

```powershell
npm.cmd run build:css
npm.cmd run dev
```

Mở <http://localhost:8000>. Biên dịch lại SCSS sau khi sửa `src/css/styles.scss`. Có thể dùng Live Server thay cho máy chủ đi kèm. Không mở file HTML trực tiếp bằng `file://` vì ứng dụng sử dụng JavaScript modules và Fetch API.

## Chức năng

- Quản lý hội viên: thêm, sửa, xóa, tìm kiếm, lọc hội viên còn hạn/hết hạn.
- Quản lý gói tập và giá; ngăn xóa gói đang được hội viên sử dụng.
- Check-in hội viên có gói còn hiệu lực; tránh check-in trùng trong ngày.
- Lên lịch lớp, sửa/xóa lớp, theo dõi sức chứa và đăng ký học viên.
- Ghi nhận gia hạn, thanh toán, chi phí vận hành và xem tổng hợp thu chi.
- Lưu dữ liệu phòng tập bằng `localStorage`, có dữ liệu mẫu để thử.
- Đăng nhập demo bằng tài khoản `admin`, mật khẩu `123456`; đăng xuất tại thanh menu bên trái. Tính năng này chỉ lưu trạng thái ở trình duyệt, không phải xác thực bảo mật phía máy chủ.
- Fetch API công khai hiển thị gợi ý tập luyện; có trạng thái tải, timeout, kiểm tra JSON, xử lý lỗi và nút thử lại.
- Responsive cho điện thoại, máy tính bảng và desktop.

## Cấu trúc

- `src/js/main.js`: điều hướng, xử lý biểu mẫu và sự kiện.
- `src/js/store.js`: dữ liệu mẫu, xác thực nghiệp vụ và lưu trữ LocalStorage.
- `src/js/views.js`: kết xuất giao diện từng mục.
- `src/js/shell.js`: thanh điều hướng và khung dùng chung.
- `src/css/styles.scss`: style responsive; `src/css/styles.css` là bản biên dịch cho trình duyệt.

Dữ liệu hiện lưu trên trình duyệt đang sử dụng, chưa đồng bộ giữa các thiết bị hoặc có tài khoản và máy chủ.
