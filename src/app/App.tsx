import type {Caption} from '@remotion/captions';
import {Player, type PlayerRef} from '@remotion/player';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CaptionedVideo} from '../remotion/CaptionedVideo';
import {DEFAULT_STYLE, type CaptionStyle, type CaptionedVideoProps} from '../remotion/types';
import {getRender, startRender, transcribe, uploadVideo, type RenderJob, type VideoRecord} from './api';
import {StylePanel} from './StylePanel';
import {WordsPanel} from './WordsPanel';

const STYLE_KEY = 'caption-studio:style';

const loadStyle = (): CaptionStyle => {
  try {
    const saved = localStorage.getItem(STYLE_KEY);
    return saved ? {...DEFAULT_STYLE, ...JSON.parse(saved)} : DEFAULT_STYLE;
  } catch {
    return DEFAULT_STYLE;
  }
};

type Phase = 'empty' | 'uploading' | 'transcribing' | 'editing';

export const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('empty');
  const [record, setRecord] = useState<VideoRecord | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [style, setStyle] = useState<CaptionStyle>(loadStyle);
  const [tab, setTab] = useState<'style' | 'words'>('style');
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<RenderJob | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const playerRef = useRef<PlayerRef>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setJob(null);
    setCaptions([]);
    setPhase('uploading');
    let uploaded = false;
    try {
      const rec = await uploadVideo(file);
      setRecord(rec);
      uploaded = true;
      setPhase('transcribing');
      setCaptions(await transcribe(rec.id));
      setPhase('editing');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      // If only the transcription failed, keep the video so you can still preview it.
      setPhase(uploaded || record ? 'editing' : 'empty');
    }
  };

  const inputProps: CaptionedVideoProps | null = useMemo(
    () =>
      record
        ? {videoSrc: `/uploads/${record.fileName}`, captions, style, ...record.meta}
        : null,
    [record, captions, style],
  );

  const seek = useCallback(
    (ms: number) => {
      if (!record) return;
      playerRef.current?.seekTo(Math.floor((ms / 1000) * record.meta.fps));
    },
    [record],
  );

  const saveDefault = () => {
    localStorage.setItem(STYLE_KEY, JSON.stringify(style));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const render = async () => {
    if (!record) return;
    setError(null);
    try {
      const jobId = await startRender(record.id, captions, style);
      setJob({status: 'bundling', progress: 0});
      pollRender(jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const pollTimer = useRef<number | null>(null);
  const pollRender = (jobId: string) => {
    const tick = async () => {
      try {
        const next = await getRender(jobId);
        setJob(next);
        if (next.status === 'bundling' || next.status === 'rendering') {
          pollTimer.current = window.setTimeout(tick, 700);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    void tick();
  };
  useEffect(() => () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
  }, []);

  const rendering = job?.status === 'bundling' || job?.status === 'rendering';

  return (
    <div className="app">
      <header>
        <h1>Caption Studio</h1>
        <FilePicker onFile={handleFile} disabled={phase === 'uploading' || phase === 'transcribing'} compact={!!record} />
      </header>

      {error ? <div className="error">{error}</div> : null}

      {phase === 'empty' ? (
        <DropZone onFile={handleFile} />
      ) : phase === 'uploading' || phase === 'transcribing' ? (
        <div className="status">
          <div className="spinner" />
          <p>{phase === 'uploading' ? 'Subiendo vídeo…' : 'Transcribiendo con Whisper…'}</p>
          {phase === 'transcribing' ? (
            <small>La primera vez descarga el modelo y tarda más. Después va rápido.</small>
          ) : null}
        </div>
      ) : record && inputProps ? (
        <main>
          <section className="preview">
            <div
              className="player-wrap"
              style={{width: `min(100%, calc(78vh * ${record.meta.width / record.meta.height}))`}}
            >
              <Player
                ref={playerRef}
                component={CaptionedVideo}
                inputProps={inputProps}
                durationInFrames={record.meta.durationInFrames}
                fps={record.meta.fps}
                compositionWidth={record.meta.width}
                compositionHeight={record.meta.height}
                controls
                style={{width: '100%'}}
              />
            </div>
          </section>

          <aside>
            <div className="tabs">
              <button className={tab === 'style' ? 'active' : ''} onClick={() => setTab('style')}>
                Estilo
              </button>
              <button className={tab === 'words' ? 'active' : ''} onClick={() => setTab('words')}>
                Texto ({captions.length})
              </button>
            </div>

            {tab === 'style' ? (
              <StylePanel style={style} onChange={setStyle} onSaveDefault={saveDefault} />
            ) : (
              <WordsPanel captions={captions} onChange={setCaptions} onSeek={seek} />
            )}
            {savedMsg ? <div className="toast">Estilo guardado ✓</div> : null}

            <div className="render">
              <button className="primary" onClick={render} disabled={rendering || captions.length === 0}>
                {rendering ? 'Renderizando…' : 'Exportar vídeo'}
              </button>
              {job ? <RenderStatus job={job} /> : null}
            </div>
          </aside>
        </main>
      ) : null}
    </div>
  );
};

const RenderStatus: React.FC<{job: RenderJob}> = ({job}) => {
  if (job.status === 'error') return <div className="error">Error al renderizar: {job.error}</div>;
  if (job.status === 'done' && job.url) {
    return (
      <a className="download" href={job.url} download>
        ⬇ Descargar MP4
      </a>
    );
  }
  return (
    <div className="progress">
      <div style={{width: `${Math.round(job.progress * 100)}%`}} />
      <span>{job.status === 'bundling' ? 'Preparando…' : `${Math.round(job.progress * 100)}%`}</span>
    </div>
  );
};

const FilePicker: React.FC<{onFile: (f: File) => void; disabled?: boolean; compact?: boolean}> = ({
  onFile,
  disabled,
  compact,
}) => (
  <label className={`file-btn ${disabled ? 'disabled' : ''}`}>
    {compact ? 'Otro vídeo' : 'Elegir vídeo'}
    <input
      type="file"
      accept="video/*"
      disabled={disabled}
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onFile(f);
        e.target.value = '';
      }}
    />
  </label>
);

const DropZone: React.FC<{onFile: (f: File) => void}> = ({onFile}) => {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`dropzone ${over ? 'over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
    >
      <p>Arrastra aquí tu vídeo</p>
      <small>o usa el botón «Elegir vídeo»</small>
    </div>
  );
};
