import type {Caption} from '@remotion/captions';
import React, {useState} from 'react';

type Props = {
  captions: Caption[];
  onChange: (captions: Caption[]) => void;
  onSeek: (ms: number) => void;
};

/** Keeps Whisper's leading space (it marks where a new word starts). */
const withLead = (original: string, value: string) => {
  const lead = original.slice(0, original.length - original.trimStart().length);
  return lead + value.trimStart();
};

const fmt = (ms: number) => {
  const s = ms / 1000;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
};

export const WordsPanel: React.FC<Props> = ({captions, onChange, onSeek}) => {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');

  const update = (i: number, value: string) =>
    onChange(captions.map((c, j) => (j === i ? {...c, text: withLead(c.text, value)} : c)));

  const remove = (i: number) => onChange(captions.filter((_, j) => j !== i));

  const replaceAll = () => {
    if (!find.trim()) return;
    const needle = find.trim().toLowerCase();
    onChange(
      captions.map((c) =>
        c.text.trim().toLowerCase() === needle ? {...c, text: withLead(c.text, replace)} : c,
      ),
    );
  };

  return (
    <div className="panel">
      <p className="hint">
        Corrige lo que Whisper haya entendido mal. Haz clic en la hora para saltar a ese momento.
      </p>

      <div className="replace">
        <input placeholder="Buscar palabra" value={find} onChange={(e) => setFind(e.target.value)} />
        <input placeholder="Reemplazar por" value={replace} onChange={(e) => setReplace(e.target.value)} />
        <button className="secondary" onClick={replaceAll}>
          Reemplazar todas
        </button>
      </div>

      <div className="words">
        {captions.map((c, i) => (
          <div className="word" key={i}>
            <button className="time" onClick={() => onSeek(c.startMs)} title="Ir a este momento">
              {fmt(c.startMs)}
            </button>
            <input
              value={c.text.trimStart()}
              size={Math.max(3, c.text.trim().length)}
              onChange={(e) => update(i, e.target.value)}
            />
            <button className="del" onClick={() => remove(i)} title="Quitar palabra">
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
