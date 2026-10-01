import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, FileText } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import Form, { buildPayload, initialValues } from '../components/Form.jsx';
import { ErrorBox, Loader, usePageTitle } from '../components/ui.jsx';
import { api, setToken } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useSite } from '../lib/site.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { fmtDate, whenText } from '../lib/format.js';
import { BLOOD_GROUPS, DEPARTMENTS, YEARS } from '../constants.js';

const PROFILE_FIELDS = [
  { name: 'photo', label: 'Profile photo', type: 'image', folder: 'profiles' },
  { name: 'name', label: 'Full name', required: true, half: true },
  { name: 'rollNo', label: 'Roll number', half: true },
  { name: 'department', label: 'Department', type: 'select', options: DEPARTMENTS, half: true },
  { name: 'year', label: 'Year', type: 'select', options: YEARS, half: true },
  { name: 'phone', label: 'Phone', type: 'tel', half: true },
  { name: 'joinedYear', label: 'Joined NSS in (year)', type: 'number', min: 2000, step: 1, half: true },
  { name: 'bloodGroup', label: 'Blood group', type: 'select', options: BLOOD_GROUPS, half: true },
  { name: 'bio', label: 'About you', type: 'textarea', rows: 4, help: 'Up to 500 characters. Shown on your public profile.' },
  { name: 'skills', label: 'Skills', type: 'lines', help: 'One per line' },
  { name: 'socials.linkedin', label: 'LinkedIn URL', half: true },
  { name: 'socials.instagram', label: 'Instagram URL', half: true },
  { name: 'socials.github', label: 'GitHub URL', half: true },
  { name: 'isPublic', label: 'Show my profile on the public volunteers page', type: 'checkbox' },
  { name: 'showBloodGroup', label: 'List my blood group in the donor directory', type: 'checkbox' },
];

function Ring({ value, target }) {
  const pct = Math.min(1, value / target);
  const r = 54;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring">
      <svg viewBox="0 0 130 130" role="img" aria-label={`${value} of ${target} hours`}>
        <circle cx="65" cy="65" r={r} className="ring-bg" />
        <circle cx="65" cy="65" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 65 65)" />
      </svg>
      <div><b>{value}</b><span>of {target} hours</span></div>
    </div>
  );
}

function Overview() {
  const { user } = useAuth();
  const { settings } = useSite();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch('/users/me/dashboard');
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} />;
  const rate = async (reg, rating) => {
    try {
      await api.post(`/registrations/${reg._id}/feedback`, { rating });
      toast.success('Thanks for the feedback');
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };
  return (
    <div className="dash-grid">
      <section className="panel hours-panel">
        <Ring value={data.hoursTotal} target={settings.targetHours || 120} />
        <div>
          <h2>Your service hours</h2>
          <p className="muted">Hours are recorded by your coordinators after each activity.</p>
          {data.badges.length > 0 && (
            <ul className="badges">{data.badges.map((b) => <li key={b.key}><Award size={18} /><div><b>{b.label}</b><span>{fmtDate(b.awardedAt)}</span></div></li>)}</ul>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Registered events</h2>
        {data.upcoming.length === 0 ? <p className="muted">You have not registered for any upcoming event. <Link to="/events" className="text-link">Browse events</Link></p> : (
          <ul className="mini-list">
            {data.upcoming.map((r) => (
              <li key={r._id}><Link to={`/events/${r.event.slug}`}><b>{r.event.title}</b><span>{whenText(r.event)}</span></Link></li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2>Certificates</h2>
        {data.certificates.length === 0 ? <p className="muted">Certificates issued to you will appear here.</p> : (
          <ul className="mini-list">
            {data.certificates.map((c) => (
              <li key={c._id}><Link to={`/certificate/${c.code}`}><FileText size={16} /> <b>{c.title}</b><span>Issued {fmtDate(c.issuedAt)}</span></Link></li>
            ))}
          </ul>
        )}
      </section>

      {data.past.length > 0 && (
        <section className="panel">
          <h2>Past events</h2>
          <ul className="mini-list">
            {data.past.map((r) => (
              <li key={r._id} className="rate-row">
                <Link to={`/events/${r.event.slug}`}><b>{r.event.title}</b><span>{fmtDate(r.event.startDate)}</span></Link>
                <select className="input input-sm" aria-label={`Rate ${r.event.title}`} value={r.feedback?.rating || ''} onChange={(e) => rate(r, e.target.value)}>
                  <option value="" disabled>Rate</option>
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} of 5</option>)}
                </select>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="muted small">Account status: {user.status}. Public profile: {user.isPublic ? 'visible' : 'hidden'}.</p>
    </div>
  );
}

function Profile({ onSaved }) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [v, setV] = useState(() => initialValues(PROFILE_FIELDS, user));
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      setUser(await api.patch('/auth/me', buildPayload(PROFILE_FIELDS, v)));
      toast.success('Profile saved');
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="panel form" onSubmit={save}>
      <Form fields={PROFILE_FIELDS} values={v} onChange={setV} />
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving' : 'Save profile'}</button>
    </form>
  );
}

function Security() {
  const toast = useToast();
  const { setUser } = useAuth();
  const [f, setF] = useState({ currentPassword: '', newPassword: '' });
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/auth/change-password', f);
      if (r.token) setToken(r.token);
      setUser(r.user);
      setF({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <form className="panel form narrow" onSubmit={submit}>
      <label className="field"><span className="field-label">Current password</span><input className="input" type="password" required autoComplete="current-password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></label>
      <label className="field"><span className="field-label">New password</span><input className="input" type="password" required minLength={8} autoComplete="new-password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /></label>
      <button className="btn btn-primary">Change password</button>
    </form>
  );
}

export default function Dashboard() {
  usePageTitle('My profile');
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  return (
    <section className="section-tight">
      <div className="container">
        <div className="dash-head">

          {/* Profile photo */}
          <div className="dash-avatar">
            <Avatar
              name={user.name}
              src={user.photo?.url}
              size={106}
            />
          </div>

          {/* Profile information */}
          <div className="dash-profile-info">
            <h1>{user.name}</h1>

            <p className="muted">
              {[
                user.year,
                user.department,
              ]
                .filter(Boolean)
                .join(', ') || user.email}
            </p>

            {user.joinedYear && (
              <span className="dash-joined">
                Volunteer since {user.joinedYear}
              </span>
            )}
          </div>

          {/* Public profile button */}
          <Link
            to={`/volunteers/${user._id}`}
            className="btn btn-ghost dash-profile-btn"
          >
            View public profile
          </Link>

        </div>
        <div className="seg" role="tablist">
          {[['overview', 'Overview'], ['profile', 'Edit profile'], ['security', 'Password']].map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {tab === 'overview' && <Overview />}
        {tab === 'profile' && <Profile onSaved={() => { setTab('overview'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
        {tab === 'security' && <Security />}
      </div>
    </section>
  );
}