import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Form, { buildPayload, getPath, initialValues } from '../../components/Form.jsx';
import { Empty, ErrorBox, Loader, Modal } from '../../components/ui.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../lib/toast.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { fmtDate } from '../../lib/format.js';
import { AdminTitle } from './AdminLayout.jsx';

const cell = (col, item) => {
  const v = getPath(item, col.key);
  if (col.type === 'date') return v ? fmtDate(v) : '';
  if (col.type === 'bool') return <span className={`chip ${v ? 'chip-upcoming' : 'chip-plain'}`}>{v ? 'Published' : 'Hidden'}</span>;
  if (col.type === 'image') return v?.url ? <img className="thumb" src={v.url} alt="" /> : <span className="thumb thumb-empty" />;
  if (col.type === 'count') return Array.isArray(v) ? v.length : 0;
  return v ?? '';
};

export default function ResourceManager({ cfg }) {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(`${cfg.endpoint}${cfg.query || '?limit=100'}`);
  const [editing, setEditing] = useState(null); // { item|null }
  const [values, setValues] = useState({});
  const [busy, setBusy] = useState(false);
  const items = data?.items || [];

  const open = async (item) => {
    try {
      const full = item ? await api.get(`${cfg.endpoint}/${item._id}`) : null;
      setValues(initialValues(cfg.fields, full || {}, cfg.defaults));
      setEditing({ item: full });
    } catch (e) {
      toast.error(e.message);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = buildPayload(cfg.fields, values);
      if (editing.item) {
        await api.patch(`${cfg.endpoint}/${editing.item._id}`, body);
        toast.success(`${cfg.singular} saved`);
        setEditing(null);
      } else {
        const created = await api.post(cfg.endpoint, body);
        toast.success(`${cfg.singular} created`);
        // keep the drawer open on the new record so photos / updates can be added
        if (cfg.Extra) setEditing({ item: await api.get(`${cfg.endpoint}/${created._id}`) });
        else setEditing(null);
      }
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item[cfg.titleKey]}"? This cannot be undone.`)) return;
    try {
      await api.del(`${cfg.endpoint}/${item._id}`);
      toast.success(`${cfg.singular} deleted`);
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <AdminTitle title={cfg.title}>
        <button className="btn btn-primary btn-sm" onClick={() => open(null)}><Plus size={16} /> Add {cfg.singular.toLowerCase()}</button>
      </AdminTitle>
      {cfg.intro && <p className="muted admin-intro">{cfg.intro}</p>}
      {loading ? <Loader /> : error ? <ErrorBox error={error} /> : items.length === 0 ? (
        <Empty title={`No ${cfg.title.toLowerCase()} yet`}>Use the button above to add the first one.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{cfg.columns.map((c) => <th key={c.key}>{c.label}</th>)}<th aria-label="Actions" /></tr></thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  {cfg.columns.map((c) => <td key={c.key} data-label={c.label}>{cell(c, it)}</td>)}
                  <td className="actions">
                    <button className="icon-btn" onClick={() => open(it)} aria-label={`Edit ${it[cfg.titleKey]}`}><Pencil size={16} /></button>
                    {isAdmin && <button className="icon-btn danger" onClick={() => remove(it)} aria-label={`Delete ${it[cfg.titleKey]}`}><Trash2 size={16} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.item ? `Edit ${cfg.singular.toLowerCase()}` : `New ${cfg.singular.toLowerCase()}`} wide>
        {editing && (
          <>
            <form onSubmit={save} className="form">
              <Form fields={cfg.fields} values={values} onChange={setValues} />
              <div className="form-actions">
                <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving' : 'Save'}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Close</button>
              </div>
            </form>
            {cfg.Extra && editing.item && <cfg.Extra item={editing.item} onChanged={reload} />}
            {cfg.Extra && !editing.item && <p className="muted small">Save first, then you can add photos and updates.</p>}
          </>
        )}
      </Modal>
    </>
  );
}
