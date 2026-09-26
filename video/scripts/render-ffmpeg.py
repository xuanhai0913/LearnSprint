"""Render a compact narrated video from authentic AWS UI stills and timed captions."""
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = ROOT / "out"
FRAMES = OUT / "frames"
FRAMES.mkdir(parents=True, exist_ok=True)
timeline = json.loads((ROOT / "src/timeline.json").read_text())

WIDTH, HEIGHT = 1280, 720
GREEN, PAPER = "#253c34", "#f7f4ed"
FONT_FILE = Path("/System/Library/Fonts/Supplemental/Arial.ttf")
FONT_BOLD_FILE = Path("/System/Library/Fonts/Supplemental/Arial Bold.ttf")
font_title = ImageFont.truetype(str(FONT_BOLD_FILE), 27)
font_label = ImageFont.truetype(str(FONT_FILE), 18)
font_caption = ImageFont.truetype(str(FONT_BOLD_FILE), 28)
focus_y = {
    "hook": 0.35, "brief": 0.5, "plan": 0.05, "incident": 0.5,
    "agreement": 0.75, "handoff": 0.9, "replay": 0.9,
    "ai": 0.7, "close": 0.9,
}
cuts = {67000, 70000, 96000, 111000, 115000}


def scene_asset(scene: dict, ms: int) -> tuple[str, float]:
    if scene["id"] == "agreement":
        if ms >= 70000:
            return "stills/05-recovery-review.png", 0.65
        if ms >= 67000:
            return "stills/05-agreement-recorded.png", 0.85
    if scene["id"] == "replay" and ms < 96000:
        return "stills/07-replay-open.png", 0.05
    if scene["id"] == "ai":
        if ms >= 115000:
            return "stills/08-ai-undone.png", 0.7
        if ms >= 111000:
            return "stills/08-ai-applied.png", 0.7
    return scene["footage"], focus_y[scene["id"]]


def fit(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(box, Image.Resampling.LANCZOS)
    return copy


def caption_lines(draw: ImageDraw.ImageDraw, value: str) -> list[str]:
    lines = []
    current = ""
    for word in value.split():
        candidate = f"{current} {word}".strip()
        if current and draw.textbbox((0, 0), candidate, font=font_caption)[2] > WIDTH - 100:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def frame_for(ms: int) -> Image.Image:
    scene = next((s for s in timeline["scenes"] if s["startMs"] <= ms < s["endMs"]), None)
    asset, vertical_focus = scene_asset(scene, ms) if scene else ("brand/learnsprint-banner.png", 0.5)
    source = PUBLIC / asset
    with Image.open(source) as original:
        image = original.convert("RGB")
    canvas = Image.new("RGB", (WIDTH, HEIGHT), PAPER)
    if scene is None:
        image = fit(image, (WIDTH, HEIGHT))
        canvas.paste(image, ((WIDTH - image.width) // 2, (HEIGHT - image.height) // 2))
    else:
        image = ImageOps.fit(image, (WIDTH - 32, 555), Image.Resampling.LANCZOS,
                             centering=(0.5, vertical_focus))
        canvas.paste(image, (16, 63))
    draw = ImageDraw.Draw(canvas)
    if scene is not None:
        draw.rectangle((0, 0, WIDTH, 62), fill=GREEN)
        draw.text((28, 16), scene["title"], font=font_title, fill="white")
        label = "AWS DEMO · UI CAPTURE"
        label_width = draw.textbbox((0, 0), label, font=font_label)[2]
        draw.text((WIDTH - label_width - 28, 21), label, font=font_label, fill="#d4e2d6")
    caption = next((c["text"] for c in timeline["captions"] if c["startMs"] <= ms < c["endMs"]), None)
    if caption:
        draw.rectangle((0, 618, WIDTH, HEIGHT), fill=GREEN)
        lines = caption_lines(draw, caption)
        y = 618 + (102 - len(lines) * 34) // 2
        for line in lines:
            width = draw.textbbox((0, 0), line, font=font_caption)[2]
            draw.text(((WIDTH - width) // 2, y), line, font=font_caption, fill="white")
            y += 34
    elif ms >= timeline["scenes"][-1]["endMs"]:
        draw.rectangle((0, 634, WIDTH, HEIGHT), fill=GREEN)
        value = "Try the live demo: d2g4a2ezl5lw7r.cloudfront.net/career"
        text_width = draw.textbbox((0, 0), value, font=font_title)[2]
        draw.text(((WIDTH - text_width) // 2, 660), value, font=font_title, fill="white")
    return canvas


boundaries = {0, timeline["durationMs"], *cuts}
for scene in timeline["scenes"]:
    boundaries.update((scene["startMs"], scene["endMs"]))
for caption in timeline["captions"]:
    boundaries.update((caption["startMs"], caption["endMs"]))
times = sorted(boundaries)
sequence = OUT / "sequence.ffconcat"
with sequence.open("w") as file:
    file.write("ffconcat version 1.0\n")
    for i, (start, end) in enumerate(zip(times, times[1:])):
        name = FRAMES / f"{i:03d}.png"
        frame_for(start).save(name, optimize=True)
        file.write(f"file '{name}'\n")
        file.write(f"duration {(end - start) / 1000:.3f}\n")
    file.write(f"file '{name}'\n")

destination = OUT / "learnsprint-demo.mp4"
subprocess.run([
    "ffmpeg", "-y", "-loglevel", "warning", "-f", "concat", "-safe", "0",
    "-i", str(sequence), "-itsoffset", str(timeline["introMs"] / 1000),
    "-i", str(PUBLIC / "audio/narration.en.mp3"),
    "-map", "0:v", "-map", "1:a", "-vf", "fps=24",
    "-af", "apad", "-t", str(timeline["durationMs"] / 1000),
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart", str(destination),
], check=True)
print(destination)
