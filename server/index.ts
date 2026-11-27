import {randomUUID} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, {type Request, type Response} from 'express';
import multer from 'multer';
import {OUT, PORT, UPLOADS} from './paths';
import {probe} from './probe';
import {readRecord, saveRecord, type VideoRecord} from './records';
import {getJob, startRender} from './render';
import {transcribeVideo} from './whisper';

fs.mkdirSync(UPLOADS, {recursive: true});
fs.mkdirSync(OUT, {recursive: true});

const app = express();

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
app.use(express.json({limit: '50mb'}));
app.use('/uploads', express.static(UPLOADS));
app.use('/out', express.static(OUT));

type UploadRequest = Request & {videoId?: string};

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS,
    filename: (req, file, cb) => {
      const id = randomUUID();
      (req as unknown as UploadRequest).videoId = id;
      const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
      cb(null, `${id}${ext}`);
    },
  }),
  limits: {fileSize: 2 * 1024 ** 3},
});

const fail = (res: Response, err: unknown, status = 500) => {
  console.error(err);
  res.status(status).json({error: err instanceof Error ? err.message : String(err)});
};

app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    const {file, videoId} = req as UploadRequest;
    if (!file || !videoId) return fail(res, new Error('No se ha recibido ningún vídeo.'), 400);
    const meta = await probe(file.path);
    const record: VideoRecord = {
      id: videoId,
      fileName: file.filename,
      originalName: file.originalname,
      meta,
    };
    saveRecord(record);
    res.json(record);
  } catch (err) {
    fail(res, err);
  }
});

app.post('/api/transcribe', async (req, res) => {
  try {
    const record = readRecord(req.body?.id);
    console.log(`Transcribiendo ${record.originalName}…`);
    const captions = await transcribeVideo(path.join(UPLOADS, record.fileName));
    fs.writeFileSync(path.join(UPLOADS, `${record.id}.captions.json`), JSON.stringify(captions, null, 2));
    res.json({captions});
  } catch (err) {
    fail(res, err);
  }
});

app.post('/api/render', (req, res) => {
  try {
    const record = readRecord(req.body?.id);
    const {captions, style} = req.body ?? {};
    if (!Array.isArray(captions) || !style) return fail(res, new Error('Faltan subtítulos o estilo.'), 400);
    res.json({jobId: startRender(record, captions, style)});
  } catch (err) {
    fail(res, err);
  }
});

app.get('/api/render/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) return fail(res, new Error('Render no encontrado.'), 404);
  res.json(job);
});

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT} — abre la app en http://localhost:5173`);
});
