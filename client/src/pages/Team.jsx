import { useRef } from 'react';
import Avatar from '../components/Avatar.jsx';
import { ErrorBox, Loader, PageHead, usePageTitle } from '../components/ui.jsx';
import { useBatchReveal } from '../components/useBatchReveal.js';
import { useFetch } from '../lib/useFetch.js';
import { Mail, Phone } from 'lucide-react';

const Person = ({ p, big }) => (
  <article className={`staff ${big ? 'staff-big' : ''}`} data-reveal>
    <Avatar name={p.name} src={p.photo?.url} size={big ? 132 : 88} square />
    <div>
      <h3>{p.name}</h3>
      {p.designation && <p className="role">{p.designation}</p>}
      {p.bio && <p className="muted small">{p.bio}</p>}
      <div className="staff-contact">
        {p.email && <a href={`mailto:${p.email}`}><Mail size={14} /> {p.email}</a>}
        {p.phone && <a href={`tel:${p.phone}`}><Phone size={14} /> {p.phone}</a>}
      </div>
    </div>
  </article>
);

export default function Team() {
  usePageTitle('Team');
  const { data, loading, error } = useFetch('/coordinators');
  const scope = useRef(null);
  useBatchReveal(scope, [Boolean(data)]);
  if (loading) return <div className="container pad"><Loader /></div>;
  if (error) return <div className="container pad"><ErrorBox error={error} /></div>;

  return (
    <>
      <PageHead title="The people behind NSS">Faculty who guide the unit, coordinators in every department, and the students who lead.</PageHead>
      <div ref={scope}>
        <section className="section-tight">
          <div className="container">
            <h2 className="group-title">Leadership</h2>
            <div className="staff-grid big">
              {data.principal && <Person p={data.principal} big />}
              {data.programOfficers.map((p) => <Person key={p._id} p={p} big />)}
            </div>
          </div>
        </section>

        {data.departmentCoordinators.length > 0 && (
          <section className="section section-tint">
            <div className="container">
              <h2 className="group-title">Department coordinators</h2>
              {data.departmentCoordinators.map((g) => (
                <div key={g.department} className="dept-block">
                  <h3>{g.department}</h3>
                  <div className="staff-grid">{g.members.map((p) => <Person key={p._id} p={p} />)}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.studentLeads.length > 0 && (
          <section className="section">
            <div className="container">
              <h2 className="group-title">Student leads</h2>
              <div className="staff-grid">{data.studentLeads.map((p) => <Person key={p._id} p={p} />)}</div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
