import { useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import EventRow from '../components/EventRow.jsx';
import { Empty, ErrorBox, Loader, PageHead, usePageTitle } from '../components/ui.jsx';
import { useBatchReveal } from '../components/useBatchReveal.js';
import { useFetch, qs } from '../lib/useFetch.js';
import { CATEGORIES } from '../constants.js';

export default function Events() {
  usePageTitle('Events');
  const [sp, setSp] = useSearchParams();
  const status = sp.get('status') || 'upcoming';
  const category = sp.get('category') || '';
  const year = sp.get('year') || '';
  const q = sp.get('q') || '';
  const page = Number(sp.get('page') || 1);
  const scope = useRef(null);

  const set = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v);
    else n.delete(k);
    if (k !== 'page') n.delete('page');
    setSp(n, { replace: true });
  };

  const { data, loading, error } = useFetch(`/events${qs({ status: status === 'all' ? '' : status, category, year, q, page, limit: 10 })}`);
  const items = data?.items || [];
  useBatchReveal(scope, [items.map((e) => e._id).join()]);
  const thisYear = new Date().getFullYear();

  return (
    <>
      <PageHead title="Events">Everything we have planned and everything we have already done, with photos and reports.</PageHead>
      <section className="section-tight" ref={scope}>
        <div className="container">
          <div className="filters">
            <div className="seg" role="tablist" aria-label="Event status">
              {[['upcoming', 'Upcoming'], ['completed', 'Completed'], ['all', 'All']].map(([v, l]) => (
                <button key={v} role="tab" aria-selected={status === v} className={status === v ? 'on' : ''} onClick={() => set('status', v)}>{l}</button>
              ))}
            </div>
            <select className="input" value={category} onChange={(e) => set('category', e.target.value)} aria-label="Category">
              <option value="">All categories</option>
              {Object.entries(CATEGORIES).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
            </select>
            <select className="input" value={year} onChange={(e) => set('year', e.target.value)} aria-label="Year">
              <option value="">Any year</option>
              {Array.from({ length: 8 }).map((_, i) => <option key={i} value={thisYear + 1 - i}>{thisYear + 1 - i}</option>)}
            </select>
            <input className="input" type="search" placeholder="Search events" defaultValue={q} onKeyDown={(e) => e.key === 'Enter' && set('q', e.target.value)} onBlur={(e) => e.target.value !== q && set('q', e.target.value)} aria-label="Search events" />
          </div>

          {loading ? <Loader /> : error ? <ErrorBox error={error} /> : items.length === 0 ? (
            <Empty title="No events match these filters">Try another category or switch to All.</Empty>
          ) : (
            <div className="event-list">{items.map((e) => <EventRow key={e._id} event={e} />)}</div>
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
