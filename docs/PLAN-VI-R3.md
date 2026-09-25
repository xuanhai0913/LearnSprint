# LearnSprint — kế hoạch giáo dục R3

Cập nhật 23/09/2026. Hướng phát triển được chọn sau khi rà thể lệ, sản phẩm giáo dục AI và các dự án hackathon đã công bố. **PowerLab A đã có bản local và điều khiển thoại Sonic ban đầu**: lịch thiết bị, bộ tính W/Wh, kết quả/so sánh, lưu phiên và một lệnh voice đã chạy thật; build API/web đã qua. Coach mới, B/C, chia sẻ, AWS hosting và kiểm thử voice đầy đủ còn ở các bước tiếp theo. [Bản local](engineering/POWERLAB-LOCAL.md) · [Bằng chứng voice](engineering/VOICE-SPIKE.md).

## 1. Quyết định chính

**LearnSprint là phòng thực hành STEM có trợ lý hội thoại: người học xây một phương án, quan sát hệ quả, sửa cách làm và áp dụng kiến thức khi điều kiện thay đổi.**

Đối tượng đầu tiên: người học từ 18 tuổi ở các học phần STEM nhập môn hoặc đào tạo nghề, cùng giảng viên/trợ giảng hướng dẫn họ. Demo và pilot đầu tiên dùng tiếng Anh; chưa hứa voice tiếng Việt. Đây là nhóm khởi đầu để kiểm chứng sản phẩm, không phải giới hạn vĩnh viễn hoặc yêu cầu bắt buộc của cuộc thi.

Bài demo đầu tiên là **PowerLab: duy trì một góc học tập bằng nguồn pin giới hạn**. Người học sắp lịch đèn, mạng, quạt, sạc laptop; phải đáp ứng đủ nhu cầu sử dụng và hai giới hạn khác nhau: năng lượng Wh và công suất W. Có nhiều phương án đúng. Tắt hết thiết bị không hoàn thành nhiệm vụ.

Nền tảng có thể mở rộng bằng các bộ tình huống được kiểm duyệt. Một bài học hoàn chỉnh là đơn vị ra mắt; không quảng cáo rằng AI đã tạo được mọi môn học.

## 2. Nghiên cứu đã làm thay đổi điều gì?

- ChatGPT đã có học theo hướng dẫn và hình tương tác; không thể nói nó chỉ trả lời văn bản.
- Gemini đã có tài liệu môn học, chẩn đoán, bài học thích ứng và theo dõi tiến độ.
- Khanmigo đã kết hợp công cụ cho giáo viên với sơ đồ tương tác và bài tập được duyệt.
- Brilliant, PhET, Labster đặt chuẩn cao về bài học tương tác và thực hành.
- Các dự án như CounterWorlds và WrongWorlds đã khai thác hiểu lầm, mô phỏng và bài chuyển tình huống. Không dùng riêng những yếu tố này để tuyên bố ý tưởng chưa từng có.

Lợi thế cần chứng minh của LearnSprint: một bài thực hành có mục đích rõ, hành động và kết quả kiểm tra được, trợ lý điều khiển công cụ thực sự, tiến trình nối tiếp và bản ghi hữu ích cho người dạy. Đây là giả thuyết cạnh tranh, cần quan sát người dùng và so sánh công bằng.

[Bảng phân tích đối thủ, điểm mạnh và khoảng trống cần kiểm chứng](research/COMPETITIVE-LANDSCAPE.md).

## 3. Trải nghiệm người học

1. Nhận nhiệm vụ: duy trì góc học tập bốn giờ.
2. Sắp các khung giờ sử dụng thiết bị và chạy mô hình.
3. Thấy rõ phương án thiếu năng lượng, vượt công suất hay thiếu một nhu cầu sử dụng.
4. Trợ lý chọn thí nghiệm ngắn dựa trên lần chạy; người học điều chỉnh hoặc nói một lệnh cụ thể.
5. Sang tình huống mới: pin có nhiều năng lượng hơn nhưng công suất cho phép thấp hơn. Phải sửa lịch sử dụng để thích nghi.
6. Quay lại phiên khác, tiếp tục đúng phương án đã lưu; có bài ôn khác để quan sát việc vận dụng sau 24–48 giờ trong pilot.
7. Xem bản ghi hành động, gợi ý đã dùng và kết quả; chủ động chia sẻ cho giảng viên nếu muốn.

Người học không phải viết một đoạn “your thinking” để được đi tiếp. Tương tác chính là quyết định, thử nghiệm và điều chỉnh. Giải thích bằng lời có thể dùng để trao đổi với người dạy.

[Ý tưởng và định hướng sản phẩm](product/PRODUCT-BRIEF.md) · [Thông số, phương án mẫu và điều kiện đúng/sai](product/MISSION-SPEC.md).

## 4. Bám tiêu chí cuộc thi như thế nào?

Hướng tham gia: **Alexa+ experience simulation + AWS Builder**. Giáo dục được phép; không có một ngành hay đối tượng học bắt buộc. Không cần làm tất cả track để đáp ứng tiêu chí của track đã chọn.

| Tiêu chí có trọng số bằng nhau | Chúng ta cần thể hiện |
| --- | --- |
| Tech Implementation | Voice gọi công cụ thật; mô hình tính đúng; dữ liệu lưu bền; tích hợp AWS có bằng chứng |
| Design | Bài thực hành dễ hiểu, hệ quả nhìn thấy được, thao tác trực tiếp/keyboard/voice có phục hồi lỗi |
| Potential Impact | Bài toán học tập cụ thể; người học và giảng viên dùng thử; nêu kết quả và hạn chế thật |
| Quality of the Idea | Trải nghiệm liền mạch từ nhiệm vụ đời sống đến thích nghi và tiếp tục phiên học; phân biệt rõ với giải pháp hiện có |

Friction log thật, cụ thể và hữu ích có thể được xét bonus tối đa 10%. Không tự chấm 100/100 hoặc hứa chắc điểm tối đa; mỗi điểm mạnh phải có tính năng hoạt động và bằng chứng tương ứng.

[Ma trận tiêu chí → tính năng → cảnh demo → bằng chứng](hackathon/JUDGING-EVIDENCE.md) · [Thể lệ và nguồn chính thức](hackathon/REQUIREMENTS.md).

## 5. Công nghệ và vai trò thực tế

| Thành phần | Dùng để làm gì? |
| --- | --- |
| React + TypeScript | Bàn thực hành, lịch thiết bị, đồ thị và bản ghi học tập |
| NestJS + bộ tính toán độc lập | Kiểm tra W/Wh, nhu cầu sử dụng, trạng thái và quyền truy cập |
| Amazon Bedrock Nova 2 Lite | Chọn hoạt động hướng dẫn theo hành động và nguồn đã duyệt |
| Amazon Nova 2 Sonic | Nghe lệnh tiếng Anh, gọi công cụ và phản hồi bằng giọng nói |
| Strands TypeScript | Điều phối các công cụ hướng dẫn có giới hạn |
| AgentCore Runtime | Chạy kết nối thoại hai chiều khi triển khai |
| DynamoDB | Lưu phương án, lần chạy, mức trợ giúp và tiến trình giữa các phiên |
| Lambda/API Gateway, S3/CloudFront | Backend và đường vào web cho người dùng/giám khảo |

AI không tự quyết định kết quả vật lý hoặc chứng nhận học viên “thành thạo”. Trong bài làm độc lập, chỉ nhận lệnh điều khiển cụ thể; muốn gợi ý phải chuyển sang chế độ có hỗ trợ. Đây là mô hình giáo dục với thiết bị giả định, không phải hướng dẫn đấu nối điện thật.

[Kiến trúc](engineering/ARCHITECTURE.md) · [Quy tắc agent](engineering/AGENT-BEHAVIOR.md).

## 6. Khoản credit $150

Phân bổ dự kiến: $25 cho coach/nội dung/evaluation, $35 cho voice, $20 hạ tầng trước khi nộp, $25 cho giai đoạn chấm, $45 dự phòng. Với quy mô pilot và demo, có dư địa làm tích hợp thật; không cần thu nhỏ ý tưởng chỉ vì vài lần gọi model.

Đã tra bảng giá AWS hiện hành và lưu snapshot. Kịch bản minh họa theo token khoảng $0.11 tiền model cho một phiên có voice, nhưng chưa phải chi phí đo được của sản phẩm. Thời lượng nói, số lần thử, hosting và hạn credit vẫn cần theo dõi.

Đợt thử Sonic local hiện tại: tối đa bốn phiên, mỗi phiên tối đa 60 giây, tổng ngân sách dự trù $1. Một phiên với giọng đọc mẫu đã nghe đúng lệnh, lưu lịch và phản hồi thoại; ước tính token của phiên đó là $0.00225955. Còn ba lượt theo ledger ngay sau spike. Đây chưa phải chi phí cho một bài học đầy đủ hoặc xác nhận số dư credit; ledger quiz cũ được giữ nguyên.

Bạn báo đã nhận email $150; lần quan sát tài khoản trước còn yêu cầu Paid plan để redeem. Phiên này không đổi gói, không redeem và không phát sinh inference. Trước khi triển khai cần xác nhận số dư đã áp dụng, hạn dùng và dịch vụ được trả bằng credit; không tự cộng thành $250.

[Chi phí, số liệu giá, giả định và giới hạn](engineering/AWS-AND-COSTS.md).

## 7. Kế hoạch thực hiện

Tổng ước tính: **114 giờ + 16 giờ dự phòng = 130 giờ**, tương đương khoảng 30–32 giờ tập trung/tuần đến mục tiêu nội bộ. Đây là giả định năng lực, chưa phải thời gian thực tế đã đo.

| Mốc | Kết quả cần có |
| --- | --- |
| 24–30/09 | Duyệt bài học; bàn thực hành A chạy thật; lưu/khôi phục; thử khả thi một lệnh voice sớm |
| 01–05/10 | Coach thật, voice, bài B/C và quy tắc hỗ trợ |
| 06–09/10 | Bản ghi cho giảng viên; triển khai AWS; đường vào riêng cho từng người |
| 10–16/10 | Kiểm tra được yêu cầu, pilot 6–8 người học/2 người dạy, bài ôn trễ; sửa vấn đề quan sát được |
| 17–18/10 | Chốt tính năng; hoàn thiện bản release và cách chạy |
| 19–21/10 | Video thật khoảng 2:45, ảnh, bài giới thiệu tiếng Anh, feedback, repo và form |
| Tối 22/10 | Mục tiêu nộp nội bộ và xác nhận đã nộp |

**Hạn chính thức: 02:00 ngày 24/10/2026, giờ Việt Nam.** Giữ đường đánh giá hoạt động qua hết kỳ chấm. Không đợi sát hạn mới làm video hoặc kiểm tra quyền repo.

Import tài liệu giáo viên, bản tiếng Việt, thêm môn và công cụ giao bài là phần sau khi luồng chính đạt yêu cầu. Khoản tiền dư không làm những phần này tự có thêm thời gian phát triển.

[Lộ trình chi tiết](delivery/ROADMAP.md) · [Backlog có giờ và phụ thuộc](delivery/BACKLOG.md) · [Checklist](delivery/CHECKLISTS.md).

## 8. Form và bước tiếp theo

Cần hoàn thiện draft Devpost, repo GitHub và quyền/license, video công khai dưới ba phút, mô tả tiếng Anh, track/AWS explanation, feedback công cụ và thông tin đánh giá. Không cần xin lại credit chỉ để tiếp tục kế hoạch. Chưa có form nào được nộp trong phiên sửa tài liệu này.

Bàn thực hành A, backend tính toán/lưu dữ liệu và điều khiển thoại ban đầu đã được viết, build thành công. Một lệnh mẫu “Turn off the fan for hour four” đã lưu thật qua Sonic; Chrome đã hiển thị nút Start voice trên bài đã lưu. **Tiếp theo: thêm bản ghi hỗ trợ/attempt/phase, rồi nối coach dựa trên kết quả thực**, đồng thời duyệt chuyên môn/discovery. Micro/playback trong trình duyệt, các lệnh voice khác và kiểm thử tương tác/đồng bộ/keyboard còn cần xác nhận. Code quiz và API preview vẫn là nền cũ; không tính chúng là đã hoàn thành bản giáo dục R3.

[Bước triển khai đầu tiên](delivery/FIRST-SLICE.md) · [Workbook nộp bài](hackathon/SUBMISSION-WORKBOOK.md) · [Trạng thái thật](delivery/STATUS.md).
