"""Original 104 BPM product-demo score and editorial SFX; no external samples."""
import json, subprocess, wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'out'
data=json.loads((ROOT/'src/production-v2-timeline.json').read_text())
SR=48000; duration=data['duration']; N=round(SR*duration)
music=np.zeros((N,2),np.float32); fx=np.zeros_like(music); rng=np.random.default_rng(927)
beat=60/104; cues=[]
def add(bus,start,sound,pan=0):
    pos=round(start*SR); a=max(0,-pos); pos=max(0,pos); count=min(len(sound)-a,N-pos)
    if count>0:
        bus[pos:pos+count,0]+=sound[a:a+count]*np.sqrt((1-pan)/2)
        bus[pos:pos+count,1]+=sound[a:a+count]*np.sqrt((1+pan)/2)
def tone(midi,length,kind='pluck'):
    t=np.arange(round(length*SR))/SR; f=440*2**((midi-69)/12)
    if kind=='pad':
        y=sum(np.sin(2*np.pi*f*k*t+0.006*np.sin(2*np.pi*.4*t)) / k**2 for k in [1,2,3])
        env=np.minimum(t/.3,1)*np.minimum((length-t)/.7,1)
    elif kind=='bass':
        y=np.sin(2*np.pi*f*t)+.18*np.sin(2*np.pi*2*f*t)
        env=(1-np.exp(-t/.006))*np.exp(-t/.22)*np.minimum((length-t)/.03,1)
    else:
        y=np.sin(2*np.pi*f*t+1.1*np.exp(-t/0.08)*np.sin(2*np.pi*f*2*t))+.12*np.sin(2*np.pi*f*3*t)
        env=(1-np.exp(-t/.004))*np.exp(-t/.27)*np.minimum((length-t)/.04,1)
    return (y*env).astype(np.float32)
chords=[[50,57,61,66],[47,54,57,62],[43,50,54,59],[45,52,57,61]]
for bar,start in enumerate(np.arange(0,duration,beat*4)):
    chord=chords[(bar//2)%4]
    # Arrangement breathes during investigation, then gains momentum after the incident.
    energy=.72 if 42<start<79 else 1
    if start>153:energy=.8
    for j,m in enumerate(chord):add(music,start,tone(m,beat*4+.5,'pad')*.013,(j-1.5)*.36)
    for k in [0,1.5,2,3.5]:add(music,start+k*beat,tone(chord[0]-12,.45,'bass')*.07*energy)
    for k,idx in enumerate([0,2,1,3,2,1,3,2]):
        add(music,start+k*beat/2,tone(chord[idx]+12,.55)*(.025 if k%2==0 else .017)*energy,(-1 if k%2 else 1)*.45)
    for k in range(4):
        t=np.arange(int(.18*SR))/SR
        kick=np.sin(2*np.pi*(49*t+45*.025*(1-np.exp(-t/.025))))*np.exp(-t/0.05)*np.minimum(t/.003,1)
        if k in [0,2]:add(music,start+k*beat,kick*.075*energy)
        if k in [1,3]:
            noise=rng.normal(0,1,len(t)); soft=np.convolve(noise,np.ones(12)/12,mode='same')
            add(music,start+k*beat,soft*np.exp(-t/.025)*.035*energy)
        t=np.arange(int(.075*SR))/SR; noise=rng.normal(0,1,len(t)); high=noise-np.roll(noise,1)
        add(music,start+(k+.5)*beat,high*np.exp(-t/.013)*.006*energy,.3)
# Small stereo echo adds space without a long reverb under speech.
delay=int(beat*.75*SR);music[delay:]+=music[:-delay,::-1].copy()*.16

def cue(start,kind,label):
    cues.append({'seconds':round(start,3),'effect':kind,'purpose':label})
    if kind=='sweep':
        t=np.arange(int(.30*SR))/SR; noise=rng.normal(0,1,len(t)); noise=np.convolve(noise,np.ones(35)/35,mode='same')
        add(fx,start,noise*np.sin(np.pi*t/.30)**2*.075,-.15)
    elif kind=='tick':
        add(fx,start,tone(86,.10)*.043,.15)
    elif kind=='alert':
        for offset,m in [(0,73),(.19,69)]:add(fx,start+offset,tone(m,.27)*.055)
    elif kind=='success':
        for offset,m in [(0,74),(.10,81),(.20,86)]:add(fx,start+offset,tone(m,.55)*.052,offset-.1)
    elif kind=='pulse':
        for offset,m in [(0,66),(.12,73)]:add(fx,start+offset,tone(m,.35)*.040)
scenes={s['id']:s for s in data['scenes']}
for s in data['scenes']:
    if s['start']>0:cue(s['start'],'sweep','Chapter reveal: '+s['id'])
for j in range(4):cue(.25+j*.32,'tick','Technology card reveal')
cue(scenes['mcp']['start']+2,'pulse','Source receipt diagram appears')
cue(scenes['incident']['start']+2,'alert','Supplier delay / missed departure')
cue(scenes['ai']['start']+8.8,'tick','Recorded proposal Apply vicinity')
cue(scenes['handoff']['start']+.2,'success','Saved handoff chapter')
cue(scenes['replay']['start']+.3,'pulse','New shift')
cue(scenes['close']['start']+12,'success','Closing signature')
x=np.arange(N)/SR; duck=np.ones(N,np.float32)
for cap in data['captions']:
    begin=max(0,cap['start']-.12);end=cap['end']+.12
    e=np.where(x<begin,np.clip((begin-x)/.22,0,1),np.where(x>end,np.clip((x-end)/.4,0,1),0))
    duck=np.minimum(duck,.38+.62*e)
fade=np.minimum(x/1.8,1)*np.minimum((duration-x)/3,1)
music*= (duck*fade)[:,None];fx*=fade[:,None]
def wav(path,arr):
    with wave.open(str(path),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(arr,-1,1)*32767).astype('<i2').tobytes())
wav(OUT/'demo-tech-music.wav',music);wav(OUT/'demo-editorial-sfx.wav',fx)
(OUT/'demo-sfx-cues.json').write_text(json.dumps(cues,indent=2)+'\n')
target=OUT/'learnsprint-demo-v6-tech-sfx.mp4'
subprocess.run(['ffmpeg','-y','-v','error','-i',str(OUT/'learnsprint-demo-v4-mcp.mp4'),'-i',str(OUT/'demo-tech-music.wav'),'-i',str(OUT/'demo-editorial-sfx.wav'),'-filter_complex','[0:a][1:a][2:a]amix=inputs=3:normalize=0,alimiter=limit=0.891:level=false[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(duration),'-movflags','+faststart',str(target)],check=True)
# Short A/V review covers the disruption, negotiation and AI proposal.
subprocess.run(['ffmpeg','-y','-v','error','-ss','66','-i',str(target),'-t','39','-c','copy','-movflags','+faststart',str(OUT/'learnsprint-v6-preview.mp4')],check=True)
print(target)
