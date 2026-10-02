import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Wheel from '../components/Wheel.jsx';
import { usePageTitle } from '../components/ui.jsx';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { DEPARTMENTS, YEARS } from '../constants.js';

const Shell = ({ title, sub, children }) => (
  <section className="auth">
    <div className="auth-side">
      <Wheel className="auth-wheel" ring="#fff" accent="#fff" paper="transparent" />
      <h2>Not me,<br />but you.</h2>
      <p>One account for your profile, event registrations and certificates.</p>
    </div>
    <div className="auth-main">
      <div className="auth-box">
        <h1>{title}</h1>
        <p className="muted">{sub}</p>
        {children}
      </div>
    </div>
  </section>
);


export function Login() {
  usePageTitle('Log in');
  const { user, login, isStaff } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return (
      <Navigate
        to={loc.state?.from || (isStaff ? '/admin' : '/me')}
        replace
      />
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');

    try {
      const u = await login(f.email, f.password);
      nav(
        loc.state?.from ||
          (['superadmin', 'officer', 'coordinator'].includes(u.role)
            ? '/admin'
            : '/me'),
        { replace: true }
      );
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title="Log in" sub="Use the email you registered with.">
      <form onSubmit={submit} className="form">
        {err && (
          <p className="alert alert-err" role="alert">
            {err}
          </p>
        )}

        <label className="field">
          <span className="field-label">Email</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            required
            value={f.email}
            onChange={(e) =>
              setF({ ...f, email: e.target.value })
            }
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <input
            className="input"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={f.password}
            onChange={(e) =>
              setF({ ...f, password: e.target.value })
            }
          />
        </label>

        <label
          className="show-password"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '-8px',
            marginBottom: '8px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          <span>Show password</span>
        </label>

        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="muted small">
        New volunteer?{' '}
        <Link to="/register" className="text-link">
          Create an account
        </Link>
      </p>
    </Shell>
  );
}

export function Register() {
  usePageTitle('Join NSS');
  const [f, setF] = useState({ name: '', email: '', password: '', department: '', year: '', rollNo: '', phone: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
      const r = await api.post('/auth/register', body);
      setDone(r.message);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <Shell title="Request received" sub={done}>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </Shell>
    );
  return (
    <Shell title="Join as a volunteer" sub="Your NSS coordinator approves new accounts before you can log in.">
      <form onSubmit={submit} className="form">
        {err && <p className="alert alert-err" role="alert">{err}</p>}
        <label className="field"><span className="field-label">Full name</span><input className="input" required value={f.name} onChange={on('name')} autoComplete="name" /></label>
        <label className="field"><span className="field-label">Email</span><input className="input" type="email" required value={f.email} onChange={on('email')} autoComplete="email" /></label>
        <label className="field"><span className="field-label">Password</span><input className="input" type="password" required minLength={8} value={f.password} onChange={on('password')} autoComplete="new-password" /><small>At least 8 characters</small></label>
        <div className="form-grid">
          <label className="field half"><span className="field-label">Department</span>
            <select className="input" required value={f.department} onChange={on('department')}><option value="">Select</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select></label>
          <label className="field half"><span className="field-label">Year</span>
            <select className="input" required value={f.year} onChange={on('year')}><option value="">Select</option>{YEARS.map((y) => <option key={y}>{y}</option>)}</select></label>
          <label className="field half"><span className="field-label">Roll number</span><input className="input" value={f.rollNo} onChange={on('rollNo')} /></label>
          <label className="field half"><span className="field-label">Phone</span><input className="input" type="tel" value={f.phone} onChange={on('phone')} autoComplete="tel" /></label>
        </div>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending' : 'Request account'}</button>
      </form>
      <p className="muted small">Already approved? <Link to="/login" className="text-link">Log in</Link></p>
    </Shell>
  );
}
