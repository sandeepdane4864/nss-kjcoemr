import { useParams } from 'react-router-dom';
import { Github, Instagram, Linkedin, Award } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import { ErrorBox, Loader, usePageTitle } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { useSite } from '../lib/site.jsx';
import { fmtDate } from '../lib/format.js';

export default function VolunteerProfile() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/users/public/${id}`);
  const { settings } = useSite();
  const u = data?.user;
  usePageTitle(u?.name);
  if (loading) return <div className="container pad"><Loader /></div>;
  if (error) return <div className="container pad"><ErrorBox error={error} /></div>;
  const target = settings.targetHours || 120;
  const pct = Math.min(100, Math.round((u.hoursTotal / target) * 100));
  const so = u.socials || {};

  return (
    <section className="section-tight">
      <div className="container profile-layout">
        <div className="profile-card">
          <Avatar name={u.name} src={u.photo?.url} size={140} square />
          <h1>{u.name}</h1>
          <p className="muted">{[u.year, u.department].filter(Boolean).join(', ')}</p>
          {(so.linkedin || so.instagram || so.github) && (
            <div className="socials dark profile-socials">
              {so.linkedin && (
                <a
                  href={so.linkedin}
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin size={20} />
                </a>
              )}

              {so.instagram && (
                <a
                  href={so.instagram}
                  aria-label="Instagram"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram size={20} />
                </a>
              )}

              {so.github && (
                <a
                  href={so.github}
                  aria-label="GitHub"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github size={20} />
                </a>
              )}
            </div>
          )}
          <p className="muted small">Volunteer since {u.joinedYear || new Date(u.createdAt).getFullYear()}</p>
        </div>
        <div className="profile-main">
          {u.bio && <p className="prose lead">{u.bio}</p>}
          <div className="progress-block">
            <div className="progress-head"><b>{u.hoursTotal} hours</b><span>of the {target} hour NSS requirement</span></div>
            <div className="bar"><i style={{ width: `${pct}%` }} /></div>
          </div>
          {u.skills?.length > 0 && (
            <>
              <h2 className="profilevolskills">Skills</h2>
              <div className="tags">{u.skills.map((s) => <span key={s} className="chip chip-plain">{s}</span>)}</div>
            </>
          )}
          {u.badges?.length > 0 && (
            <>
              <h2>Badges</h2>
              <ul className="badges">
                {u.badges.map((b) => (
                  <li key={b.key}><Award size={20} /><div><b>{b.label}</b><span>{fmtDate(b.awardedAt)}</span></div></li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
