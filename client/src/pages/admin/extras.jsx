import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useToast } from '../../lib/toast.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { fmtDate, fmtTime } from '../../lib/format.js';

// Multi-photo uploader used for both events and albums.
function PhotoManager({ base, initial, folder, onChanged }) {
  const toast = useToast();
  const [photos, setPhotos] = useState(initial || []);
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    try {
      const up = await api.uploadMany(files, folder);
      const res = await api.post(`${base}/photos`, { photos: up });
      setPhotos(res.photos || res);
      toast.success(`${up.length} photo${up.length > 1 ? 's' : ''} added`);
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  const remove = async (p) => {
    try {
      const res = await api.del(`${base}/photos/${p._id}`);
      setPhotos(res.photos || res);
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <section className="extra">
      <div className="extra-head">
        <h3>Photos ({photos.length})</h3>
        <label className="btn btn-ghost btn-sm">{busy ? 'Uploading' : 'Add photos'}<input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={add} disabled={busy} /></label>
      </div>
      <div className="photo-admin">
        {photos.map((p) => (
          <figure key={p._id}>
            <img src={p.url} alt={p.caption || ''} />
            <button type="button" className="icon-btn danger" onClick={() => remove(p)} aria-label="Remove photo"><Trash2 size={14} /></button>
          </figure>
        ))}
      </div>
    </section>
  );
}

export const AlbumExtra = ({ item, onChanged }) => <PhotoManager base={`/albums/${item._id}`} initial={item.photos} folder="gallery" onChanged={onChanged} />;

export function EventExtra({ item, onChanged }) {
  const toast = useToast();
  const [updates, setUpdates] = useState(item.dailyUpdates || []);
  const [text, setText] = useState('');
  const regs = useFetch(`/registrations/event/${item._id}`);

  const post = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      setUpdates(await api.post(`/events/${item._id}/updates`, { text }));
      setText('');
    } catch (err) {
      toast.error(err.message);
    }
  };
  const del = async (u) => {
    try {
      setUpdates(await api.del(`/events/${item._id}/updates/${u._id}`));
    } catch (err) {
      toast.error(err.message);
    }
  };
  const issue = async () => {
    if (!window.confirm('Issue participation certificates to everyone registered for this event?')) return;
    try {
      const r = await api.post(`/certificates/event/${item._id}`);
      toast.success(`${r.issued} certificates issued, ${r.skipped} already had one`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <section className="extra">
        <h3>Live updates</h3>
        <form className="inline-form" onSubmit={post}>
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Post an update, for example: Registration desk is open" />
          <button className="btn btn-primary btn-sm">Post</button>
        </form>
        <ul className="update-admin">
          {updates.map((u) => (
            <li key={u._id}><span><time>{fmtDate(u.at)}, {fmtTime(u.at)}</time> {u.text}</span><button type="button" className="icon-btn danger" onClick={() => del(u)} aria-label="Delete update"><Trash2 size={14} /></button></li>
          ))}
        </ul>
      </section>
      <PhotoManager base={`/events/${item._id}`} initial={item.photos} folder="events" onChanged={onChanged} />
      <section className="extra">
        <div className="extra-head">
          <h3>Registrations ({regs.data?.length ?? 0})</h3>
          <button type="button" className="btn btn-ghost btn-sm" onClick={issue}>Issue certificates</button>
        </div>
        <ul className="reg-admin">
          {(regs.data || []).map((r) => (
            <li key={r._id}><b>{r.user?.name}</b><span>{[r.user?.year, r.user?.department, r.user?.phone].filter(Boolean).join(', ')}</span></li>
          ))}
          {regs.data?.length === 0 && <li className="muted">No registrations yet.</li>}
        </ul>
      </section>
    </>
  );
}
