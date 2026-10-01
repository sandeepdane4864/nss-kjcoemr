import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { Empty, ErrorBox, Loader, PageHead, usePageTitle } from '../components/ui.jsx';
import { useBatchReveal } from '../components/useBatchReveal.js';
import { useFetch, qs } from '../lib/useFetch.js';
import { DEPARTMENTS, YEARS } from '../constants.js';

export default function Volunteers() {
  usePageTitle('Volunteers');
  const [sp, setSp] = useSearchParams();
  const department = sp.get('department') || '';
  const year = sp.get('year') || '';
  const q = sp.get('q') || '';
  const page = Number(sp.get('page') || 1);
  const scope = useRef(null);
  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v); else n.delete(k);
    if (k !== 'page') n.delete('page');
    setSp(n, { replace: true });
  };
  const { data, loading, error } = useFetch(`/users/public${qs({ department, year, q, page, limit: 24 })}`);
  const board = useFetch('/users/leaderboard?limit=3');
  const items = data?.items || [];
  useBatchReveal(scope, [items.map((i) => i._id).join()]);

  return (
    <>
      <PageHead title="Volunteers">The students who give their time. Each profile lists skills, hours and badges earned.</PageHead>
      <section className="section-tight" ref={scope}>
        <div className="container">
          {board.data?.length > 0 && (
            <div className="podium">
              <h2>Most hours this year</h2>
              <ol>
                {board.data.map((u, i) => (
                  <li key={u._id}>
                    <Link to={`/volunteers/${u._id}`}>
                      <Avatar name={u.name} src={u.photo?.url} size={48} />
                      <div><b>{u.name}</b><span>{u.department}</span></div>
                      <strong>{u.hoursTotal}<small> hrs</small></strong>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="filters">
            <input className="input grow" type="search" placeholder="Search by name" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} onBlur={(e) => e.target.value !== q && set('q', e.target.value)} aria-label="Search volunteers" />
            <select className="input" value={department} onChange={(e) => set('department', e.target.value)} aria-label="Department">
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select className="input" value={year} onChange={(e) => set('year', e.target.value)} aria-label="Year">
              <option value="">All years</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          {loading ? <Loader /> : error ? <ErrorBox error={error} /> : items.length === 0 ? (
            <Empty title="No volunteers found">Change the filters, or be the first to join.</Empty>
          ) : (
            <div className="people-grid">
              {items.map((u) => (
                <Link to={`/volunteers/${u._id}`} key={u._id} className="person" data-reveal>
                  <Avatar name={u.name} src={u.photo?.url} size={84} square />
                  <h3>{u.name}</h3>
                  <p>{[u.year, u.department].filter(Boolean).join(', ')}</p>
                  <span className="hours-pill">{u.hoursTotal} service hours</span>
                </Link>
              ))}
            </div>
          )}
          {data?.pages > 1 && (
            <div className="pager">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => set('page', String(page - 1))}>Previous</button>
              <span>Page {page} of {data.pages}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => set('page', String(page + 1))}>Next</button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
