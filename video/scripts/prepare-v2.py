"""Create male English narration and an aligned bilingual edit manifest.

Requires edge-tts in the isolated video production environment.
Only the public, fictional demo script is sent to the voice service.
Existing audio is reused; no model/hosting allowance is touched.
"""
import asyncio
import json
import math
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / 'public/audio/v2'
AUDIO.mkdir(parents=True, exist_ok=True)
SPEC = json.loads((ROOT / 'production-v2.json').read_text())


def duration(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration', '-of', 'default=nw=1:nk=1', str(path)]))


def stamp(seconds):
    ms = round(seconds * 1000)
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


async def main():
    sem = asyncio.Semaphore(2)
    async def synth(scene, index, sentence):
        path = AUDIO / f'{scene["id"]}-{index:02d}.mp3'
        if not path.exists() or path.stat().st_size < 1000:
            async with sem:
                await edge_tts.Communicate(sentence['en'], SPEC['voice'], rate='+2%', pitch='-2Hz').save(str(path))
        sentence['audio'] = str(path.relative_to(ROOT / 'public'))
        sentence['audioDuration'] = duration(path)
        print(f'{scene["id"]}/{index}: {sentence["audioDuration"]:.2f}s', flush=True)

    await asyncio.gather(*(synth(scene, i, sentence) for scene in SPEC['scenes']
        for i, sentence in enumerate(scene['sentences'], 1)))
    now, captions = 0.0, []
    fps = SPEC['fps']
    for scene in SPEC['scenes']:
        scene['start'] = now
        cursor = now + 0.35
        for sentence in scene['sentences']:
            sentence['start'] = cursor
            sentence['end'] = cursor + sentence['audioDuration']
            captions.append(sentence)
            cursor = sentence['end'] + 0.10
        scene['duration'] = math.ceil((cursor - now + 0.65) * fps) / fps
        now += scene['duration']
    # A short final hold gives the project links time to be read.
    SPEC['scenes'][-1]['duration'] += 3
    SPEC['duration'] = now + 3
    SPEC['captions'] = captions
    if SPEC['duration'] >= 178:
        raise RuntimeError(f'Cut is {SPEC["duration"]:.2f}s; shorten before rendering')
    (ROOT / 'src/production-v2-timeline.json').write_text(json.dumps(SPEC, ensure_ascii=False, indent=2) + '\n')
    for lang in ['en', 'vi', 'bilingual']:
        blocks = []
        for i, cap in enumerate(captions, 1):
            text = cap['en'] + '\n' + cap['vi'] if lang == 'bilingual' else cap[lang]
            blocks.append(f'{i}\n{stamp(cap["start"])} --> {stamp(cap["end"])}\n{text}')
        (AUDIO / f'captions.{lang}.srt').write_text('\n\n'.join(blocks) + '\n')
    print(f'Total: {SPEC["duration"]:.2f}s, voice: {SPEC["voice"]}', flush=True)


if __name__ == '__main__':
    asyncio.run(main())
