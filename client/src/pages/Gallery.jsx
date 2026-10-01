import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Empty, ErrorBox, Loader, PageHead, usePageTitle } from '../components/ui.jsx';
import { useBatchReveal } from '../components/useBatchReveal.js';
import Cover from '../components/Cover.jsx';
import { useFetch } from '../lib/useFetch.js';
import { fmtDate } from '../lib/format.js';

export default function Gallery() {
  usePageTitle('Gallery');
  const { data, loading, error } = useFetch('/albums?limit=60');
  const scope = useRef(null);
  const items = data?.items || [];
  useBatchReveal(scope, [items.length]);
  return (
    <>
      <PageHead title="Gallery">Photos from every drive, camp and rally, organised by event.</PageHead>
      <section className="section-tight" ref={scope}>
        <div className="container">
          {loading ? <Loader /> : error ? <ErrorBox error={error} /> : items.length === 0 ? (
            <Empty title="No albums yet">Photos appear here once the first event album is published.</Empty>
          ) : (
            <div className="album-grid">
              {items.map((a) => (
                <Link key={a._id} to={`/gallery/${a.slug || a._id}`} className="album" data-reveal>
                  <Cover src={a.cover?.url || a.photos?.[0]?.url} alt={a.title} className="album-cover" />
                  <div>
                    <h3>{a.title}</h3>
                    <p>{a.photos?.length || 0} photos{a.date ? `, ${fmtDate(a.date)}` : ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
