import React from 'react';
import {AbsoluteFill, OffthreadVideo} from 'remotion';
import {Captions} from './Captions';
import type {CaptionedVideoProps} from './types';

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({videoSrc, captions, style}) => {
  return (
    <AbsoluteFill style={{backgroundColor: 'black'}}>
      {videoSrc ? <OffthreadVideo src={videoSrc} /> : null}
      <Captions captions={captions} style={style} />
    </AbsoluteFill>
  );
};
