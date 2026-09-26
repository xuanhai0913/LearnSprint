# LearnSprint demo production

## Current owner-review cut — v4 MCP

`out/learnsprint-demo-v4-mcp.mp4`: 169.458 seconds, Full HD, English/Vietnamese subtitles. The learning-flow scene is replaced with a labeled visualization of the real saved MCP-client response. Original app footage and branding remain. Awaiting owner approval; YouTube still hosts v3.

Published owner-approved v3: https://www.youtube.com/watch?v=gXUtlRcYEUE. Devpost video URL saved on 2026-09-26. Final competition submission remains blocked by the newly identified MCP/Agent Skill track requirement; see `../docs/hackathon/REQUIREMENTS.md`. Earlier review gates below describe production history.

## Current review cut — v3 (branded opening)

`out/learnsprint-demo-v3-branded.mp4` adds a 9.54-second animated opening naming **Nguyễn Xuân Hải**, with official AWS Cloud, Amazon Bedrock, Amazon Nova, Amazon EC2 and Amazon CloudFront icons and their roles. Total: approximately **2:50.46**, Full HD, bilingual captions and male English narration. The original v2 export is preserved. Source attribution is in `public/brand/aws/SOURCES.md`. The current script and timeline retain their v2 filenames; the renderer now exports v3. Owner review is still required before publication.

## Previous review cut — v2

`out/learnsprint-demo-v2-bilingual.mp4` is the current owner-review export: approximately 2:41, 1920×1080, 24 fps, H.264/AAC. It combines the original three real AWS screen recordings with animated problem cards, a learning-flow diagram, a stock-delay explanation and an AWS architecture diagram. Camera framing moves toward the relevant source facts, customer agreement and human Apply action.

Narration uses **en-SG-WayneNeural**, a male Singapore English voice. It is not presented as a Vietnamese accent. English and Vietnamese subtitles are burned into the video; separate SRT files are in `public/audio/v2/`. The script, translations and source edit ranges are in `production-v2.json`; aligned timing is in `src/production-v2-timeline.json`.

This version is **awaiting owner review**. Do not upload to YouTube or submit to Devpost until the owner approves the revised cut. Earlier screenshot and live v1 edits remain references.

### Reproduce v2

From the repository root, with Python, Pillow, edge-tts and FFmpeg available:

```sh
python3 video/scripts/prepare-v2.py
python3 video/scripts/render-v2.py --preview
python3 video/scripts/render-v2.py
```

Audio preparation reuses existing MP3 segments. Generating missing audio sends only the public fictional narration to the Edge TTS service. The renderer uses two encoding threads and does not build or launch the web app. After changing an existing scene, use `--force` to refresh cached segments (or `--scene SCENE_ID` before the full export). Raw recordings and final videos remain local under ignored directories. See [v2 editorial notes](PRODUCTION-V2.md).

## Previous live edit — v1

The previous v1 cut is `out/learnsprint-demo-live.mp4`: 150 seconds of edited **real screen recording** from the deployed AWS application in Chrome, with Amazon Polly narration and burned-in English captions. It shows the first shift, supplier delay, source-backed customer conversation, Nova 2 Lite proposal, handoff, and changed-condition replay. The first nine seconds and final fifteen seconds use promotional art. The earlier `out/learnsprint-demo.mp4` is a screenshot storyboard reference and must not be submitted.

## Finished assets

- GPT Image title art: `public/brand/learnsprint-banner.png`; Devpost thumbnail: `../docs/hackathon/media/learnsprint-thumbnail.png`.
- Amazon Polly neural English narration: `public/audio/narration.en.mp3` (Joanna, 126 seconds).
- Polly speech marks: `public/audio/speechmarks.ndjson`.
- English SRT: `public/audio/captions.en.srt`; Remotion timeline: `src/timeline.json`.
- Authentic deployed landing screenshot: `../docs/hackathon/media/learnsprint-live-landing.png`. This is a still image, not evidence of the full interaction.
- Selected live AWS screenshots: `public/stills/`. They contain only the fictional app UI, not AWS Console or private account details.
- Real screen recordings: `public/footage/live-01.mov`, `live-02.mov`, `live-03.mov` (ignored by Git).
- Submission MP4: `out/learnsprint-demo-live.mp4` (150 seconds, 1280×720 H.264/AAC). `out/` is intentionally ignored by Git.

The submission cut is 150 seconds: nine seconds of title art, 126 seconds of narrated moving app footage, then fifteen seconds for the URL/end card. It is 1280×720 at 24 fps and fits the competition's three-minute limit. `scripts/render-live.py` contains the edit decisions. The Remotion composition remains an editable storyboard reference.

## Storyboard and source captures

The stills below document the storyboard. The submission uses actual recorded interactions from the same deployed app. Raw screen recordings under `public/footage/` are ignored; they stay local to avoid publishing unrelated browser details.

| Scene | Authentic UI shown | Approx. narration position |
| --- | --- | --- |
| `01-hook.png` | Public First Shift landing | 0–10 s |
| `02-brief.png` | Alex's saved source-backed stock answer | 10–24 s |
| `03-plan.png` | A/B/C allocation board | 24–39 s |
| `04-incident.png` | Supplier delay to 17:00, disclosed by Alex | 39–51 s |
| `05-agreement.png` | Jordan's offer, then the recorded agreement and recovery review | 51–66 s |
| `06-handoff.png` | Saved First Shift evidence report | 66–79 s |
| `07-replay.png` | Fresh linked replay and two-situation comparison | 79–95 s |
| `08-ai.png` | Real Lite proposal, Apply and Undo states | 95–110 s |
| `09-close.png` | Saved outcome, followed by concept end card | 110–126 s |

The live footage includes one bounded Lite text request on an assisted first shift. Its exact proposed cell and Apply action are visible. The cut revisits this earlier footage after the replay to explain Nova; it is an edited walkthrough, not a claim of one uninterrupted session. Use the [full storyboard](../docs/hackathon/DEMO-SCRIPT.md) and [evidence map](../docs/hackathon/JUDGING-EVIDENCE.md).

Keep the source labels and outcome claims aligned with what the recording actually shows. The video does not show AWS Console, real orders, or private credentials.

## Edit and export

The compact render needs FFmpeg and Python with Pillow. It does not build the LearnSprint web app:

```sh
python3 scripts/render-live.py
```

The editable Remotion composition is a separate video workspace:

```sh
cd video
pnpm install --ignore-workspace --frozen-lockfile
pnpm --ignore-workspace studio
pnpm --ignore-workspace render
```

Inspect the whole video for caption timing, audible speech, truthful UI captures and readability. Check `ffprobe` duration under 180 seconds; then upload `out/learnsprint-demo-live.mp4` publicly to YouTube or Vimeo and paste its URL into Devpost. The English captions are burned in, and `public/audio/captions.en.srt` is available separately. Do not upload the still-based storyboard cut.

The Polish of the narration can be adjusted in `narration.json`, but regenerated audio and speech marks would incur a new Polly batch. Keep the existing verified audio unless a concrete issue warrants rerendering.
