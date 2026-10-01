import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import Cover from './Cover.jsx';
import { catLabel } from '../constants.js';
import { dayNum, fmtTime, monthShort } from '../lib/format.js';

export const StatusChip = ({ status }) => (
  <span className={`chip chip-${status}`}>{status === 'upcoming' ? 'Upcoming' : status === 'ongoing' ? 'Happening now' : 'Completed'}</span>
);

export default function EventRow({ event: e }) {
  return (
    <Link to={`/events/${e.slug || e._id}`} className="event-row" data-reveal>
      <div className="event-date" aria-hidden="true">
        <b>{dayNum(e.startDate)}</b>
        <span>{monthShort(e.startDate)}</span>
      </div>
      <div className="event-info">
        <div className="event-tags">
          <StatusChip status={e.status} />
          <span className="chip chip-plain">{catLabel(e.category)}</span>
        </div>
        <h3>{e.title}</h3>
        {e.summary && <p>{e.summary}</p>}
        <div className="event-meta">
          <span><Clock size={15} /> {fmtTime(e.startDate)} to {fmtTime(e.endDate)}</span>
          {e.venue?.name && <span><MapPin size={15} /> {e.venue.name}</span>}
        </div>
      </div>
      <Cover src={e.cover?.url} category={e.category} alt={e.title} className="event-thumb" />
    </Link>
  );
}
