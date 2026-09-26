"""Edit the real AWS browser screen recording into a narrated demo."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
OUT = ROOT / "out"
WORK = OUT / "live-edit"
WORK.mkdir(parents=True, exist_ok=True)
SIZE = (1280, 720)

# Every source is a real macOS window recording of the deployed CloudFront app.
# The second take is revisited after the linked replay to explain Nova's preview.
SHOTS = [
    ("live-01.mov", 0, 10, 10),
    ("live-01.mov", 10, 24, 14),
    ("live-01.mov", 24, 40, 16),
    ("live-01.mov", 43, 59, 12),
    ("live-02.mov", 12, 17, 5),
    ("live-02.mov", 23, 26, 3),
    ("live-02.mov", 52, 58, 6),
    ("live-02.mov", 76, 90, 14),
    ("live-03.mov", 2, 18, 16),
    ("live-02.mov", 31, 45, 14),
    ("live-03.mov", 50, 60, 16),
]
assert sum(shot[3] for shot in SHOTS) == 126


def run(args: list[str]) -> None:
    subprocess.run(args, check=True)


def title_card(path: Path, closing: bool) -> None:
    image = Image.open(PUBLIC / "brand/learnsprint-banner.png").convert("RGB")
    image = image.resize(SIZE, Image.Resampling.LANCZOS)
    if closing:
        draw = ImageDraw.Draw(image)
        draw.rectangle((0, 600, 1280, 720), fill="#253c34")
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 27)
        copy = "Try the live demo: d2g4a2ezl5lw7r.cloudfront.net/career"
        width = draw.textbbox((0, 0), copy, font=font)[2]
        draw.text(((1280 - width) // 2, 642), copy, fill="white", font=font)
    image.save(path)


def encode_still(source: Path, target: Path, duration: int) -> None:
    run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "24",
         "-i", str(source), "-t", str(duration), "-vf", "format=yuv420p",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-an", str(target)])


def encode_shot(index: int, shot: tuple[str, int, int, int]) -> Path:
    name, start, end, duration = shot
    target = WORK / f"shot-{index:02d}.mp4"
    source = PUBLIC / "footage" / name
    if not source.exists():
        raise FileNotFoundError(source)
    speed = duration / (end - start)
    run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(start), "-t", str(end - start),
         "-i", str(source), "-vf",
         f"crop=2630:1480:70:400,scale=1280:720,setpts=(PTS-STARTPTS)*{speed:.9f},fps=24,format=yuv420p",
         "-t", str(duration), "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
         "-threads", "2", "-an", str(target)])
    return target


def captions() -> list[tuple[float, float, str]]:
    raw = (PUBLIC / "audio/captions.en.srt").read_text()
    blocks = re.split(r"\n\s*\n", raw.strip())
    result = []
    for block in blocks:
        lines = block.splitlines()
        start, end = lines[1].split(" --> ")
        def seconds(value: str) -> float:
            hours, mins, rest = value.split(":")
            return int(hours) * 3600 + int(mins) * 60 + float(rest.replace(",", "."))
        result.append((seconds(start), seconds(end), " ".join(lines[2:])))
    return result


def caption_image(index: int, copy: str) -> Path:
    path = WORK / f"caption-{index:02d}.png"
    image = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 27)
    words, lines, current = copy.split(), [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if current and draw.textbbox((0, 0), trial, font=font)[2] > 1160:
            lines.append(current)
            current = word
        else:
            current = trial
    if current:
        lines.append(current)
    draw.rectangle((0, 615, 1280, 720), fill=(37, 60, 52, 245))
    y = 615 + (105 - 35 * len(lines)) // 2
    for line in lines:
        width = draw.textbbox((0, 0), line, font=font)[2]
        draw.text(((1280 - width) // 2, y), line, fill="white", font=font)
        y += 35
    image.save(path)
    return path


def main() -> None:
    opening, closing = WORK / "opening.png", WORK / "closing.png"
    title_card(opening, False)
    title_card(closing, True)
    parts = [WORK / "opening.mp4"]
    encode_still(opening, parts[0], 9)
    parts.extend(encode_shot(index, shot) for index, shot in enumerate(SHOTS, 1))
    parts.append(WORK / "closing.mp4")
    encode_still(closing, parts[-1], 15)
    playlist = WORK / "parts.ffconcat"
    playlist.write_text("ffconcat version 1.0\n" + "".join(f"file '{part}'\n" for part in parts))
    base = WORK / "base.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", str(playlist), "-c", "copy", str(base)])

    marks = captions()
    images = [caption_image(index, copy) for index, (_, _, copy) in enumerate(marks, 1)]
    args = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(base), "-itsoffset", "9",
            "-i", str(PUBLIC / "audio/narration.en.mp3")]
    for path in images:
        args += ["-loop", "1", "-framerate", "1", "-i", str(path)]
    graph = []
    last = "0:v"
    for index, (start, end, _) in enumerate(marks, 1):
        nxt = f"v{index}"
        graph.append(f"[{last}][{index + 1}:v]overlay=enable='between(t,{start:.3f},{end:.3f})':shortest=1[{nxt}]")
        last = nxt
    target = OUT / "learnsprint-demo-live.mp4"
    args += ["-filter_complex", ";".join(graph), "-map", f"[{last}]", "-map", "1:a",
             "-af", "apad", "-t", "150", "-c:v", "libx264", "-preset", "veryfast",
             "-crf", "23", "-pix_fmt", "yuv420p", "-threads", "2", "-c:a", "aac",
             "-b:a", "128k", "-movflags", "+faststart", str(target)]
    run(args)
    print(target)


if __name__ == "__main__":
    main()
