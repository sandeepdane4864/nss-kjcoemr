import { useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';

export const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
export const setPath = (o, p, v) => {
  const keys = p.split('.');
  const out = { ...o };
  let cur = out;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) cur[k] = v;
    else {
      cur[k] = { ...(cur[k] || {}) };
      cur = cur[k];
    }
  });
  return out;
};

const pad = (n) => String(n).padStart(2, '0');
const toLocalInput = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
};

// doc value -> form state
export function toFormValue(f, v) {
  switch (f.type) {
    case 'datetime': return v ? toLocalInput(v) : '';
    case 'date': return v ? toLocalInput(v).slice(0, 10) : '';
    case 'lines': return Array.isArray(v) ? v.join('\n') : '';
    case 'pairs': return Array.isArray(v) ? v.map((h) => `${h.label}: ${h.value}`).join('\n') : '';
    case 'checkbox': return Boolean(v);
    case 'image': return v?.url ? v : null;
    case 'number': return v ?? '';
    default: return v ?? '';
  }
}
// form state -> payload value (undefined = omit)
export function fromFormValue(f, v) {
  switch (f.type) {
    case 'datetime':
    case 'date': return v ? new Date(v).toISOString() : undefined;
    case 'lines': return String(v).split('\n').map((s) => s.trim()).filter(Boolean);
    case 'pairs':
      return String(v).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const i = l.indexOf(':');
        return i === -1 ? { label: l, value: '' } : { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() };
      });
    case 'number': return v === '' || v === null ? undefined : Number(v);
    case 'image': return v || undefined;
    default: return v;
  }
}
export const initialValues = (fields, doc = {}, defaults = {}) =>
  Object.fromEntries(fields.map((f) => [f.name, toFormValue(f, getPath(doc, f.name) ?? defaults[f.name])]));
export const buildPayload = (fields, values) =>
  fields.reduce((acc, f) => {
    const v = fromFormValue(f, values[f.name]);
    return v === undefined ? acc : setPath(acc, f.name, v);
  }, {});

export function ImageUpload({ value, onChange, folder = 'misc', label }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      onChange(await api.upload(file, folder));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  return (
    <div className="image-upload">
      {value?.url ? <img src={value.url} alt={label || 'Uploaded'} /> : <div className="image-ph">No image</div>}
      <div>
        <label className="btn btn-ghost btn-sm">
          {busy ? 'Uploading' : value?.url ? 'Replace' : 'Upload image'}
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} disabled={busy} />
        </label>
        {value?.url && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange(null)}>Remove</button>}
        <small>JPG, PNG or WebP, up to 5 MB</small>
      </div>
    </div>
  );
}

export default function Form({ fields, values, onChange }) {
  const set = (name, v) => onChange({ ...values, [name]: v });
  return (
    <div className="form-grid">
      {fields.map((f) => {
        const v = values[f.name];
        const id = `f-${f.name}`;
        const cls = `field ${f.half ? 'half' : ''}`;
        if (f.type === 'checkbox')
          return (
            <label key={f.name} className={`${cls} check`}>
              <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.name, e.target.checked)} /> <span>{f.label}</span>
              {f.help && <small>{f.help}</small>}
            </label>
          );
        if (f.type === 'image')
          return (
            <div key={f.name} className={cls}>
              <span className="field-label">{f.label}</span>
              <ImageUpload value={v} onChange={(x) => set(f.name, x)} folder={f.folder} label={f.label} />
            </div>
          );
        let input;
        if (f.type === 'textarea' || f.type === 'lines' || f.type === 'pairs')
          input = <textarea id={id} className="input" rows={f.rows || (f.type === 'textarea' ? 5 : 4)} value={v} required={f.required} onChange={(e) => set(f.name, e.target.value)} placeholder={f.placeholder} />;
        else if (f.type === 'select')
          input = (
            <select id={id} className="input" value={v} required={f.required} onChange={(e) => set(f.name, e.target.value)}>
              {!f.required && <option value="">{f.emptyLabel || 'Not set'}</option>}
              {f.options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>))}
            </select>
          );
        else
          input = (
            <input
              id={id}
              className="input"
              type={f.type === 'datetime' ? 'datetime-local' : f.type === 'date' ? 'date' : f.type || 'text'}
              value={v}
              required={f.required}
              min={f.min}
              step={f.step}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
            />
          );
        return (
          <label key={f.name} className={cls} htmlFor={id}>
            <span className="field-label">{f.label}</span>
            {input}
            {f.help && <small>{f.help}</small>}
          </label>
        );
      })}
    </div>
  );
}
