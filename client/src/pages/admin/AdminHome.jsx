import { Link } from 'react-router-dom';
import { Loader } from '../../components/ui.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../lib/toast.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { AdminTitle } from './AdminLayout.jsx';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Bars({ rows, label }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="bars">
      {rows.length === 0 && <li className="muted">No data yet</li>}
      {rows.map((r) => (
        <li key={r.name}>
          <span>{r.name}</span>
          <div><i style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <b>{r.value}{label}</b>
        </li>
      ))}
    </ul>
  );
}

export default function AdminHome() {
  const { user } = useAuth();
  const toast = useToast();
  const stats = useFetch('/stats');
  const an = useFetch('/admin/analytics');
  const pending = useFetch('/users?status=pending&limit=6');

  const decide = async (u, status) => {
    try {
      await api.patch(`/users/${u._id}/status`, { status });
      toast.success(status === 'active' ? `${u.name} approved` : `${u.name} rejected`);
      pending.reload();
      an.reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (stats.loading || an.loading) return <Loader />;
  const s = stats.data || {};
  const a = an.data || { byDepartment: [], eventsPerMonth: [], pendingApprovals: 0 };

  return (
    <>
      <AdminTitle title={`Welcome, ${user.name.split(' ')[0]}`} />
      <div className="kpis">
        {[[s.volunteers, 'Active volunteers'], [a.pendingApprovals, 'Waiting for approval'], [s.upcoming, 'Upcoming events'], [s.eventsDone, 'Events completed'], [Math.round(s.totalHours || 0), 'Hours logged']].map(([n, l]) => (
          <div key={l}><b>{n ?? 0}</b><span>{l}</span></div>
        ))}
      </div>

      <div className="admin-cols">
        <section className="panel">
          <h2>Volunteers by department</h2>
          <Bars rows={a.byDepartment.map((d) => ({ name: d._id, value: d.volunteers }))} />
        </section>
        <section className="panel">
          <h2>Events in the last 12 months</h2>
          <Bars rows={a.eventsPerMonth.map((m) => ({ name: `${MONTHS[m._id.m - 1]} ${m._id.y}`, value: m.events }))} />
        </section>
        <section className="panel span-2">
          <div className="extra-head"><h2>Waiting for approval</h2><Link className="text-link" to="/admin/volunteers?status=pending">See all</Link></div>
          {pending.loading ? <Loader /> : (pending.data?.items || []).length === 0 ? <p className="muted">No pending registrations.</p> : (
            <ul className="mini-list">
              {pending.data.items.map((u) => (
                <li key={u._id} className="rate-row">
                  <span><b>{u.name}</b><small className="muted"> {[u.year, u.department, u.email].filter(Boolean).join(', ')}</small></span>
                  <span className="row-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => decide(u, 'active')}>Approve</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => decide(u, 'rejected')}>Reject</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
