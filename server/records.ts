import fs from 'node:fs';
import path from 'node:path';
import type {VideoMeta} from './probe';
import {UPLOADS} from './paths';

export type VideoRecord = {
  id: string;
  fileName: string;
  originalName: string;
  meta: VideoMeta;
};

const ID_RE = /^[0-9a-f-]{36}$/;

export function saveRecord(record: VideoRecord): void {
  fs.writeFileSync(path.join(UPLOADS, `${record.id}.json`), JSON.stringify(record, null, 2));
}

export function readRecord(id: unknown): VideoRecord {
  if (typeof id !== 'string' || !ID_RE.test(id)) throw new Error('Id de vídeo no válido.');
  const file = path.join(UPLOADS, `${id}.json`);
  if (!fs.existsSync(file)) throw new Error('No se encuentra ese vídeo. Vuelve a subirlo.');
  return JSON.parse(fs.readFileSync(file, 'utf8')) as VideoRecord;
}
