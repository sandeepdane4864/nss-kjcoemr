const opt = (o) => ({ timeZone: undefined, ...o });
export const fmtDate = (d, o = { day: 'numeric', month: 'short', year: 'numeric' }) => new Date(d).toLocaleDateString('en-IN', opt(o));
export const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s/g, ' ').toLowerCase();
export const weekday = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'long' });
export const monthShort = (d) => new Date(d).toLocaleDateString('en-IN', { month: 'short' });
export const dayNum = (d) => new Date(d).getDate();

export const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

export function whenText(e) {
  const s = new Date(e.startDate);
  const en = new Date(e.endDate);
  const date = s.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  if (sameDay(s, en)) return `${date}, ${fmtTime(s)} to ${fmtTime(en)}`;
  return `${fmtDate(s)} to ${fmtDate(en)}`;
}

export function daysUntil(d) {
  const ms = new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
}
export function relativeDays(d) {
  const n = daysUntil(d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n > 1) return `In ${n} days`;
  return `${fmtDate(d)}`;
}

export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'N';

export function googleCalendarUrl(e) {
  const z = (d) => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${z(e.startDate)}/${z(e.endDate)}`,
    details: e.summary || 'NSS event',
    location: [e.venue?.name, e.venue?.address].filter(Boolean).join(', '),
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function downloadIcs(e) {
  const z = (d) => new Date(d).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NSS KJCOEMR//EN', 'BEGIN:VEVENT', `UID:${e._id}@nss`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(e.startDate)}`, `DTEND:${z(e.endDate)}`, `SUMMARY:${e.title}`, `LOCATION:${[e.venue?.name, e.venue?.address].filter(Boolean).join(', ')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = `${e.slug || 'event'}.ics`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const mapsUrl = (v) => (v?.lat && v?.lng ? `https://www.google.com/maps?q=${v.lat},${v.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([v?.name, v?.address].filter(Boolean).join(', '))}`);
