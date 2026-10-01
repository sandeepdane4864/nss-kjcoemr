import { useState } from 'react';
import { Download, Pin } from 'lucide-react';
import { Empty, ErrorBox, Loader, PageHead, usePageTitle } from '../components/ui.jsx';
import { useFetch, qs } from '../lib/useFetch.js';
import { fmtDate } from '../lib/format.js';

const TABS = [['', 'All'], ['notice', 'Notices'], ['news', 'News'], ['circular', 'Circulars'], ['download', 'Downloads']];

export default function Notices() {
  usePageTitle('Notices');
  const [cat, setCat] = useState('');
  const { data, loading, error } = useFetch(`/notices${qs({ category: cat, limit: 50 })}`);
  const items = data?.items || [];
  return (
    <>
      <PageHead title="Notices and downloads">Announcements, circulars, forms and reports from the NSS office.</PageHead>
      <section className="section-tight">
        <div className="container narrow">
          <div className="seg" role="tablist" aria-label="Notice type">
            {TABS.map(([v, l]) => <button key={v} role="tab" aria-selected={cat === v} className={cat === v ? 'on' : ''} onClick={() => setCat(v)}>{l}</button>)}
          </div>
          {loading ? <Loader /> : error ? <ErrorBox error={error} /> : items.length === 0 ? <Empty title="Nothing here yet" /> : (
            <ul className="notice-list wide">
              {items.map((n) => (
                <li key={n._id}>
                  {n.pinned && <Pin size={16} className="pin" aria-label="Pinned" />}
                  <div>
                    <h3>{n.title}</h3>
                    {n.body && <p>{n.body}</p>}
                    {n.attachment?.url && <a href={n.attachment.url} className="text-link" target="_blank" rel="noreferrer"><Download size={14} /> {n.attachment.name || 'Download file'}</a>}
                  </div>
                  <time>{fmtDate(n.createdAt)}</time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
