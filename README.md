# LearnSprint

> Practice the work before the first job.

**R4 — 25/09/2026:** học qua công việc mô phỏng. Bạn đã chọn **điều phối vận hành**, xử lý đơn hàng, khách hàng và sự cố giao hàng. Bài đầu tiên: **First Shift — Ca trực đầu tiên**. Bản demo hiện chạy trên AWS tại [LearnSprint First Shift](https://d2g4a2ezl5lw7r.cloudfront.net/career); các nguyên mẫu trước được giữ lại.

Mã nguồn công khai: [GitHub](https://github.com/xuanhai0913/LearnSprint), giấy phép [MIT](LICENSE). Đây là mô phỏng trải nghiệm Alexa+ trên web cho hackathon; không phải tích hợp hoặc chứng nhận Alexa+ gốc.

**For judges / English:** [Reviewer guide](docs/hackathon/REVIEWER-GUIDE.md) · [submission story](docs/hackathon/SUBMISSION-WORKBOOK.md) · [demo script](docs/hackathon/DEMO-SCRIPT.md) · [current evidence](docs/hackathon/JUDGING-EVIDENCE.md).

## Kế hoạch hiện tại

| Nội dung | Tài liệu |
| --- | --- |
| Tổng quan tiếng Việt | [PLAN-VI](docs/PLAN-VI.md) |
| Ý tưởng, đối tượng, giá trị cần chứng minh | [Career brief](docs/career/PRODUCT-BRIEF.md) |
| Ba đơn hàng, sự cố, nhân vật và kết quả | [Career mission](docs/career/MISSION-SPEC.md) |
| Công cụ, dữ liệu, AI và tái sử dụng | [Technical contract](docs/career/TECHNICAL-CONTRACT.md) |
| Luồng màn hình, C-backlog, demo và tiêu chí | [Delivery plan](docs/career/DELIVERY-PLAN.md) |
| Thể lệ và deadline | [Hackathon requirements](docs/hackathon/REQUIREMENTS.md) |
| Mã nguồn và giới hạn bản local | [Local implementation](docs/career/LOCAL-IMPLEMENTATION.md), [Actor conversations](docs/career/ACTOR-CONVERSATIONS.md), [AI input & proposals](docs/career/AI-CONVERSATION.md), [Coaching](docs/career/COACHING.md), [Replay & report](docs/career/REPLAY-AND-REPORT.md) |
| Chuẩn bị demo AWS | [Deployment runbook](deploy/README.md) |
| Trạng thái / bàn giao | [Status](docs/delivery/STATUS.md), [Context](docs/PROJECT-CONTEXT.md) |
| Bộ chuẩn bị nộp hackathon | [Submission workbook](docs/hackathon/SUBMISSION-WORKBOOK.md), [R4 demo script](docs/hackathon/DEMO-SCRIPT.md) |

Người học lập kế hoạch giao hàng, kiểm tra thông tin, hỏi nhân vật, xử lý hàng về trễ và bàn giao công việc. AI diễn vai/hướng dẫn; quy tắc hệ thống quyết định tính khả thi. Một vai trò được làm sâu trước khi mở rộng. Không tuyên bố là thực tập được công nhận hoặc công cụ tuyển dụng.

## Code hiện có

- `/powerlab`: bài STEM trước đó, lịch thiết bị, bộ tính W/Wh, lưu phiên, so sánh, hướng dẫn soạn sẵn và voice ban đầu. [Chi tiết](docs/engineering/POWERLAB-LOCAL.md).
- Một lệnh giọng đọc mẫu đã thực hiện thay đổi thật qua Sonic. [Bằng chứng](docs/engineering/VOICE-SPIKE.md).
- `/mission-preview`: prototype API permissions. `/`: quiz cũ.
- `/career`: bảng đơn hàng, evaluator tồn kho theo giờ, lưu phiên, ghi nhận phương án, biến cố trễ hàng, ba vai trao đổi bằng câu hỏi định sẵn kèm nguồn, thỏa thuận chia đợt và bàn giao. C06 bổ sung Nova 2 Lite/Sonic cho câu hỏi, voice input và đề xuất sửa một ô có Apply/Undo. C07 thêm hướng dẫn gắn với review, AI chọn trọng tâm và lịch sử trợ giúp. C08 thêm bài thay đổi điều kiện, lịch sử trợ giúp riêng và báo cáo bằng chứng có tải JSON. Trên AWS đã quan sát một ca trực hoàn chỉnh, một replay, hướng dẫn, Lite focus, Apply/Undo, reload và một lần restart container. Voice Sonic trên Chrome chưa có receipt hoàn chỉnh; xem [status](docs/delivery/STATUS.md) để phân biệt rõ bằng chứng và phần còn mở.

Nền React/NestJS, lưu trạng thái và transport voice có thể tận dụng. Dữ liệu/ledger cũ giữ nguyên. Mô phỏng đơn hàng cần engine và công cụ riêng.

## Chạy nguyên mẫu local

Node.js 26.6.x, pnpm 10.33.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Mở [First Shift](http://127.0.0.1:5173/career) để xem bản nghề nghiệp. Luồng thao tác/câu hỏi định sẵn không cần AWS credentials. API: `127.0.0.1:3001`. AI chỉ gọi AWS khi bật cấu hình riêng và chủ động bấm Ask/Start voice. Máy hiện tại đã có allowance career riêng, xem [cấu hình và giới hạn](docs/career/AI-CONVERSATION.md). Không xóa ledger để reset lượt; không lưu credentials/credit code trong repo. Owner local chưa phải đăng nhập để mở công khai.

## Tiếp tục

C09 đã deploy bằng CloudFront HTTPS, EC2 và dữ liệu ngoài container. Máy chưa có Docker local; các image được build trên AWS. Tiếp theo: chẩn đoán voice mà không tiêu thêm lượt Sonic, kiểm tra nội dung cùng người có kinh nghiệm vận hành, quan sát người học, chuẩn bị repo/video công khai và hoàn tất Devpost. Bộ nháp nộp hiện phản ánh R4; chưa có video hoặc submission hoàn tất. Đọc [AGENTS](AGENTS.md) và [status](docs/delivery/STATUS.md) trước khi thay đổi hay công bố claim.

Mục tiêu nội bộ: tối 22/10/2026 Việt Nam; hạn chính thức gần nhất: 02:00 ngày 24/10/2026. Rà nguồn tại bước nộp. [README R3 lịch sử](README-R3.md).
