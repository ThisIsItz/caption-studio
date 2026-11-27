import React from 'react';
import {FONTS} from '../remotion/fonts';
import {DEFAULT_STYLE, type CaptionStyle, type FontKey} from '../remotion/types';

type Props = {
  style: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
  onSaveDefault: () => void;
};

export const StylePanel: React.FC<Props> = ({style, onChange, onSaveDefault}) => {
  const set = <K extends keyof CaptionStyle>(key: K, value: CaptionStyle[K]) =>
    onChange({...style, [key]: value});

  return (
    <div className="panel">
      <label className="field">
        <span>Fuente</span>
        <select value={style.fontKey} onChange={(e) => set('fontKey', e.target.value as FontKey)}>
          {Object.entries(FONTS).map(([key, f]) => (
            <option key={key} value={key}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <Range label="Tamaño" value={style.fontSize} min={36} max={160} onChange={(v) => set('fontSize', v)} />
      <Range
        label="Posición vertical"
        value={style.positionY}
        min={10}
        max={90}
        suffix="%"
        onChange={(v) => set('positionY', v)}
      />
      <Range
        label="Palabras por pantalla"
        hint="Más alto = más palabras juntas"
        value={style.combineMs}
        min={0}
        max={3000}
        step={100}
        suffix=" ms"
        onChange={(v) => set('combineMs', v)}
      />

      <div className="row">
        <Color label="Texto" value={style.textColor} onChange={(v) => set('textColor', v)} />
        <Color label="Contorno" value={style.strokeColor} onChange={(v) => set('strokeColor', v)} />
      </div>
      <Range
        label="Grosor del contorno"
        value={style.strokeWidth}
        min={0}
        max={24}
        onChange={(v) => set('strokeWidth', v)}
      />

      <label className="field">
        <span>Resaltar la palabra que se dice</span>
        <select
          value={style.highlightMode}
          onChange={(e) => set('highlightMode', e.target.value as CaptionStyle['highlightMode'])}
        >
          <option value="color">Cambiando el color</option>
          <option value="box">Con una caja detrás</option>
        </select>
      </label>
      {style.highlightMode === 'color' ? (
        <Color label="Color de resaltado" value={style.highlightColor} onChange={(v) => set('highlightColor', v)} />
      ) : (
        <Color label="Color de la caja" value={style.boxColor} onChange={(v) => set('boxColor', v)} />
      )}

      <label className="check">
        <input type="checkbox" checked={style.uppercase} onChange={(e) => set('uppercase', e.target.checked)} />
        MAYÚSCULAS
      </label>
      <label className="check">
        <input type="checkbox" checked={style.pop} onChange={(e) => set('pop', e.target.checked)} />
        Animación al aparecer
      </label>

      <div className="row">
        <button className="secondary" onClick={onSaveDefault}>
          Guardar como mi estilo
        </button>
        <button className="ghost" onClick={() => onChange(DEFAULT_STYLE)}>
          Restablecer
        </button>
      </div>
    </div>
  );
};

const Range: React.FC<{
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}> = ({label, hint, value, min, max, step = 1, suffix = '', onChange}) => (
  <label className="field">
    <span>
      {label} <em>{value}{suffix}</em>
    </span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    {hint ? <small>{hint}</small> : null}
  </label>
);

const Color: React.FC<{label: string; value: string; onChange: (v: string) => void}> = ({label, value, onChange}) => (
  <label className="field color">
    <span>{label}</span>
    <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
  </label>
);
