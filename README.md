# KTX An Nhiên

Ứng dụng web mẫu quản lý ký túc xá, tập trung vào các nghiệp vụ thường ngày:

- Theo dõi tổng quan số sinh viên, phòng và hóa đơn.
- Quản lý danh sách sinh viên nội trú và phòng được xếp.
- Theo dõi tình trạng phòng, sức chứa và hóa đơn hàng tháng.
- Ghi nhận thanh toán và lưu dữ liệu trên trình duyệt.

## Chạy ứng dụng

Không cần cài đặt thư viện. Mở `index.html` bằng trình duyệt hoặc chạy một máy chủ tĩnh tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Sau đó truy cập <http://localhost:8000>.

Ứng dụng khởi tạo dữ liệu minh họa và lưu các thay đổi trong `localStorage` của trình duyệt hiện tại. Đây là bản giao diện mẫu, chưa có máy chủ, đăng nhập hoặc đồng bộ dữ liệu giữa các thiết bị. Dùng nút **Khôi phục dữ liệu mẫu** ở cuối trang để xóa dữ liệu cục bộ và bắt đầu lại.
