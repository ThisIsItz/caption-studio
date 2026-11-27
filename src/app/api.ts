import type {Caption} from '@remotion/captions';
import type {CaptionStyle} from '../remotion/types';

export type VideoRecord = {
  id: string;
  fileName: string;
  originalName: string;
  meta: {width: number; height: number; fps: number; durationInFrames: number};
};

export type RenderJob = {
  status: 'bundling' | 'rendering' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
};

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Error ${res.status}`);
  return body as T;
}

export async function uploadVideo(file: File): Promise<VideoRecord> {
  const form = new FormData();
  form.append('video', file);
  return json(await fetch('/api/upload', {method: 'POST', body: form}));
}

export async function transcribe(id: string): Promise<Caption[]> {
  const body = await json<{captions: Caption[]}>(
    await fetch('/api/transcribe', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id}),
    }),
  );
  return body.captions;
}

export async function startRender(id: string, captions: Caption[], style: CaptionStyle): Promise<string> {
  const body = await json<{jobId: string}>(
    await fetch('/api/render', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id, captions, style}),
    }),
  );
  return body.jobId;
}

export async function getRender(jobId: string): Promise<RenderJob> {
  return json(await fetch(`/api/render/${jobId}`));
}
