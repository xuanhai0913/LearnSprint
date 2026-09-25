# LearnSprint

> Build a solution. Understand the result. Apply it again.

**Kế hoạch R3 — 23/09/2026:** phòng thực hành STEM có trợ lý hội thoại. Người học lập phương án cho một nhiệm vụ đời sống, quan sát kết quả, nhận hoạt động hướng dẫn phù hợp rồi thích nghi khi điều kiện thay đổi. Bài đầu tiên là PowerLab: lên lịch dùng thiết bị cho một góc học tập với giới hạn năng lượng và công suất.

**Đọc trước: [Kế hoạch tổng quan bằng tiếng Việt](docs/PLAN-VI.md).** Đã rà thể lệ, sản phẩm hiện có và các dự án hackathon tương tự. Hướng đề xuất: Alexa+ experience simulation + AWS Builder, với voice gọi công cụ thật và bằng chứng học tập có thể xem lại.

## Kế hoạch hiện tại

| Nội dung | Tài liệu |
| --- | --- |
| Ý tưởng, đối tượng, giá trị và phát triển | [Product brief](docs/product/PRODUCT-BRIEF.md) |
| Sản phẩm mạnh hiện tại và khoảng trống cần kiểm chứng | [Competitive landscape](docs/research/COMPETITIVE-LANDSCAPE.md) |
| Bài thực hành A/B/C và kết quả tham chiếu | [Mission specification](docs/product/MISSION-SPEC.md) |
| Tiêu chí cuộc thi → tính năng → bằng chứng | [Judging evidence](docs/hackathon/JUDGING-EVIDENCE.md) |
| Thể lệ, deadline và form | [Hackathon requirements](docs/hackathon/REQUIREMENTS.md) |
| Lộ trình 114 giờ + 16 giờ dự phòng | [Roadmap](docs/delivery/ROADMAP.md), [Backlog](docs/delivery/BACKLOG.md) |
| Kiến trúc và công cụ AWS | [Architecture](docs/engineering/ARCHITECTURE.md) |
| Credit $150, bảng giá và ngân sách | [AWS and costs](docs/engineering/AWS-AND-COSTS.md) |
| Thiết kế và hành trình | [Storyboard](docs/design/STORYBOARD.md), [Design system](docs/design/DESIGN-SYSTEM.md) |
| Pilot người học/giảng viên và so sánh | [User research](docs/research/USER-RESEARCH.md) |
| Checklist và hồ sơ nộp | [Checklists](docs/delivery/CHECKLISTS.md), [Submission workbook](docs/hackathon/SUBMISSION-WORKBOOK.md) |
| Bước triển khai đầu tiên | [First slice](docs/delivery/FIRST-SLICE.md) |
| Trạng thái thực tế / bàn giao | [Status](docs/delivery/STATUS.md), [Project context](docs/PROJECT-CONTEXT.md) |

Mục tiêu nội bộ: tối **22/10/2026** giờ Việt Nam. Hạn chính thức: **02:00 ngày 24/10/2026**. Rà nguồn và lịch chấm trong tài liệu thể lệ trước khi nộp.

## Những gì đã có trong code

**PowerLab A đã có bản local:** bàn lịch thiết bị, bộ tính toán W/Wh ở backend, kiểm tra nhu cầu sử dụng, đồ thị, so sánh hai lần chạy, lưu/tạm dừng/tiếp tục và bản ghi thao tác. **Đã nối điều khiển thoại tiếng Anh với Nova 2 Sonic**; một lệnh mẫu tắt quạt giờ 4 đã được lưu thật và có phản hồi thoại. Build API + web đã qua; kiểm thử luồng micro/trình duyệt và duyệt chuyên môn còn mở. Coach mới, bài B/C, báo cáo chia sẻ và AWS hosting chưa triển khai. [Bản local](docs/engineering/POWERLAB-LOCAL.md) · [Voice và bằng chứng thật](docs/engineering/VOICE-SPIKE.md).

Nền quiz React/Vite + NestJS + SQLite, nội dung REST/authentication, adapter Bedrock và ledger cũ vẫn giữ nguyên. Prototype API-permissions tại `/mission-preview` dùng gợi ý soạn sẵn và trạng thái trong tab.

Lịch sử: [API prototype storyboard](docs/design/API-PROTOTYPE-STORYBOARD.md), [R2 snapshot](docs/delivery/HISTORY-2026-09-23.md), [old verification](docs/delivery/VERIFICATION-2026-09-23.md), [five-call Bedrock evaluation](docs/delivery/LIVE-EVALUATION-2026-09-23.md). Không tính bằng chứng cũ là kiểm chứng cho tính năng mới.

## Chạy ứng dụng local

Môi trường đã dùng: Node.js 26.6.x, pnpm 10.33.0. Trong thư mục LearnSprint:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

**Mở [PowerLab](http://127.0.0.1:5173/powerlab)** và chọn **Start the practice**. API: `127.0.0.1:3001`. PowerLab lưu riêng vào `.data/powerlab.sqlite`, gắn phiên với cookie của trình duyệt; cần Save draft để lưu thay đổi trước khi rời đi. Run tự lưu lịch trước khi tính. [API mission preview](http://127.0.0.1:5173/mission-preview) giữ trạng thái trong tab và reload sẽ đặt lại. Root là luồng quiz cũ. [PowerLab boundaries](docs/engineering/POWERLAB-LOCAL.md) · [Legacy local implementation](docs/engineering/LOCAL-IMPLEMENTATION.md).

Trong bài đã lưu, **Start voice** yêu cầu quyền micro rồi mở phiên Sonic tiếng Anh tối đa 60 giây. Có thể nói “Turn off the fan for hour four”, “Run the plan” hoặc “Undo the last edit”. Cần lưu draft trước khi bật voice. Đợt local hiện tại có tổng cộng bốn lượt; một lượt đã dùng cho spike và một phiên ngắn đã dừng; lần đọc ledger gần nhất còn hai lượt. Chi phí lượt đó ước tính $0.00225955, chưa phải hóa đơn hay số dư credit. Cấu hình và giới hạn nằm trong [voice handoff](docs/engineering/VOICE-SPIKE.md).

Không xóa các SQLite database hoặc ledger để reset demo. Điều khiển thủ công và bộ tính PowerLab không gọi AWS; Start voice có gọi Bedrock khi được bật trong cấu hình local. Live mode quiz cũ có cấu hình/giới hạn riêng. Không lưu credentials, credit code hoặc thông tin đăng nhập trong repo. Cơ chế owner local chưa phải đăng nhập/identity phù hợp để mở công khai.

## Tiếp tục làm việc

Mở thư mục này làm workspace, đọc [AGENTS.md](AGENTS.md), [Status](docs/delivery/STATUS.md) và [Voice handoff](docs/engineering/VOICE-SPIKE.md). Bước tiếp theo là nối bản ghi hỗ trợ/attempt/phase và coach theo kế hoạch; hoàn tất kiểm thử khi có yêu cầu chủ động. Tài liệu kỹ thuật chủ yếu bằng tiếng Anh để dùng cho bài nộp. Các kế hoạch API B/M/P cũ đã được thay bằng E-requirements/R-backlog cho hướng giáo dục.

Đã thêm **Explore this result**: hoạt động hướng dẫn soạn sẵn theo đúng lần chạy và bản ghi yêu cầu hỗ trợ. UI ghi rõ chưa phải live AI; coach và quy tắc bài độc lập vẫn đang triển khai.
