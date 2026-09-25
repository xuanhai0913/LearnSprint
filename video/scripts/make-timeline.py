"""Turn Polly speech marks into a timed caption and scene plan."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
scenes = json.loads((root / 'narration.json').read_text())
marks = [json.loads(line) for line in (root / 'public/audio/speechmarks.ndjson').read_text().splitlines()]
scene_marks = {mark['value']: mark['time'] for mark in marks if mark['type'] == 'ssml'}
if set(scene_marks) != {scene['id'] for scene in scenes}:
    raise SystemExit('Polly scene marks do not match narration.json')

intro_ms = 9000
audio_ms = 126000
total_ms = 150000
timeline = []
for index, scene in enumerate(scenes):
    start = intro_ms + scene_marks[scene['id']]
    end = intro_ms + (scene_marks[scenes[index+1]['id']] if index + 1 < len(scenes) else audio_ms)
    timeline.append({'id': scene['id'], 'title': scene['title'], 'startMs': start, 'endMs': end,
                     'footage': f'footage/{index+1:02d}-{scene["id"]}.mp4'})

sentences = [mark for mark in marks if mark['type'] == 'sentence']
captions = []
for index, item in enumerate(sentences):
    start = intro_ms + item['time']
    end = intro_ms + (sentences[index+1]['time'] if index+1 < len(sentences) else audio_ms)
    captions.append({'startMs': start, 'endMs': end, 'text': item['value']})

def srt_time(ms):
    seconds, millis = divmod(ms, 1000)
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f'{hours:02}:{minutes:02}:{seconds:02},{millis:03}'

srt = '\n\n'.join(f'{index}\n{srt_time(c["startMs"])} --> {srt_time(c["endMs"])}\n{c["text"]}'
                   for index, c in enumerate(captions, 1)) + '\n'
(root / 'public/audio/captions.en.srt').write_text(srt)
(root / 'src/timeline.json').write_text(json.dumps({'durationMs': total_ms, 'introMs': intro_ms,
                 'audioMs': audio_ms, 'scenes': timeline, 'captions': captions}, indent=2) + '\n')
print(f'{len(timeline)} scenes, {len(captions)} English captions, {total_ms/1000:.0f}s composition')
