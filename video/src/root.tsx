import React from 'react';
import {Composition} from 'remotion';
import {LearnSprintDemo} from './video';
import timeline from './timeline.json';

export const Root: React.FC = () => (
  <Composition
    id="LearnSprintDemo"
    component={LearnSprintDemo}
    durationInFrames={Math.ceil(timeline.durationMs / 1000 * 30)}
    fps={30}
    width={1920}
    height={1080}
  />
);
