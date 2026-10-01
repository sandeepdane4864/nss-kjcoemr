import { Empty, ErrorBox, Loader } from '../../components/ui.jsx';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useToast } from '../../lib/toast.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { fmtDate, fmtTime } from '../../lib/format.js';
import { AdminTitle } from './AdminLayout.jsx';

export default function AdminMessages() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch('/contact');
  const act = async (fn) => {
    try { await fn(); reload(); } catch (e) { toast.error(e.message); }
  };
  return (
    <>
      <AdminTitle title="Messages" />
      {loading ? <Loader /> : error ? <ErrorBox error={error} /> : data.length === 0 ? <Empty title="No messages" /> : (
        <ul className="messages-admin">
          {data.map((m) => (
            <li key={m._id} className={m.isRead ? '' : 'unread'}>
              <div className="msg-head">
                <b>{m.subject || 'No subject'}</b>
                <span>{m.name}, <a href={`mailto:${m.email}`} className="text-link">{m.email}</a></span>
                <time>{fmtDate(m.createdAt)}, {fmtTime(m.createdAt)}</time>
              </div>
              <p>{m.message}</p>
              <div className="row-actions">
                {!m.isRead && <button className="btn btn-ghost btn-sm" onClick={() => act(() => api.patch(`/contact/${m._id}/read`))}>Mark as read</button>}
                {isAdmin && <button className="btn btn-ghost btn-sm danger" onClick={() => window.confirm('Delete this message?') && act(() => api.del(`/contact/${m._id}`))}>Delete</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
