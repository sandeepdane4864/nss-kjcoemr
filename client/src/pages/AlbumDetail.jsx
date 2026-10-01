import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorBox, Lightbox, Loader, PageHead, usePageTitle } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { fmtDate } from '../lib/format.js';

export default function AlbumDetail() {
  const { id } = useParams();
  const { data: a, loading, error } = useFetch(`/albums/${id}`);
  const [lb, setLb] = useState(null);
  usePageTitle(a?.title);
  if (loading) return <div className="container pad"><Loader /></div>;
  if (error) return <div className="container pad"><ErrorBox error={error} /></div>;
  return (
    <>
      <PageHead title={a.title}>
        {a.description}
        {a.event && <> <Link className="text-link" to={`/events/${a.event.slug}`}>About the event</Link></>}
        {a.date && <span className="muted"> Taken on {fmtDate(a.date)}</span>}
      </PageHead>
      <section className="section-tight">
        <div className="container">
          {a.photos.length === 0 ? <p className="muted">This album has no photos yet.</p> : (
            <div className="masonry">
              {a.photos.map((p, i) => (
                <button key={p._id || i} onClick={() => setLb(i)} aria-label={`Open photo ${i + 1}`}>
                  <img src={p.url} alt={p.caption || a.title} loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <Lightbox photos={a.photos} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
        </div>
      </section>
    </>
  );
}
