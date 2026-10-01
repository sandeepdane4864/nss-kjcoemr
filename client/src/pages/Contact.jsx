import { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PageHead, usePageTitle } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useSite } from '../lib/site.jsx';
import { useToast } from '../lib/toast.jsx';

export default function Contact() {
  usePageTitle('Contact');
  const { settings: s } = useSite();
  const c = s.contact || {};
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post('/contact', f);
      toast.success(r.message);
      setF({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead title="Contact">Questions about joining, events or certificates? Write to the NSS office.</PageHead>
      <section className="section-tight">
        <div className="container contact-grid">
          <form onSubmit={submit} className="form">
            <label className="field">Your name<input className="input" required value={f.name} onChange={on('name')} /></label>
            <label className="field">Email<input className="input" type="email" required value={f.email} onChange={on('email')} /></label>
            <label className="field">Subject<input className="input" value={f.subject} onChange={on('subject')} /></label>
            <label className="field">Message<textarea className="input" rows={6} required maxLength={2000} value={f.message} onChange={on('message')} /></label>
            <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending' : 'Send message'}</button>
          </form>
          <div>
            <ul className="contact-card">
              {c.address && <li><MapPin size={18} /><span>{c.address}</span></li>}
              {c.phone && <li><Phone size={18} /><a href={`tel:${c.phone}`}>{c.phone}</a></li>}
              {c.email && <li><Mail size={18} /><a href={`mailto:${c.email}`}>{c.email}</a></li>}
            </ul>
            <iframe
              title="College location"
              className="map"
              loading="lazy"
              src={c.mapUrl || `https://www.google.com/maps?q=${encodeURIComponent(c.address || 'KJ College of Engineering and Management Research, Pune')}&output=embed`}
            />
          </div>
        </div>
      </section>
    </>
  );
}
