# LearnSprint demo production

The submission cut is `out/learnsprint-demo-live.mp4`: 150 seconds of edited **real screen recording** from the deployed AWS application in Chrome, with Amazon Polly narration and burned-in English captions. It shows the first shift, supplier delay, source-backed customer conversation, Nova 2 Lite proposal, handoff, and changed-condition replay. The first nine seconds and final fifteen seconds use promotional art. The earlier `out/learnsprint-demo.mp4` is a screenshot storyboard reference and must not be submitted.

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
