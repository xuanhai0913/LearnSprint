import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';

const ink = '#253c34';
const green = '#305844';
const paper = '#f7f4ed';
const Scene: React.FC<{scene: (typeof timeline.scenes)[number]}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zoom = 1 + Math.min(0.012, frame / fps * 0.0008);

  return (
    <AbsoluteFill style={{background: paper, color: ink}}>
      <AbsoluteFill style={{overflow:'hidden',background:'#e9ece5',padding:'80px 40px 110px'}}>
        <Img src={staticFile(scene.footage)} style={{width:'100%',height:'100%',objectFit:'contain',transform:`scale(${zoom})`}} />
      </AbsoluteFill>
      <div style={{position:'absolute',top:36,left:48,background:green,color:'white',padding:'12px 22px',fontSize:23,letterSpacing:1}}>
        {scene.title}
      </div>
      <div style={{position:'absolute',top:43,right:48,color:green,fontSize:20,letterSpacing:1}}>
        AWS DEMO · STILL STORYBOARD
      </div>
    </AbsoluteFill>
  );
};

export const LearnSprintDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ms = frame / fps * 1000;
  const caption = timeline.captions.find(item => item.startMs <= ms && ms < item.endMs);

  return (
    <AbsoluteFill style={{background:paper,color:ink,fontFamily:'Avenir Next, Segoe UI, sans-serif'}}>
      <Img src={staticFile('brand/learnsprint-banner.png')} style={{width:'100%',height:'100%',objectFit:'cover'}} />
      {timeline.scenes.map(scene => (
        <Sequence key={scene.id} from={Math.round(scene.startMs/1000*fps)} durationInFrames={Math.round((scene.endMs-scene.startMs)/1000*fps)}>
          <Scene scene={scene} />
        </Sequence>
      ))}
      <Sequence from={Math.round(timeline.introMs/1000*fps)}>
        <Audio src={staticFile('audio/narration.en.mp3')} />
      </Sequence>
      {caption && (
        <div style={{position:'absolute',bottom:32,left:120,right:120,textAlign:'center',fontSize:37,lineHeight:1.22,
          padding:'16px 25px',background:'rgba(37,60,52,.95)',color:'white',borderRadius:6}}>
          {caption.text}
        </div>
      )}
      {ms >= 137000 && (
        <div style={{position:'absolute',left:0,right:0,bottom:80,textAlign:'center',fontSize:31,color:green,
          background:'rgba(247,244,237,.92)',padding:18}}>
          Try the demo · d2g4a2ezl5lw7r.cloudfront.net/career
        </div>
      )}
    </AbsoluteFill>
  );
};
