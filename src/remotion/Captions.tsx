import {createTikTokStyleCaptions, type Caption, type TikTokPage} from '@remotion/captions';
import React, {useMemo} from 'react';
import {AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONTS} from './fonts';
import type {CaptionStyle} from './types';

/** How long a group stays on screen after its last word if nothing follows. */
const LINGER_MS = 400;

export const Captions: React.FC<{captions: Caption[]; style: CaptionStyle}> = ({captions, style}) => {
  const {fps} = useVideoConfig();

  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: style.combineMs,
      }).pages,
    [captions, style.combineMs],
  );

  return (
    <>
      {pages.map((page, i) => {
        if (page.tokens.length === 0) return null;
        const next = pages[i + 1];
        const lastToken = page.tokens[page.tokens.length - 1];
        const endMs = Math.min(next ? next.startMs : Infinity, lastToken.toMs + LINGER_MS);
        const from = Math.floor((page.startMs / 1000) * fps);
        const durationInFrames = Math.max(1, Math.floor((endMs / 1000) * fps) - from);

        return (
          <Sequence key={i} from={from} durationInFrames={durationInFrames} layout="none">
            <CaptionPage page={page} style={style} />
          </Sequence>
        );
      })}
    </>
  );
};

const CaptionPage: React.FC<{page: TikTokPage; style: CaptionStyle}> = ({page, style}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();

  // Absolute time in the video (ms) for this frame.
  const timeMs = page.startMs + (frame / fps) * 1000;
  const scale = width / 1080;
  const font = FONTS[style.fontKey] ?? FONTS.montserrat;

  const enter = style.pop
    ? spring({frame, fps, durationInFrames: 6, config: {damping: 200}})
    : 1;

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${style.positionY}%`,
          transform: `translateY(-50%) scale(${0.85 + 0.15 * enter})`,
          padding: '0 6%',
          textAlign: 'center',
          whiteSpace: 'pre-wrap',
          fontFamily: font.fontFamily,
          fontWeight: font.fontWeight,
          fontSize: style.fontSize * scale,
          lineHeight: 1.2,
          textTransform: style.uppercase ? 'uppercase' : 'none',
          color: style.textColor,
          // Stroke drawn behind the fill so it doesn't eat into the letters.
          WebkitTextStroke:
            style.strokeWidth > 0 ? `${style.strokeWidth * 2 * scale}px ${style.strokeColor}` : undefined,
          paintOrder: 'stroke fill',
          textShadow: `0 ${4 * scale}px ${14 * scale}px rgba(0,0,0,0.35)`,
        }}
      >
        {page.tokens.map((token, j) => {
          const word = token.text.trimStart();
          const lead = token.text.slice(0, token.text.length - word.length);
          const active = timeMs >= token.fromMs && timeMs < token.toMs;

          const activeStyle: React.CSSProperties =
            style.highlightMode === 'box'
              ? {
                  backgroundColor: style.boxColor,
                  borderRadius: 14 * scale,
                  padding: `0 ${0.15 * style.fontSize * scale}px`,
                }
              : {color: style.highlightColor};

          return (
            <React.Fragment key={j}>
              {lead}
              <span style={active ? activeStyle : undefined}>{word}</span>
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
