import { useRef, useState } from 'react';
import { Linkedin } from 'lucide-react';
import Avatar from '../components/Avatar.jsx';
import { Empty, ErrorBox, Loader, PageHead, usePageTitle } from '../components/ui.jsx';
import { useBatchReveal } from '../components/useBatchReveal.js';
import { useFetch, qs } from '../lib/useFetch.js';
import { DEPARTMENTS } from '../constants.js';

export default function Alumni() {
  usePageTitle('Alumni');
  const [department, setDept] = useState('');
  const { data, loading, error } = useFetch(`/alumni${qs({ department })}`);
  const scope = useRef(null);
  const groups = data || [];
  useBatchReveal(scope, [groups.length, department]);

  return (
    <>
      <PageHead title="Alumni">Past volunteers, grouped by the year they graduated. Many still show up for our camps.</PageHead>
      <section className="section-tight" ref={scope}>
        <div className="container">
          <div className="filters">
            <select className="input" value={department} onChange={(e) => setDept(e.target.value)} aria-label="Department">
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            {groups.length > 0 && (
              <nav className="year-jump" aria-label="Jump to batch">
                {groups.map((g) => <a key={g.year} href={`#batch-${g.year}`}>{g.year}</a>)}
              </nav>
            )}
          </div>
          {loading ? <Loader /> : error ? <ErrorBox error={error} /> : groups.length === 0 ? (
            <Empty title="No alumni listed">Alumni profiles will show up here once added by the NSS office.</Empty>
          ) : groups.map((g) => (
            <div key={g.year} id={`batch-${g.year}`} className="batch">
              <h2>Batch of {g.year}</h2>
              <div className="alumni-grid">
                {g.members.map((m) => (
                  <article key={m._id} className="alumnus" data-reveal>
                    <Avatar name={m.name} src={m.photo?.url} size={64} />
                    <div>
                      <h3>{m.name}</h3>
                      <p className="role">{[m.designation, m.company].filter(Boolean).join(' at ')}</p>
                      <p className="muted small">{[m.department, m.city].filter(Boolean).join(', ')}</p>
                      {m.story && <p className="small story">{m.story}</p>}
                      {m.linkedin && <a href={m.linkedin} className="text-link small" target="_blank" rel="noreferrer"><Linkedin size={14} /> LinkedIn</a>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
