import type {Caption} from '@remotion/captions';

export type FontKey = 'montserrat' | 'poppins' | 'bebas' | 'anton' | 'cinzel';

export type CaptionStyle = {
  fontKey: FontKey;
  /** Font size in px for a 1080px-wide video (scaled for other widths). */
  fontSize: number;
  textColor: string;
  /** Colour of the word being spoken (when highlightMode is "color"). */
  highlightColor: string;
  /** "color" recolours the active word, "box" puts a rounded box behind it. */
  highlightMode: 'color' | 'box';
  boxColor: string;
  strokeColor: string;
  /** Stroke width in px for a 1080px-wide video. 0 = no stroke. */
  strokeWidth: number;
  /** Vertical position of the caption centre, in % from the top. */
  positionY: number;
  uppercase: boolean;
  /** Words closer together than this (ms) are grouped on the same screen. */
  combineMs: number;
  /** Small "pop" animation when each group of words appears. */
  pop: boolean;
};

export type CaptionedVideoProps = {
  videoSrc: string;
  captions: Caption[];
  style: CaptionStyle;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
};

export const DEFAULT_STYLE: CaptionStyle = {
  fontKey: 'montserrat',
  fontSize: 78,
  textColor: '#FFFFFF',
  highlightColor: '#FFD43B',
  highlightMode: 'color',
  boxColor: '#C0392B',
  strokeColor: '#000000',
  strokeWidth: 10,
  positionY: 72,
  uppercase: true,
  combineMs: 900,
  pop: true,
};
