import {randomUUID} from 'node:crypto';
import path from 'node:path';
import type {Caption} from '@remotion/captions';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import type {CaptionStyle, CaptionedVideoProps} from '../src/remotion/types';
import {OUT, PORT, REMOTION_ENTRY} from './paths';
import type {VideoRecord} from './records';

export type RenderJob = {
  status: 'bundling' | 'rendering' | 'done' | 'error';
  progress: number;
  url?: string;
  error?: string;
};

const jobs = new Map<string, RenderJob>();

export function getJob(jobId: string): RenderJob | undefined {
  return jobs.get(jobId);
}

export function startRender(record: VideoRecord, captions: Caption[], style: CaptionStyle): string {
  const jobId = randomUUID();
  const job: RenderJob = {status: 'bundling', progress: 0};
  jobs.set(jobId, job);

  void (async () => {
    try {
      // Bundling every time keeps renders in sync with code changes;
      // webpack's cache makes repeat bundles fast.
      const serveUrl = await bundle({entryPoint: REMOTION_ENTRY});
      job.status = 'rendering';

      const inputProps: CaptionedVideoProps = {
        videoSrc: `http://localhost:${PORT}/uploads/${record.fileName}`,
        captions,
        style,
        ...record.meta,
      };

      const composition = await selectComposition({serveUrl, id: 'CaptionedVideo', inputProps});
      const baseName = path.parse(record.originalName).name.replace(/[^\w-]+/g, '_') || 'video';
      const outName = `${baseName}-subtitulado-${Date.now()}.mp4`;

      await renderMedia({
        composition,
        serveUrl,
        codec: 'h264',
        outputLocation: path.join(OUT, outName),
        inputProps,
        onProgress: ({progress}) => {
          job.progress = progress;
        },
      });

      job.status = 'done';
      job.progress = 1;
      job.url = `/out/${outName}`;
    } catch (err) {
      job.status = 'error';
      job.error = err instanceof Error ? err.message : String(err);
      console.error(err);
    }
  })();

  return jobId;
}
