import fs from 'node:fs';
import type {Caption} from '@remotion/captions';
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from '@remotion/install-whisper-cpp';
import {WHISPER_PATH} from './paths';
import {run} from './run';

type WhisperModel = Parameters<typeof downloadWhisperModel>[0]['model'];
type WhisperLanguage = Parameters<typeof transcribe>[0]['language'];

const WHISPER_VERSION = '1.5.5';
// "medium" is a good balance for Spanish. Use WHISPER_MODEL=small for speed
// or WHISPER_MODEL=large-v3 for maximum accuracy.
const MODEL = (process.env.WHISPER_MODEL ?? 'medium') as WhisperModel;
const LANGUAGE = (process.env.WHISPER_LANGUAGE ?? 'es') as WhisperLanguage;

let ready: Promise<void> | null = null;

/** Installs whisper.cpp and downloads the model (skipped if already there). */
export function ensureWhisper(): Promise<void> {
  ready ??= (async () => {
    await installWhisperCpp({to: WHISPER_PATH, version: WHISPER_VERSION});
    await downloadWhisperModel({model: MODEL, folder: WHISPER_PATH});
  })();
  return ready;
}

export async function transcribeVideo(videoPath: string): Promise<Caption[]> {
  await ensureWhisper();

  // whisper.cpp needs 16 kHz mono WAV.
  const wavPath = videoPath.replace(/\.[^.]+$/, '') + '.wav';
  await run('npx', ['remotion', 'ffmpeg', '-i', videoPath, '-ar', '16000', '-ac', '1', wavPath, '-y']);

  try {
    const output = await transcribe({
      inputPath: wavPath,
      whisperPath: WHISPER_PATH,
      whisperCppVersion: WHISPER_VERSION,
      model: MODEL,
      language: LANGUAGE,
      tokenLevelTimestamps: true,
    });
    const {captions} = toCaptions({whisperCppOutput: output});
    return captions;
  } finally {
    fs.rmSync(wavPath, {force: true});
  }
}
