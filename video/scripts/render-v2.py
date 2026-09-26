"""Render the bilingual motion edit from real screen recordings and vector graphics.

No browser is launched and the web app is not built. Pillow draws diagrams,
captions and camera framing; FFmpeg reads the original captures and encodes
with two threads. Voice segments and translations come from prepare-v2.py.
"""
from __future__ import annotations

import argparse
import functools
import json
import math
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUT = ROOT / 'out/v2'
OUT.mkdir(parents=True, exist_ok=True)
DATA = json.loads((ROOT / 'src/production-v2-timeline.json').read_text())
W, H, FPS = 1920, 1080, DATA['fps']
PAPER, INK, MUTED = '#f5f1e7', '#193c32', '#61746a'
SAGE, LINE, ORANGE, WHITE = '#dfe8d8', '#c7d0bd', '#c9663e', '#fffdf6'
FONT_ROOT = Path('/System/Library/Fonts/Supplemental')


@functools.lru_cache(maxsize=80)
def font(size, style='normal'):
    names = {'normal': 'Arial.ttf', 'bold': 'Arial Bold.ttf', 'serif': 'Georgia.ttf', 'italic': 'Georgia Italic.ttf'}
    return ImageFont.truetype(str(FONT_ROOT / names[style]), size)


def smooth(value):
    value = max(0.0, min(1.0, value))
    return value * value * (3 - 2 * value)


def pop(t, delay=0, span=.65):
    return 1 - (1 - max(0.0, min(1.0, (t - delay) / span))) ** 3


def text(draw, xy, value, size=32, fill=INK, style='normal', anchor=None):
    draw.text(xy, str(value), font=font(size, style), fill=fill, anchor=anchor)


def wrapped(draw, value, x, y, width, size=32, fill=INK, style='normal', line_gap=8):
    lines, current = [], ''
    for word in value.split():
        trial = f'{current} {word}'.strip()
        if current and draw.textlength(trial, font=font(size, style)) > width:
            lines.append(current)
            current = word
        else:
            current = trial
    if current:
        lines.append(current)
    for line in lines:
        text(draw, (x, y), line, size, fill, style)
        y += size + line_gap
    return y


def pill(draw, x, y, label, fill=SAGE, color=INK, size=23):
    width = int(draw.textlength(label, font=font(size, 'bold'))) + 34
    draw.rounded_rectangle((x, y, x + width, y + 43), radius=21, fill=fill)
    text(draw, (x + 17, y + 9), label, size, color, 'bold')
    return width


def arrow(draw, start, end, progress=1, color=INK, width=4):
    x1, y1 = start
    x2, y2 = end
    p = max(0, min(1, progress))
    x, y = x1 + (x2 - x1) * p, y1 + (y2 - y1) * p
    draw.line((x1, y1, x, y), fill=color, width=width)
    if p > .96:
        a = math.atan2(y2 - y1, x2 - x1)
        draw.polygon([(x2, y2), (x2 - 16 * math.cos(a - .45), y2 - 16 * math.sin(a - .45)),
                      (x2 - 16 * math.cos(a + .45), y2 - 16 * math.sin(a + .45))], fill=color)


def card(draw, box, fill=WHITE, outline=LINE, radius=20):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle((x1 + 1, y1 + 9, x2 + 1, y2 + 9), radius=radius, fill='#e5e2d6')
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=2)


def header(draw, scene, index, t):
    text(draw, (72, 33), 'ls.', 40, INK, 'serif')
    text(draw, (146, 44), 'LearnSprint', 27, INK, 'bold')
    text(draw, (W - 72, 48), scene['chapter'], 22, MUTED, 'bold', 'ra')
    draw.line((72, 91, W - 72, 91), fill=LINE, width=1)
    y = 115 + int(22 * (1 - pop(t)))
    text(draw, (72, y), scene['title'], 52, INK, 'serif')
    text(draw, (W - 75, 127), f'{index + 1:02d} / {len(DATA["scenes"]):02d}', 21, MUTED, 'normal', 'ra')


@functools.lru_cache(maxsize=100)
def caption_plate(en, vi):
    canvas = Image.new('RGBA', (W, 176), (25, 60, 50, 255))
    draw = ImageDraw.Draw(canvas)
    # Leave ample space for two lines in each language.
    english = []
    vietnamese = []
    for value, lines, size in [(en, english, 31), (vi, vietnamese, 29)]:
        current = ''
        for word in value.split():
            trial = f'{current} {word}'.strip()
            if current and draw.textlength(trial, font=font(size, 'bold' if lines is english else 'normal')) > 1730:
                lines.append(current)
                current = word
            else:
                current = trial
        if current:
            lines.append(current)
    total = len(english) * 38 + len(vietnamese) * 35 + 10
    y = (176 - total) // 2
    for line in english:
        text(draw, (W // 2, y), line, 31, WHITE, 'bold', 'ma')
        y += 38
    y += 10
    for line in vietnamese:
        text(draw, (W // 2, y), line, 29, '#c9dfcd', 'normal', 'ma')
        y += 35
    return canvas


def subtitles(canvas, scene, t):
    absolute = scene['start'] + t
    cap = next((s for s in scene['sentences'] if s['start'] <= absolute < s['end'] + .10), None)
    if cap:
        plate = caption_plate(cap['en'], cap['vi'])
        canvas.paste(plate, (0, H - 176), plate)
    else:
        draw = ImageDraw.Draw(canvas)
        draw.rectangle((0, H - 176, W, H), fill=INK)
        text(draw, (W // 2, H - 105), 'LEARN SPRINT  /  PRACTICE THE WORK', 22, '#c9dfcd', 'bold', 'ma')
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, H - 5, int(W * absolute / DATA['duration']), H), fill='#efae78')


@functools.lru_cache(maxsize=12)
def brand_icon(name, size):
    icon = Image.open(PUBLIC / 'brand/aws' / f'{name}.png').convert('RGBA')
    icon.thumbnail((size, size), Image.Resampling.LANCZOS)
    return icon


def intro(canvas, t, scene):
    draw = ImageDraw.Draw(canvas)
    text(draw, (100, 234), 'LearnSprint', 112, INK, 'serif')
    text(draw, (106, 373), 'A simulated first shift. Real decisions to practice.', 32, MUTED)
    pill(draw, 108, 442, 'CREATED BY', size=20)
    text(draw, (108, 505), 'Nguyễn Xuân Hải', 49, INK, 'bold')
    text(draw, (110, 578), 'Independent developer · Vietnam', 26, MUTED)
    text(draw, (110, 697), 'AI + cloud infrastructure', 25, MUTED, 'bold')
    icon = brand_icon('AWS-Cloud', 80)
    canvas.paste(icon, (110, 748), icon)
    text(draw, (220, 742), 'Built with AWS', 43, INK, 'serif')
    labels = [('Amazon-Bedrock', 'Amazon Bedrock', 'AI service'),
              ('Amazon-Nova', 'Amazon Nova', 'Nova 2 Lite'),
              ('Amazon-EC2', 'Amazon EC2', 'Application hosting'),
              ('Amazon-CloudFront', 'Amazon CloudFront', 'HTTPS delivery')]
    for i, (name, title, detail) in enumerate(labels):
        p = pop(t, .25 + i * .32)
        if p <= 0:
            continue
        x = 975 + (i % 2) * 430
        y = 229 + (i // 2) * 300 + int(35 * (1 - p))
        card(draw, (x, y, x + 397, y + 270))
        icon = brand_icon(name, 94)
        canvas.paste(icon, (x + 27, y + 25), icon)
        text(draw, (x + 27, y + 143), title, 31, INK, 'bold')
        text(draw, (x + 27, y + 204), detail, 25, MUTED)


def hook(canvas, t, scene):
    draw = ImageDraw.Draw(canvas)
    for i, (order, qty, title, deadline) in enumerate([
        ('A', 30, 'Workshop organizer', 'TODAY / 14:00'),
        ('B', 30, 'Training office', 'TODAY / 18:00'),
        ('C', 20, 'Community club', 'TOMORROW / 12:00')]):
        p = pop(t, i * .35)
        x, y = 130 + i * 570, 240 + int(100 * (1 - p))
        if p <= 0:
            continue
        card(draw, (x, y, x + 520, y + 380))
        pill(draw, x + 30, y + 28, f'ORDER {order}')
        text(draw, (x + 30, y + 110), str(round(qty * pop(t, .4 + i * .35, .9))), 120, INK, 'serif')
        text(draw, (x + 200, y + 172), 'kits', 31, MUTED)
        text(draw, (x + 30, y + 267), title, 31, INK, 'bold')
        text(draw, (x + 30, y + 324), deadline, 22, MUTED, 'bold')
    p = pop(t, 3.0)
    if p > 0:
        y = 673 + int(50 * (1 - p))
        card(draw, (130, y, 1790, y + 133), fill='#f6ddc5', outline='#e2aa7f')
        text(draw, (164, y + 28), 'SUPPLIER UPDATE', 22, ORANGE, 'bold')
        text(draw, (164, y + 68), 'Expected 11:00', 34, INK, 'bold')
        arrow(draw, (550, y + 88), (720, y + 88), pop(t, 4))
        text(draw, (765, y + 52), 'Now 17:00', 50, ORANGE, 'bold')
        text(draw, (1750, y + 78), 'Your first real decision.', 30, INK, 'italic', 'ra')


def flow(canvas, t, scene):
    draw = ImageDraw.Draw(canvas)
    labels = [('Discover', 'Read source facts'), ('Decide', 'Build the plan'), ('Adapt', 'Handle a disruption'), ('Reflect', 'Inspect the record'), ('Replay', 'Try changed facts')]
    xs = [80 + i * 365 for i in range(5)]
    for i, (title, description) in enumerate(labels):
        p = pop(t, .4 + i * .5)
        if p <= 0:
            continue
        x, y = xs[i], 345 + int(65 * (1 - p))
        active = min(4, int(max(0, t - 1) / 1.5)) == i
        card(draw, (x, y, x + 300, y + 275), fill=INK if active else WHITE)
        color = WHITE if active else INK
        draw.ellipse((x + 24, y + 24, x + 80, y + 80), fill='#edb780' if active else SAGE)
        text(draw, (x + 52, y + 38), i + 1, 27, INK, 'bold', 'ma')
        text(draw, (x + 24, y + 110), title, 38, color, 'serif')
        wrapped(draw, description, x + 24, y + 183, 255, 24, '#c9dfcd' if active else MUTED)
        if i < 4:
            arrow(draw, (x + 311, y + 135), (x + 352, y + 135), pop(t, 1 + i * .5), ORANGE)
    if t > 3:
        p = pop(t, 3, 2)
        draw.line((1765, 655, 1765, 738, 229, 738), fill=LINE, width=3)
        arrow(draw, (229, 738), (229, 659), p, ORANGE)
        text(draw, (W // 2, 774), 'A new situation creates a new decision.', 32, MUTED, 'italic', 'ma')
        dotx = 1765 - 1536 * ((max(0, t - 4) * .17) % 1)
        draw.ellipse((dotx - 7, 731, dotx + 7, 745), fill=ORANGE)


def incident(canvas, t, scene):
    draw = ImageDraw.Draw(canvas)
    card(draw, (90, 238, 875, 810))
    text(draw, (125, 268), 'THE CLOCK CHANGES THE PLAN', 23, MUTED, 'bold')
    times = [('11:00', 'Expected stock', 150), ('16:00', 'Dispatch cutoff', 460), ('17:00', 'New arrival', 720)]
    for i, (hour, label, x) in enumerate(times):
        p = pop(t, i * .55 + .4)
        if not p:
            continue
        draw.ellipse((x - 10, 456, x + 10, 476), fill=ORANGE if i == 2 else INK)
        text(draw, (x, 362), hour, 47, ORANGE if i == 2 else INK, 'serif', 'ma')
        wrapped(draw, label, x - 54, 506, 150, 23, MUTED)
        if i < 2:
            arrow(draw, (x + 20, 466), (times[i + 1][2] - 25, 466), pop(t, 1 + i * .55), LINE)
    if t > 2:
        pill(draw, 125, 648, '17:00 arrives after the 16:00 cutoff', '#f6ddc5', ORANGE, 25)
        text(draw, (125, 728), 'Expected stock is not on-hand stock.', 29, INK, 'italic')
    card(draw, (940, 238, 1830, 810), fill=INK, outline=INK)
    text(draw, (985, 280), 'AT TODAY’S STANDARD DEPARTURE', 24, '#c9dfcd', 'bold')
    for i, (label, value, color) in enumerate([('Allocated so far', 60, '#edb780'), ('Available by then', 40, '#93baa0')]):
        y = 386 + i * 132
        text(draw, (985, y - 29), label, 28, WHITE)
        p = pop(t, 2.8 + i * .35, 1.2)
        draw.rounded_rectangle((985, y + 15, 985 + int(690 * value / 60 * p), y + 51), radius=14, fill=color)
        text(draw, (1780, y + 10), round(value * p), 40, WHITE, 'bold', 'ra')
    p = pop(t, 4.5, .8)
    if p:
        text(draw, (985, 670), f'{round(20 * p)} kits short', 61, '#edb780', 'serif')
        text(draw, (985, 754), 'Recorded scenario • explanatory animation', 22, '#c9dfcd')


def architecture(canvas, t, scene):
    draw = ImageDraw.Draw(canvas)
    # The drawing follows the deployed stack, not the future serverless roadmap.
    draw.rounded_rectangle((650, 230, 1845, 833), radius=25, fill='#e8eddf', outline=LINE, width=2)
    text(draw, (682, 247), 'AWS DEPLOYMENT', 21, MUTED, 'bold')
    boxes = [
        (95, 362, 330, 534, 'React', 'Learner’s browser', .1, WHITE),
        (384, 362, 619, 534, 'CloudFront', 'HTTPS entry', .8, WHITE),
        (700, 348, 1100, 560, 'EC2 + NestJS', 'Private origin · Caddy', 1.6, INK),
        (1250, 326, 1778, 535, 'Amazon Bedrock', 'Nova 2 Lite · bounded requests', 4.8, WHITE),
        (737, 659, 1137, 782, 'SQLite on EBS', 'Saved plans + evidence', 9, WHITE),
    ]
    for x1, y1, x2, y2, title, detail, delay, fill in boxes:
        p = pop(t, delay)
        if not p:
            continue
        dy = int(34 * (1 - p))
        card(draw, (x1, y1 + dy, x2, y2 + dy), fill=fill, outline=LINE)
        color = WHITE if fill == INK else INK
        text(draw, ((x1 + x2) // 2, y1 + 44 + dy), title, 32 if x2 - x1 > 300 else 28, color, 'bold', 'ma')
        text(draw, ((x1 + x2) // 2, y1 + 101 + dy), detail, 21, '#c9dfcd' if fill == INK else MUTED, 'normal', 'ma')
        if title == 'EC2 + NestJS':
            text(draw, ((x1 + x2) // 2, y1 + 157 + dy), 'Facts • rules • commitments', 22, '#c9dfcd', 'normal', 'ma')
    edges = [((334, 448), (380, 448), 1.2), ((622, 448), (694, 448), 2.0),
             ((1107, 397), (1240, 397), 5.2), ((1240, 485), (1107, 485), 7),
             ((900, 564), (900, 650), 9.4)]
    for start, end, delay in edges:
        if t > delay:
            arrow(draw, start, end, pop(t, delay, .8), ORANGE)
            p = (max(0, t - delay - .6) * .7) % 1
            x = start[0] + (end[0] - start[0]) * p
            y = start[1] + (end[1] - start[1]) * p
            draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=ORANGE)
    if t > 6:
        text(draw, (1173, 360), 'request', 18, MUTED, 'normal', 'ma')
        text(draw, (1173, 515), 'proposal', 18, MUTED, 'normal', 'ma')
    if t > 7.5:
        pill(draw, 1260, 590, 'Human confirmation before Apply', '#f6ddc5', ORANGE, 23)
        wrapped(draw, 'The model interprets. The application checks.', 1260, 679, 510, 29, INK, 'serif')
    text(draw, (90, 798), 'Alexa+ style web simulation · no native Alexa integration', 22, MUTED)


def close(canvas, t, scene):
    draw = ImageDraw.Draw(canvas)
    for i, (title, detail) in enumerate([('Practitioner review', 'Validate the scenario'), ('Learner pilot', 'Observe real decisions'), ('Voice prototype', 'Improve the browser path')]):
        p = pop(t, i * .4)
        if not p:
            continue
        x, y = 95 + i * 605, 232 + int(55 * (1 - p))
        card(draw, (x, y, x + 550, y + 220))
        text(draw, (x + 30, y + 28), f'0{i + 1}', 25, ORANGE, 'bold')
        text(draw, (x + 30, y + 90), title, 35, INK, 'serif')
        text(draw, (x + 30, y + 155), detail, 25, MUTED)
    p = pop(t, 2.5, 1)
    if p:
        text(draw, (W // 2, 520 + int(30 * (1 - p))), 'LearnSprint', 92, INK, 'serif', 'ma')
        text(draw, (W // 2, 645), 'Practice the work before the first job.', 37, INK, 'italic', 'ma')
        text(draw, (W // 2, 749), 'd2g4a2ezl5lw7r.cloudfront.net/career', 27, MUTED, 'bold', 'ma')
        text(draw, (W // 2, 803), 'github.com/xuanhai0913/LearnSprint  ·  Open source / MIT', 24, MUTED, 'normal', 'ma')


def camera_image(frame, width, height, focus, t, duration):
    # Ease toward the action, hold, then ease back out to retain context.
    phase = t / max(1, duration)
    zoom = 1 + .22 * smooth(phase / .35) - .16 * smooth((phase - .74) / .26)
    crop_w = frame.width / zoom
    crop_h = crop_w * height / width
    cx = frame.width * (.5 + (focus[0] - .5) * smooth(phase / .3))
    cy = frame.height * focus[1]
    left = max(0, min(frame.width - crop_w, cx - crop_w / 2))
    top = max(0, min(frame.height - crop_h, cy - crop_h / 2))
    return frame.crop((int(left), int(top), int(left + crop_w), int(top + crop_h))).resize((width, height), Image.Resampling.BICUBIC)


def footage(canvas, t, scene, frame):
    draw = ImageDraw.Draw(canvas)
    if scene['type'] == 'purpose':
        # A live entry screen sits beside the audience and value proposition.
        x, y, width, height = 743, 232, 1086, 584
        card(draw, (90, 232, 675, 816), fill=INK, outline=INK)
        pill(draw, 123, 268, 'FOR THE FIRST STEP', '#edb780', INK)
        wrapped(draw, 'Students.\nFirst-time job seekers.', 123, 364, 490, 53, WHITE, 'serif', 20)
        wrapped(draw, 'A safe place to practice consequential decisions.', 123, 598, 470, 32, '#c9dfcd', 'normal', 15)
        current = camera_image(frame, width, height, (.1, .36), t, scene['duration'])
    else:
        x, y, width, height = 74, 207, 1772, 620
        current = camera_image(frame, width, height, scene.get('focus', [.5, .4]), t, scene['duration'])
    # Rounded frame, with the camera move visible inside it.
    shadow = (x + 2, y + 10, x + width + 2, y + height + 10)
    draw.rounded_rectangle(shadow, radius=18, fill='#dcded1')
    mask = Image.new('L', (width, height), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, width, height), radius=16, fill=255)
    canvas.paste(current, (x, y), mask)
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((x, y, x + width, y + height), radius=16, outline=LINE, width=2)
    if scene['type'] != 'purpose':
        pill(draw, 80, 847, scene['callout'], SAGE, INK, 22)
        text(draw, (1840, 859), 'RECORDED AWS DEMO', 20, MUTED, 'bold', 'ra')


def compose(scene, index, t, source_frame=None):
    canvas = Image.new('RGB', (W, H), PAPER)
    draw = ImageDraw.Draw(canvas)
    # Quiet paper grid creates depth without moving decorative clutter.
    for x in range(24, W, 36):
        for y in range(205, 890, 36):
            draw.point((x, y), fill='#d9dece')
    header(draw, scene, index, t)
    if scene['type'] == 'intro':
        intro(canvas, t, scene)
    elif scene['type'] == 'hook':
        hook(canvas, t, scene)
    elif scene['type'] == 'flow':
        flow(canvas, t, scene)
    elif scene['type'] == 'incident':
        incident(canvas, t, scene)
    elif scene['type'] == 'architecture':
        architecture(canvas, t, scene)
    elif scene['type'] == 'close':
        close(canvas, t, scene)
    elif source_frame is not None:
        footage(canvas, t, scene, source_frame)
    subtitles(canvas, scene, t)
    # 8-frame paper reveal softens cuts while retaining the actual recording.
    reveal = pop(t, 0, .34)
    if reveal < 1:
        draw = ImageDraw.Draw(canvas)
        edge = int(W * reveal)
        draw.rectangle((edge, 94, W, 900), fill=PAPER)
        draw.rectangle((edge, 94, min(W, edge + 7), 900), fill=ORANGE)
    return canvas


def source_at(scene, seconds):
    path = PUBLIC / 'footage' / scene['source']
    args = ['ffmpeg', '-v', 'error', '-ss', str(seconds), '-i', str(path), '-frames:v', '1',
            '-vf', 'crop=2630:1680:70:408,scale=1600:1022', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1']
    raw = subprocess.check_output(args)
    return Image.frombytes('RGB', (1600, 1022), raw)


def render_scene(scene, index, force=False):
    dest = OUT / f'{index:02d}-{scene["id"]}.mp4'
    if dest.exists() and not force:
        print('reuse', dest.name, flush=True)
        return dest
    frames = round(scene['duration'] * FPS)
    decoder = None
    if 'source' in scene:
        span = scene['sourceEnd'] - scene['sourceStart']
        decoder = subprocess.Popen(['ffmpeg', '-v', 'error', '-threads', '2', '-ss', str(scene['sourceStart']),
            '-t', str(span), '-i', str(PUBLIC / 'footage' / scene['source']), '-vf',
            f'crop=2630:1680:70:408,scale=1600:1022,setpts=(PTS-STARTPTS)*{scene["duration"] / span:.9f},fps={FPS},tpad=stop_mode=clone:stop_duration=1',
            '-frames:v', str(frames), '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], stdout=subprocess.PIPE)
    encoder = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
        '-r', str(FPS), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
        '-threads', '2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dest)], stdin=subprocess.PIPE)
    last = None
    for number in range(frames):
        if decoder:
            raw = decoder.stdout.read(1600 * 1022 * 3)
            if len(raw) == 1600 * 1022 * 3:
                last = Image.frombytes('RGB', (1600, 1022), raw)
        image = compose(scene, index, number / FPS, last)
        encoder.stdin.write(image.tobytes())
    encoder.stdin.close()
    if encoder.wait() != 0:
        raise RuntimeError('Video encode failed')
    if decoder:
        decoder.stdout.close()
        decoder.wait()
    print('rendered', dest.name, scene['duration'], flush=True)
    return dest


def soundtrack():
    args = ['ffmpeg', '-y', '-v', 'error']
    captions = DATA['captions']
    for cap in captions:
        args += ['-i', str(PUBLIC / cap['audio'])]
    graph = []
    for index, cap in enumerate(captions):
        delay = round(cap['start'] * 1000)
        graph.append(f'[{index}:a]aresample=48000,adelay={delay}|{delay}[a{index}]')
    inputs = ''.join(f'[a{i}]' for i in range(len(captions)))
    graph.append(f'{inputs}amix=inputs={len(captions)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,apad[a]')
    target = OUT / 'narration.en.wav'
    args += ['-filter_complex', ';'.join(graph), '-map', '[a]', '-t', str(DATA['duration']),
             '-ar', '48000', '-ac', '2', str(target)]
    subprocess.run(args, check=True)
    return target


def previews():
    thumbs = []
    for index, scene in enumerate(DATA['scenes']):
        t = min(scene['duration'] * .62, scene['duration'] - 1)
        frame = None
        if 'source' in scene:
            frame = source_at(scene, scene['sourceStart'] + (scene['sourceEnd'] - scene['sourceStart']) * .62)
        image = compose(scene, index, t, frame)
        image.save(OUT / f'preview-{scene["id"]}.png')
        thumb = image.resize((640, 360), Image.Resampling.LANCZOS)
        thumbs.append(thumb)
    sheet = Image.new('RGB', (1920, math.ceil(len(thumbs) / 3) * 390), PAPER)
    draw = ImageDraw.Draw(sheet)
    for index, image in enumerate(thumbs):
        x, y = (index % 3) * 640, (index // 3) * 390
        sheet.paste(image, (x, y))
        text(draw, (x + 12, y + 363), f'{index + 1:02}  {DATA["scenes"][index]["id"]}', 20, INK, 'bold')
    sheet.save(OUT / 'contact-sheet.png')
    print(OUT / 'contact-sheet.png')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--preview', action='store_true')
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--scene')
    options = parser.parse_args()
    if options.preview:
        previews()
        return
    if options.scene:
        index, scene = next((i, s) for i, s in enumerate(DATA['scenes']) if s['id'] == options.scene)
        render_scene(scene, index, True)
        return
    parts = [render_scene(scene, index, options.force) for index, scene in enumerate(DATA['scenes'])]
    playlist = OUT / 'parts.ffconcat'
    playlist.write_text('ffconcat version 1.0\n' + ''.join(f"file '{part}'\n" for part in parts))
    voice = soundtrack()
    target = ROOT / 'out/learnsprint-demo-v3-branded.mp4'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(playlist),
        '-i', str(voice), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
        '-t', str(DATA['duration']), '-movflags', '+faststart', str(target)], check=True)
    print(target, flush=True)


if __name__ == '__main__':
    main()
