# LearnSprint — thực tập trong công việc mô phỏng

Cập nhật 24/09/2026, hướng R4. Bạn đã chọn **option 1**, sau đó chọn **điều phối vận hành: xử lý đơn hàng, khách hàng và sự cố giao hàng**. Đây là hướng sản phẩm hiện tại. PowerLab được giữ làm nguyên mẫu kỹ thuật. Bản nghề nghiệp local đầu tiên đã có tại `/career`; C06–C07 đã có source cho câu hỏi/voice, đề xuất sửa đơn, hướng dẫn và lịch sử trợ giúp; chưa chạy model thật cho luồng career.

## Cập nhật triển khai AWS — 24/09

Bạn đã chọn bỏ test/build nặng trên máy và dùng URL HTTPS do AWS cấp. Server nhỏ đã được tạo tại Sydney, Docker build đã thành công trên AWS; CloudFront đang được cấu hình. Server local đã tắt, dữ liệu giữ nguyên. Chưa có bằng chứng demo online hoạt động. Credit Free plan vừa xác nhận là $120; voucher $150 chưa xác nhận đã nạp. Chi phí nền ước tính khoảng $25,80/tháng trước lưu lượng/AI. Không nâng cấp tài khoản.

## 1. Ta đang xây gì?

**Một nơi để sinh viên và người mới đi làm thử xử lý một ca làm việc trước khi gặp nó ngoài đời.** Người học nhận nhiệm vụ, kiểm tra hồ sơ, hỏi người liên quan, thao tác trên công cụ, xử lý biến cố và bàn giao công việc.

Đối tượng đầu tiên: người từ 18 tuổi chuẩn bị vào vị trí hỗ trợ đơn hàng/vận hành. Giá trị cần kiểm chứng: kiểm tra thông tin, hỏi đúng người, đưa ra cam kết khả thi và điều chỉnh khi dữ kiện đổi. Đây không phải kỳ thực tập được công nhận, bài tuyển dụng hay chứng nhận năng lực.

## 2. Nhiệm vụ “Ca trực đầu tiên”

Bạn phụ trách ba đơn hàng tại nhà cung cấp văn phòng phẩm giả định:

- A cần 30 bộ trước 14:00 hôm nay cho workshop.
- B đặt 30 bộ trước 18:00 hôm nay.
- C cần 20 bộ trước trưa mai.

Kho có 40 bộ và dự kiến nhận thêm 40 bộ lúc 11:00. Có chuyến nhanh, chuyến thường chiều nay và chuyến thường sáng mai, với giờ chốt, sức chứa, giờ đến và phí rõ ràng.

Sau khi bạn lập phương án và bấm bắt đầu ca, hệ thống báo **lô bổ sung trễ đến 17:00**. Bạn xác định đơn bị ảnh hưởng, hỏi khách về phương án khác, sửa phân bổ và để lại bản bàn giao.

B có thể đồng ý nhận 10 bộ hôm nay và 20 bộ trước trưa mai nếu bạn hỏi; hệ thống phải ghi nhận thỏa thuận. AI không được tự bịa rằng khách đồng ý hay kho có thêm hàng.

Các con số/quy tắc là giả định, chưa được người làm vận hành duyệt. [Đặc tả nhiệm vụ](career/MISSION-SPEC.md).

## 3. Trải nghiệm trên web

1. Mở ca làm và xem mục tiêu.
2. Làm việc trên **bảng đơn hàng**, thông tin kho và lịch giao.
3. Trao đổi với người kho, khách B hoặc trưởng ca bằng voice/text; có nút thao tác tương đương.
4. Lập phương án và xem điều kiện đáp ứng/chưa đáp ứng.
5. Xử lý thông báo trễ hàng, sửa kế hoạch, xác nhận cam kết trong mô phỏng.
6. Xem bản bàn giao: thông tin đã xác nhận, kế hoạch và việc còn vướng.
7. Thử biến thể mới; nếu xin hướng dẫn thì ghi nhận có hỗ trợ.

**Đã triển khai ở local:** bảng đơn, review, ghi nhận phương án, biến cố, ba vai kho/khách/trưởng ca bằng câu hỏi định sẵn có nguồn, thỏa thuận và bàn giao. C06 bổ sung Nova 2 Lite để hiểu câu hỏi và Nova 2 Sonic để nhận giọng nói. Câu trả lời trên màn hình dùng dữ kiện đã soạn và lưu nguồn. Yêu cầu sửa một ô phân bổ tạo bản xem trước; bạn tự bấm áp dụng hoặc hoàn tác. C07 đã có hướng dẫn gắn với review, tùy chọn AI chọn hoạt động và lịch sử trợ giúp. Phản hồi bằng giọng nói cần người học bật riêng sau khi đã ghi nhận xin hướng dẫn. C08 đã có bài mới với tồn kho và yêu cầu khách B khác, báo cáo bằng chứng và tải JSON. Kiểm tra hành vi thực tế còn mở.

Không bắt viết “your thinking” để đi tiếp. Demo đầu bằng tiếng Anh; không chấm accent, giọng nói hay độ tự tin.

## 4. AI và AWS làm gì?

| Thành phần | Công việc dự kiến |
| --- | --- |
| Nova 2 Sonic | Hội thoại tiếng Anh theo vai, nhận lệnh công cụ có ngữ cảnh |
| Nova 2 Lite | Hiểu câu hỏi/lệnh để chọn dữ kiện hoặc tạo đề xuất sửa đơn; coach dựa trên bằng chứng là bước sau |
| NestJS + bộ mô phỏng | Tính tồn kho theo thời điểm, phí/sức chứa, khả thi của cam kết và biến cố |
| React | Bàn làm việc, nguồn thông tin, hội thoại và bàn giao |
| SQLite trên ổ đĩa bền vững; DynamoDB là hướng mở rộng | Lưu trạng thái, hành động, thỏa thuận và trợ giúp |
| EC2 + Caddy HTTPS + EBS | Phương án demo đầu; cấu hình đã soạn, chưa deploy. Hướng nhiều dịch vụ để sau |

Hỏi nhân vật về dữ kiện công việc khác với xin coach chỉ cách giải. Bản làm độc lập bắt đầu bằng phản hồi nhân vật soạn sẵn để tránh gợi ý ngoài ý muốn. Mọi tin nhắn/đơn hàng/chuyến giao đều giả lập; không gửi email, mua hàng hay liên hệ khách thật. [Hợp đồng kỹ thuật](career/TECHNICAL-CONTRACT.md).

## 5. Phạm vi hackathon

Làm sâu **một vai trò + một ca 12–15 phút mục tiêu + một biến cố + một lần thử tình huống khác + một bản bàn giao**. Chưa xây nhiều nghề hoặc kết nối doanh nghiệp thật.

Forage đã có mô phỏng nghề nghiệp. Giả thuyết của ta là trải nghiệm ngắn, nhân vật phản ứng theo dữ kiện, thao tác ảnh hưởng công việc và bằng chứng dễ xem lại có ích với nhóm học viên này. Cần phản hồi thực tế; không tuyên bố phát minh ra mô phỏng hay bảo đảm điểm tối đa.

Hướng dự thi vẫn là Alexa+ experience simulation + AWS Builder. [Kế hoạch, luồng màn hình và ma trận bằng chứng](career/DELIVERY-PLAN.md).

## 6. Tận dụng code và thứ tự làm

Giữ nền React/NestJS, kinh nghiệm lưu phiên/revision/idempotency, bản ghi và transport Sonic. Giữ nguyên các prototype và ledger. Bộ tính điện và lệnh bật/tắt không phải engine đơn hàng.

1. C01–C04 đã có source ban đầu: nội dung có phiên bản, evaluator, bảng `/career`, lưu phiên, review và biến cố. Biên dịch thành công; chưa kiểm thử nghiệp vụ/luồng đầy đủ.
2. C05 đã có ba contact kho/khách/trưởng ca, câu hỏi định sẵn, phản hồi có nguồn và lịch sử dữ kiện; thỏa thuận B vẫn cần thao tác ghi nhận riêng. [Chi tiết](career/ACTOR-CONVERSATIONS.md).
3. C06 đã có adapter text/voice, ticket theo vai, ledger riêng, đề xuất một ô và Apply/Undo; API/web biên dịch thành công. Chưa kiểm tra model/luồng career thực tế. C07 cũng đã có source: trạng thái guided/assisted, lịch sử cũ chưa rõ, năm hoạt động soạn sẵn, AI chọn trọng tâm và số lần trợ giúp trong review/bàn giao. [Chi tiết C06](career/AI-CONVERSATION.md).
4. C08 đã có source: bài thay đổi điều kiện, báo cáo bằng chứng và lịch sử trợ giúp riêng; API/web biên dịch thành công. C09 đã deploy bản demo trên EC2 Sydney qua CloudFront HTTPS, không cần đăng nhập theo lựa chọn mới của chủ dự án và có chi phí nền ước tính khoảng $25.80/tháng trước lưu lượng/AI. Một lượt Nova 2 Lite hỏi tồn kho đã thành công và lưu biên nhận; Chrome mở trực tiếp đã hiển thị trang First Shift; công cụ điều khiển Chrome vẫn báo `ERR_BLOCKED_BY_CLIENT`, nên hành trình đầy đủ và microphone chưa được xác nhận. [C07 và giới hạn](career/COACHING.md).
5. C10–C11: kiểm tra khi được yêu cầu, phản hồi người dùng, sửa lỗi, video và hồ sơ nộp.

Tạm dừng mở rộng tính năng vật lí. R3 130 giờ là ước tính lịch sử; cần ước tính lại R4 sau lát cắt đầu tiên.

## 7. Deadline, chi phí và trạng thái

Mục tiêu nội bộ: tối **22/10/2026**. Hạn chính thức gần nhất: **02:00 ngày 24/10/2026 Việt Nam**; rà lại [thể lệ](hackathon/REQUIREMENTS.md) tại bước nộp.

Bạn báo có $150 credit; số dư đã redeem/hạn dùng chưa xác nhận mới. Không gọi model, đổi gói, triển khai hay nộp form trong kế hoạch R4 và bản career local đầu tiên. Ledger Sonic gần nhất còn hai trong bốn lượt; đây không phải số dư tiền. [Chi phí](engineering/AWS-AND-COSTS.md).

**Đã có:** kế hoạch R4, engine/UI nghề nghiệp local, lưu trạng thái, biến cố, ba vai phản hồi có nguồn, thỏa thuận B, bàn giao cơ bản và source C06–C07 cho text/voice, đề xuất/áp dụng/hoàn tác, coach và bản ghi trợ giúp. **Chưa xác minh:** model, mic/đọc thoại, luồng C05–C07 và chất lượng hướng dẫn ngoài thực tế. **C08 đã có source:** biến thể mới bắt đầu chưa xin hướng dẫn, báo cáo và tải JSON; hành vi chưa kiểm chứng. **Chưa có:** pilot, bản deploy hoặc bộ nộp R4.

Đã cấu hình riêng tối đa **10 lượt text dùng chung cho nhân vật/coach / $0.20 + 4 phiên voice / $1.00**, tối đa 60 giây/phiên. $1.20 là mức giữ chỗ của ứng dụng, không phải chi phí đã dùng hay bảo đảm hóa đơn. Lượt triển khai này chưa gọi model. Không dùng lại/reset ledger quiz hoặc PowerLab. [Chi tiết triển khai](career/LOCAL-IMPLEMENTATION.md). [Trạng thái thực tế](delivery/STATUS.md).
