import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.join(ROOT, 'data');
export const UPLOADS = path.join(DATA, 'uploads');
export const OUT = path.join(DATA, 'out');
export const WHISPER_PATH = path.join(ROOT, 'whisper.cpp');
export const REMOTION_ENTRY = path.join(ROOT, 'src', 'remotion', 'index.ts');
export const PORT = Number(process.env.PORT ?? 3001);
