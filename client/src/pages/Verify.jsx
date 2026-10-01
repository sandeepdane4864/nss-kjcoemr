import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { PageHead, usePageTitle, Loader } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { fmtDate } from '../lib/format.js';

function Result({ code }) {
  const { data, loading, error } = useFetch(`/certificates/verify/${encodeURIComponent(code)}`);
  if (loading) return <Loader />;
  if (error) return <p className="alert alert-err">{error.message}</p>;
  return (
    <div className="verify-ok">
      <BadgeCheck size={36} />
      <div>
        <h2>This certificate is genuine</h2>
        <p><b>{data.user?.name}</b>{data.user?.department ? `, ${data.user.department}` : ''}</p>
        <p>{data.title}{data.hours ? `, ${data.hours} hours` : ''}</p>
        <p className="muted small">Issued {fmtDate(data.issuedAt)}. Code {data.code}</p>
        <Link to={`/certificate/${data.code}`} className="text-link">View certificate</Link>
      </div>
    </div>
  );
}

export default function Verify() {
  usePageTitle('Verify certificate');
  const { code } = useParams();
  const nav = useNavigate();
  const [v, setV] = useState(code || '');
  return (
    <>
      <PageHead title="Verify a certificate">Enter the code printed on an NSS certificate to check it.</PageHead>
      <section className="section-tight">
        <div className="container narrow">
          <form className="inline-form" onSubmit={(e) => { e.preventDefault(); v.trim() && nav(`/verify/${v.trim().toUpperCase()}`); }}>
            <input className="input" value={v} onChange={(e) => setV(e.target.value)} placeholder="NSS-1A2B3C4D" aria-label="Certificate code" />
            <button className="btn btn-primary">Verify</button>
          </form>
          {code && <Result code={code} />}
        </div>
      </section>
    </>
  );
}
