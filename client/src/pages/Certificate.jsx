import { useParams } from 'react-router-dom';
import Wheel from '../components/Wheel.jsx';
import { ErrorBox, Loader, usePageTitle } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { useSite } from '../lib/site.jsx';
import { fmtDate } from '../lib/format.js';

export default function Certificate() {
  const { code } = useParams();
  const { data: c, loading, error } = useFetch(`/certificates/verify/${code}`);
  const { settings: s } = useSite();
  usePageTitle('Certificate');
  if (loading) return <div className="container pad"><Loader /></div>;
  if (error) return <div className="container pad"><ErrorBox error={error} /></div>;
  return (
    <section className="section-tight">
      <div className="container narrow">
        <div className="cert" id="certificate">
          <Wheel className="cert-wheel" ring="var(--navy)" />
          <p className="cert-org">{s.unitName}, {s.collegeName}</p>
          <h1>Certificate of {c.type === 'completion' ? 'completion' : c.type === 'appreciation' ? 'appreciation' : 'participation'}</h1>
          <p>This is to certify that</p>
          <p className="cert-name">{c.user?.name}</p>
          <p>{c.title}{c.hours ? `, contributing ${c.hours} hours of service` : ''}.</p>
          <div className="cert-foot">
            <span>Issued {fmtDate(c.issuedAt)}</span>
            <span>Code {c.code}</span>
          </div>
          <p className="cert-motto">{s.motto}</p>
        </div>
        <div className="cert-actions no-print">
          <button className="btn btn-primary" onClick={() => window.print()}>Print or save as PDF</button>
        </div>
      </div>
    </section>
  );
}
