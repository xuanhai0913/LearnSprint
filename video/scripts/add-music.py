"""Synthesize an original quiet instrumental bed; retain the approved video stream."""
import json
import subprocess
import wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'out'
timeline=json.loads((ROOT/'src/production-v2-timeline.json').read_text())
duration=timeline['duration']; rate=48000
music=np.zeros((int(duration*rate),2),dtype=np.float32)
beat=60/78
chords=[[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,59]]
def note(start,midi,length,amp,pan,pad=False):
    first=int(start*rate); count=min(int(length*rate),len(music)-first)
    if count<=0:return
    t=np.arange(count)/rate; f=440*2**((midi-69)/12)
    tone=np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*2*f*t)+.06*np.sin(2*np.pi*3*f*t)
    if pad:
        env=np.minimum(t/.8,1)*np.minimum((length-t)/1.3,1)*(.92+.08*np.sin(2*np.pi*.23*t))
    else:env=(1-np.exp(-t/.012))*np.exp(-t/1.1)*np.minimum((length-t)/.12,1)
    sound=(tone*env*amp).astype(np.float32)
    music[first:first+count,0]+=sound*np.sqrt((1-pan)/2)
    music[first:first+count,1]+=sound*np.sqrt((1+pan)/2)
bar=beat*4
for b,start in enumerate(np.arange(0,duration,bar)):
    chord=chords[(b//2)%4]
    for j,m in enumerate(chord):note(start,m,bar+1,.013,(j-1.5)*.28,True)
    for j in range(4):
        # Sparse rounded electric-key notes, with gentle variation each phrase.
        m=chord[[0,2,1,3][(j+b%2)%4]]+12
        note(start+j*beat,m,2.5,.022 if j%2==0 else .014,(-1 if j%2 else 1)*.3)
# Subtle stereo echoes from the same synthesized notes.
for delay,gain in [(.23,.16),(.47,.09)]:
    offset=int(delay*rate);music[offset:]+=music[:-offset,::-1].copy()*gain
x=np.arange(len(music))/rate
music*= (np.minimum(x/3,1)*np.minimum((duration-x)/4,1))[:,None]
# Caption timing provides anticipatory ducking around every narration segment.
duck=np.ones(len(music),dtype=np.float32)
for cap in timeline['captions']:
    begin=max(0,cap['start']-.18);end=cap['end']+.2
    env=np.where(x<begin,np.clip((begin-x)/.25,0,1),np.where(x>end,np.clip((x-end)/.5,0,1),0))
    duck=np.minimum(duck,.43+.57*env)
music*=duck[:,None]
path=OUT/'learnsprint-original-music.wav'
with wave.open(str(path),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes((np.clip(music,-1,1)*32767).astype('<i2').tobytes())
target=OUT/'learnsprint-demo-v5-music.mp4'
subprocess.run(['ffmpeg','-y','-v','error','-i',str(OUT/'learnsprint-demo-v4-mcp.mp4'),'-i',str(path),'-filter_complex','[0:a][1:a]amix=inputs=2:normalize=0,alimiter=limit=0.891:level=false[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(duration),'-movflags','+faststart',str(target)],check=True)
subprocess.run(['ffmpeg','-y','-v','error','-i',str(target),'-t','25','-vn','-c:a','libmp3lame','-b:a','192k',str(OUT/'learnsprint-music-preview.mp3')],check=True)
print(target)
