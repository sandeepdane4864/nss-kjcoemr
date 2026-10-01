import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarPlus, Clock, ExternalLink, MapPin, Users } from 'lucide-react';
import Cover from '../components/Cover.jsx';
import { StatusChip } from '../components/EventRow.jsx';
import { ErrorBox, Lightbox, Loader, usePageTitle } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useToast } from '../lib/toast.jsx';
import { useFetch } from '../lib/useFetch.js';
import { catLabel } from '../constants.js';
import { downloadIcs, fmtDate, fmtTime, googleCalendarUrl, mapsUrl, whenText } from '../lib/format.js';

function Register({ event, reload }) {
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const mine = event.myRegistration;
  const isIn = mine?.status === 'registered';

  const act = async (fn, ok) => {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (event.status === 'completed') return <p className="muted">This event has ended.</p>;
  if (!event.registrationOpen) return <p className="muted">Registration is closed for this event.</p>;
  if (!user) return <Link to="/login" state={{ from: `/events/${event.slug}` }} className="btn btn-primary">Log in to register</Link>;
  if (isIn)
    return (
      <div className="stack-sm">
        <p className="ok-note">You are registered for this event.</p>
        <button className="btn btn-ghost" disabled={busy} onClick={() => act(() => api.del(`/registrations/event/${event._id}`), 'Registration cancelled')}>Cancel registration</button>
      </div>
    );
  const full = event.capacity > 0 && event.registeredCount >= event.capacity;
  return (
    <button className="btn btn-primary" disabled={busy || full} onClick={() => act(() => api.post(`/registrations/event/${event._id}`), 'You are registered')}>
      {full ? 'Event is full' : 'Register for this event'}
    </button>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { data: e, loading, error, reload } = useFetch(`/events/${id}`);
  const [lb, setLb] = useState(null);
  usePageTitle(e?.title);

  if (loading) return <div className="container pad"><Loader /></div>;
  if (error) return <div className="container pad"><ErrorBox error={error} /></div>;

  return (
    <article className="event-page">
      <div className="event-hero">
        <Cover src={e.cover?.url} category={e.category} alt={e.title} className="event-hero-img" />
        <div className="event-hero-shade" />
        <div className="container event-hero-text">
          <div className="event-tags">
            <StatusChip status={e.status} />
            <span className="chip chip-light">{catLabel(e.category)}</span>
          </div>
          <h1>{e.title}</h1>
          {e.summary && <p>{e.summary}</p>}
        </div>
      </div>

      <div className="container event-layout">
        <div className="event-main">
          {e.description && (
            <section>
              <h2>About this event</h2>
              {e.description.split(/\n{2,}/).map((p, i) => <p key={i} className="prose">{p}</p>)}
            </section>
          )}

          {e.highlights?.length > 0 && (
            <section>
              <h2>Results</h2>
              <dl className="highlights">
                {e.highlights.map((h, i) => (
                  <div key={i}><dd>{h.value}</dd><dt>{h.label}</dt></div>
                ))}
              </dl>
            </section>
          )}

          {e.dailyUpdates?.length > 0 && (
            <section>
              <h2>{e.status === 'completed' ? 'Updates from the day' : 'Live updates'}</h2>
              <ol className="timeline">
                {e.dailyUpdates.map((u) => (
                  <li key={u._id}>
                    <time>{fmtDate(u.at, { day: 'numeric', month: 'short' })}, {fmtTime(u.at)}</time>
                    <p>{u.text}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {e.report && (
            <section>
              <h2>Event report</h2>
              {e.report.split(/\n{2,}/).map((p, i) => <p key={i} className="prose">{p}</p>)}
            </section>
          )}

          {e.photos?.length > 0 && (
            <section>
              <h2>Photos</h2>
              <div className="photo-grid">
                {e.photos.map((p, i) => (
                  <button key={p._id || i} onClick={() => setLb(i)} aria-label={`Open photo ${i + 1}`}>
                    <img src={p.url} alt={p.caption || e.title} loading="lazy" />
                  </button>
                ))}
              </div>
              <Lightbox photos={e.photos} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
            </section>
          )}
        </div>

        <aside className="event-side">
          <div className="side-card">
            <ul className="facts">
              <li><Clock size={18} /><span>{whenText(e)}</span></li>
              {e.venue?.name && (
                <li>
                  <MapPin size={18} />
                  <span>
                    {e.venue.name}
                    {e.venue.address && <><br />{e.venue.address}</>}
                    <br /><a href={mapsUrl(e.venue)} target="_blank" rel="noreferrer" className="text-link">Open in Maps <ExternalLink size={13} /></a>
                  </span>
                </li>
              )}
              {e.capacity > 0 && <li><Users size={18} /><span>{e.registeredCount} of {e.capacity} places taken</span></li>}
              {e.capacity === 0 && e.registeredCount > 0 && <li><Users size={18} /><span>{e.registeredCount} volunteers registered</span></li>}
            </ul>
            <Register event={e} reload={reload} />
            {e.status !== 'completed' && (
              <div className="cal-links">
                <CalendarPlus size={16} />
                <a href={googleCalendarUrl(e)} target="_blank" rel="noreferrer">Google Calendar</a>
                <button onClick={() => downloadIcs(e)}>Download .ics</button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
