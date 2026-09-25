"""Prepare a bounded two-request Polly batch; does not call AWS."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

root = Path(__file__).resolve().parents[1]
scenes = json.loads((root / 'narration.json').read_text())
plain = '\n\n'.join(scene['text'] for scene in scenes)
if len(plain) > 3000:
    raise SystemExit('Narration exceeds the 3,000-character batch cap')
ssml = '<speak><prosody rate="90%">' + ''.join(
    '<mark name="' + scene['id'] + '"/><p>' + escape(scene['text']) + '</p><break time="500ms"/>'
    for scene in scenes
) + '</prosody></speak>'
(root / 'narration.en.txt').write_text(plain + '\n')
(root / 'narration.ssml').write_text(ssml)
print(json.dumps({'characters':len(plain),'words':len(plain.split()),'requests':2,
    'engine':'neural','voice':'Joanna','region':'ap-southeast-2',
    'estimated_list_price_usd':round(len(plain) * 2 * 16 / 1_000_000, 6),
    'batch_cap_usd':0.10}, indent=2))
