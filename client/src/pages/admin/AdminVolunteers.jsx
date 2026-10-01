import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Avatar from '../../components/Avatar.jsx';
import { Empty, ErrorBox, Loader } from '../../components/ui.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../lib/toast.jsx';
import { useFetch, qs } from '../../lib/useFetch.js';
import { AdminTitle } from './AdminLayout.jsx';

const STATUSES = [['', 'All'], ['pending', 'Pending'], ['active', 'Active'], ['rejected', 'Rejected'], ['suspended', 'Suspended']];

export default function AdminVolunteers() {
  const { user: me, isAdmin } = useAuth();
  const toast = useToast();
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') || '';
  const q = sp.get('q') || '';
  const page = Number(sp.get('page') || 1);
  const [picked, setPicked] = useState([]);
  const { data, loading, error, reload } = useFetch(`/users${qs({ status, q, page, limit: 25 })}`);
  const items = data?.items || [];

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    if (k !== 'page') n.delete('page');
    setSp(n, { replace: true });
    setPicked([]);
  };
  const run = async (fn, ok) => {
    try {
      await fn();
      toast.success(ok);
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };
  const addHours = (u) => {
    const v = window.prompt(`Add service hours for ${u.name} (use a negative number to subtract)`, '4');
    if (v === null) return;
    const n = Number(v);
    if (!Number.isFinite(n) || n === 0) return toast.error('Enter a number of hours');
    run(() => api.patch(`/users/${u._id}/hours`, { hours: n }), `Updated hours for ${u.name}`);
  };
  const remove = (u) => window.confirm(`Delete ${u.name} and their registrations?`) && run(() => api.del(`/users/${u._id}`), 'Volunteer deleted');
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <AdminTitle title="Volunteers">
        {isAdmin && picked.length > 0 && <button className="btn btn-primary btn-sm" onClick={() => run(async () => { await api.post('/users/bulk-approve', { ids: picked }); setPicked([]); }, `${picked.length} approved`)}>Approve {picked.length} selected</button>}
      </AdminTitle>
      <div className="filters">
        <div className="seg">{STATUSES.map(([v, l]) => <button key={v} className={status === v ? 'on' : ''} onClick={() => set('status', v)}>{l}</button>)}</div>
        <input className="input grow" type="search" placeholder="Search name, email or roll number" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} onBlur={(e) => e.target.value !== q && set('q', e.target.value)} aria-label="Search" />
      </div>
      {loading ? <Loader /> : error ? <ErrorBox error={error} /> : items.length === 0 ? <Empty title="No volunteers match" /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th aria-label="Select" /><th>Volunteer</th><th>Class</th><th>Hours</th><th>Status</th><th>Role</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u._id}>
                  <td>{u.status === 'pending' && isAdmin && <input type="checkbox" checked={picked.includes(u._id)} onChange={() => toggle(u._id)} aria-label={`Select ${u.name}`} />}</td>
                  <td data-label="Volunteer"><div className="who"><Avatar name={u.name} src={u.photo?.url} size={36} /><div><b>{u.name}</b><small>{u.email}</small></div></div></td>
                  <td data-label="Class">{[u.year, u.department].filter(Boolean).join(', ')}</td>
                  <td data-label="Hours">{u.hoursTotal}</td>
                  <td data-label="Status"><span className={`chip chip-s-${u.status}`}>{u.status}</span></td>
                  <td data-label="Role">
                    {me.role === 'superadmin' && u._id !== me._id ? (
                      <select className="input input-sm" value={u.role} onChange={(e) => run(() => api.patch(`/users/${u._id}/role`, { role: e.target.value }), 'Role updated')} aria-label={`Role for ${u.name}`}>
                        {['volunteer', 'coordinator', 'officer', 'superadmin'].map((r) => <option key={r}>{r}</option>)}
                      </select>
                    ) : u.role}
                  </td>
                  <td className="actions wrap">
                    {u.status !== 'active' && <button className="btn btn-primary btn-sm" onClick={() => run(() => api.patch(`/users/${u._id}/status`, { status: 'active' }), `${u.name} approved`)}>Approve</button>}
                    {u.status === 'pending' && <button className="btn btn-ghost btn-sm" onClick={() => run(() => api.patch(`/users/${u._id}/status`, { status: 'rejected' }), `${u.name} rejected`)}>Reject</button>}
                    {u.status === 'active' && <button className="btn btn-ghost btn-sm" onClick={() => addHours(u)}>Add hours</button>}
                    {u.status === 'active' && u._id !== me._id && <button className="btn btn-ghost btn-sm" onClick={() => run(() => api.patch(`/users/${u._id}/status`, { status: 'suspended' }), `${u.name} suspended`)}>Suspend</button>}
                    {isAdmin && u._id !== me._id && <button className="btn btn-ghost btn-sm danger" onClick={() => remove(u)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data?.pages > 1 && (
        <div className="pager">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</button>
          <span>Page {page} of {data.pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => set('page', String(page + 1))}>Next</button>
        </div>
      )}
    </>
  );
}
