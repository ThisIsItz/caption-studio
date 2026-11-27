import React from 'react';
import {Composition} from 'remotion';
import {CaptionedVideo} from './CaptionedVideo';
import {DEFAULT_STYLE, type CaptionedVideoProps} from './types';

const defaultProps: CaptionedVideoProps = {
  videoSrc: '',
  captions: [],
  style: DEFAULT_STYLE,
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300,
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CaptionedVideo"
    component={CaptionedVideo}
    durationInFrames={defaultProps.durationInFrames}
    fps={defaultProps.fps}
    width={defaultProps.width}
    height={defaultProps.height}
    defaultProps={defaultProps}
    // Size, fps and length come from the uploaded video.
    calculateMetadata={({props}) => ({
      durationInFrames: props.durationInFrames,
      fps: props.fps,
      width: props.width,
      height: props.height,
    })}
  />
);
