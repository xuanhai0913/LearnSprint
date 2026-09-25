# LearnSprint demo production

The narration and English subtitles are complete. **The nine live-app clips are not recorded yet**, because Chrome currently returns `ERR_BLOCKED_BY_CLIENT` when the browser-control connection navigates to the deployed CloudFront URL. A user-opened tab displayed the landing page and yielded one clean, authentic screenshot; entering a saved shift was blocked again. The Remotion composition displays an explicit `SCENE TO RECORD` label anywhere real footage is missing. Do not upload this intermediate render as a working-demo video.

## Finished assets

- GPT Image title art: `public/brand/learnsprint-banner.png`; Devpost thumbnail: `../docs/hackathon/media/learnsprint-thumbnail.png`.
- Amazon Polly neural English narration: `public/audio/narration.en.mp3` (Joanna, 126 seconds).
- Polly speech marks: `public/audio/speechmarks.ndjson`.
- English SRT: `public/audio/captions.en.srt`; Remotion timeline: `src/timeline.json`.
- Authentic deployed landing screenshot: `../docs/hackathon/media/learnsprint-live-landing.png`. This is a still image, not evidence of the full interaction.

The composition is 150 seconds, 1920×1080 at 30 fps. It begins with nine seconds of title art, plays the 126-second narration with measured captions, then leaves fifteen seconds for the URL/end card. This stays below the competition's three-minute video limit. The generated cover art is promotional illustration; only real app footage should demonstrate interactions.

## Record the nine scenes

Open the deployed `/career` experience in Chrome after the block is resolved. Record the browser viewport at 1920×1080 or another 16:9 size, 30 fps, with the cursor visible and browser notifications hidden. Use fictional test data only. Save H.264 MP4 clips under `public/footage/`:

| Clip | Record the real UI | Approx. narration position |
| --- | --- | --- |
| `01-hook.mp4` | Public landing and create a fresh First Shift | 0–10 s |
| `02-brief.mp4` | Three orders; ask Alex the listed stock question; open source facts | 10–24 s |
| `03-plan.mp4` | Enter A 30 Express today, B 30 Standard today, C 20 Standard tomorrow; Review and record | 24–39 s |
| `04-incident.mp4` | Start shift; show supplier ETA change to 17:00 and stale earlier review | 39–51 s |
| `05-agreement.mp4` | Ask Jordan about B split, record the agreement, set B 10 today and 20 tomorrow; Review | 51–66 s |
| `06-handoff.mp4` | Record recovery plan and save handoff | 66–79 s |
| `07-replay.mp4` | Open linked replay and show changed stock, separate history and comparison report | 79–95 s |
| `08-ai.mp4` | In the saved assisted shift, show the existing Lite proposal Apply/Undo record | 95–110 s |
| `09-close.mp4` | Real demo landing/report plus concise architecture card | 110–126 s |

No new paid model call is required for the AI shot if the saved assisted shift is available. If a full interaction takes longer than its narration slot, capture it fully and select a truthful speed-up with an on-screen `TIME COMPRESSED` label. Keep the clicks, results and source labels readable. Do not fabricate missing output. Use the [full storyboard](../docs/hackathon/DEMO-SCRIPT.md) and [evidence map](../docs/hackathon/JUDGING-EVIDENCE.md).

After each real clip exists, add its scene ID to `footageAvailable` in `src/video.tsx`. Verify the clip's first and last frames match the script. If clips have embedded audio, this template mutes them so narration stays clear; add deliberate UI sound only after reviewing the mix.

## Edit and export

This is a separate video workspace, so installing its dependencies does not rebuild the LearnSprint web app:

```sh
cd video
pnpm install --ignore-workspace --frozen-lockfile
pnpm --ignore-workspace studio
pnpm --ignore-workspace render
```

The MP4 renders to `video/out/learnsprint-demo.mp4`. Inspect the whole video for caption timing, audible speech, truthful UI footage and readability. Check `ffprobe` duration under 180 seconds; then upload the final video publicly to YouTube or Vimeo and paste its URL into Devpost. Attach `public/audio/captions.en.srt` as external subtitles if the host supports it; captions are also burned into the Remotion frames.

The Polish of the narration can be adjusted in `narration.json`, but regenerated audio and speech marks would incur a new Polly batch. Keep the existing verified audio unless a concrete issue warrants rerendering.
