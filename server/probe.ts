import {run} from './run';

export type VideoMeta = {
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
};

type FfprobeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  r_frame_rate?: string;
  duration?: string;
  tags?: {rotate?: string};
  side_data_list?: {rotation?: number}[];
};

/** Reads size, fps and duration of a video using the ffprobe bundled with Remotion. */
export async function probe(file: string): Promise<VideoMeta> {
  const raw = await run('npx', [
    'remotion', 'ffprobe',
    '-v', 'error',
    '-print_format', 'json',
    '-show_streams',
    '-show_format',
    file,
  ]);
  const json = JSON.parse(raw) as {streams: FfprobeStream[]; format?: {duration?: string}};
  const video = json.streams.find((s) => s.codec_type === 'video');
  if (!video?.width || !video.height) throw new Error('No se ha encontrado una pista de vídeo.');

  let {width, height} = video;

  // Phone videos are often stored landscape with a rotation flag.
  const rotation = Number(
    video.tags?.rotate ?? video.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? 0,
  );
  if (Math.abs(rotation) % 180 === 90) [width, height] = [height, width];

  const [num, den] = String(video.avg_frame_rate || video.r_frame_rate || '30/1')
    .split('/')
    .map(Number);
  let fps = den ? num / den : num;
  if (!Number.isFinite(fps) || fps <= 0 || fps > 120) fps = 30;
  fps = Math.round(fps);

  const durationSec = Number(json.format?.duration ?? video.duration ?? 0);
  if (!durationSec) throw new Error('No se ha podido leer la duración del vídeo.');

  return {width, height, fps, durationInFrames: Math.max(1, Math.ceil(durationSec * fps))};
}
