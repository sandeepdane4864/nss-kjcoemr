
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Pin } from 'lucide-react';
import Wheel from '../components/Wheel.jsx';
import EventRow from '../components/EventRow.jsx';
import CountUp from '../components/CountUp.jsx';
import { SectionTitle, usePageTitle } from '../components/ui.jsx';
import { useBatchReveal } from '../components/useBatchReveal.js';
import {
  gsap,
  ScrollTrigger,
  useGSAP,
} from '../lib/gsap.js';
import { useFetch } from '../lib/useFetch.js';
import { useSite } from '../lib/site.jsx';
import { useAuth } from '../lib/auth.jsx';
import { fmtDate, relativeDays, whenText } from '../lib/format.js';
import { CATEGORIES, catLabel } from '../constants.js';

const FOCUS = [
  ['blood-donation', 'Camps with partner blood banks, open to the whole campus.'],
  ['plantation', 'Saplings on the hill, in villages, and along the roads we walk.'],
  ['cleanliness', 'Clean-up drives and sanitation awareness with local communities.'],
  ['health', 'Health check-ups and awareness sessions run with doctors.'],
  ['education', 'Teaching, digital literacy and career guidance for school students.'],
  ['camp', 'Seven-day special camps in adopted villages.'],
];

function Hero({ next }) {
  const root = useRef(null);
  const { settings } = useSite();
  const { user } = useAuth();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power4.out' },
        });

        tl.from('.hero-line > span', {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.12,
        })
          .from(
            '.hero-wheel',
            {
              scale: 0.7,
              rotation: -120,
              opacity: 0,
              duration: 1.8,
              ease: 'power3.out',
            },
            0
          )
          .from(
            '.hero-lead, .hero-cta',
            {
              opacity: 0,
              y: 16,
              duration: 0.8,
              stagger: 0.1,
            },
            0.7
          )
          .from(
            '.hero-next',
            {
              opacity: 0,
              y: 30,
              duration: 0.9,
            },
            0.9
          );

        gsap.to('.hero-wheel-spin', {
          rotation: 200,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section className="hero" ref={root}>
      <div className="hero-wheel" aria-hidden="true">
        <Wheel className="hero-wheel-spin" ring="var(--navy)" />
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <h1>
            <span className="hero-line">
              <span>Not me,</span>
            </span>
            <span className="hero-line">
              <span>but you.</span>
            </span>
          </h1>

          <p className="hero-lead">
            {settings.about
              ? settings.about.slice(0, 190).replace(/\s+\S*$/, '') + '.'
              : 'Students of KJ College of Engineering and Management Research serving the communities around Pune.'}
          </p>

          <div className="hero-cta">
            {user ? (
              <Link to="/me" className="btn btn-primary">
                Open my profile
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary">
                Join as a volunteer
              </Link>
            )}

            <Link to="/events" className="btn btn-ghost">
              See what is coming up
            </Link>
          </div>
        </div>

        {next && (
          <Link
            to={`/events/${next.slug || next._id}`}
            className="hero-next"
          >
            <span className="hero-next-when">
              {relativeDays(next.startDate)}
            </span>
            <strong>{next.title}</strong>
            <span>{whenText(next)}</span>

            {next.venue?.name && (
              <span>{next.venue.name}</span>
            )}

            <span className="hero-next-go">
              Register <ArrowUpRight size={16} />
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

function Testimonials({ items }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (items.length < 2) return undefined;

    const t = setInterval(() => {
      setI((n) => (n + 1) % items.length);
    }, 7000);

    return () => clearInterval(t);
  }, [items.length]);

  if (!items.length) return null;

  const t = items[i];

  return (
    <section className="section quote-section">
      <div className="container">
        <blockquote key={t._id} className="quote">
          <p>{t.quote}</p>
          <footer>
            {t.name}
            {t.role ? `, ${t.role}` : ''}
          </footer>
        </blockquote>

        {items.length > 1 && (
          <div
            className="quote-dots"
            role="tablist"
            aria-label="Testimonials"
          >
            {items.map((x, n) => (
              <button
                key={x._id}
                type="button"
                className={n === i ? 'on' : ''}
                onClick={() => setI(n)}
                aria-label={`Testimonial ${n + 1}`}
                aria-selected={n === i}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PhotoStrip({ photos }) {
  if (!photos.length) return null;

  return (
    <section className="section strip">
      <div className="container">
        <SectionTitle
          title="From the field"
          to="/gallery"
          linkText="Open the gallery"
        />
      </div>

      <div className="strip-viewport">
        <div className="strip-track">
          {[0, 1].map((group) => (
            <div
              className="strip-group"
              key={group}
              aria-hidden={group === 1 ? 'true' : undefined}
            >
              {photos.map((p, i) => (
                <Link
                  to={`/gallery/${p.album.slug || p.album._id}`}
                  key={`${group}-${p._id || `${p.album._id}-${i}`}`}
                  className={`strip-item s${i % 3}`}
                  tabIndex={group === 1 ? -1 : undefined}
                >
                  <img
                    src={p.url}
                    alt={group === 1 ? '' : p.caption || p.album.title}
                    loading="lazy"
                    draggable="false"
                  />

                  <span>{p.album.title}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  usePageTitle('');

  const scope = useRef(null);

  const upcoming = useFetch('/events?status=upcoming&limit=4');
  const stats = useFetch('/stats');

  // Request more albums. The backend must allow this limit
  // and return every requested album for the complete gallery.
  const albums = useFetch('/albums?limit=100');

  const notices = useFetch('/notices?limit=5');
  const quotes = useFetch('/testimonials?limit=6');

  const ev = upcoming.data?.items || [];
  const s = stats.data || {};

  // Include every photo in each album returned by the API.
  const photos = (albums.data?.items || []).flatMap((album) =>
    (album.photos || [])
      .filter((photo) => photo?.url)
      .map((photo) => ({
        ...photo,
        album,
      }))
  );

  const pinned = (notices.data?.items || [])
    .slice()
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  useBatchReveal(scope, [
    ev.length,
    photos.length,
    pinned.length,
  ]);

  // Refresh scroll calculations after the page content changes.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [ev.length, photos.length, pinned.length]);

  const counters = [
    [s.volunteers, 'Active volunteers'],
    [s.eventsDone, 'Events completed'],
    [Math.round(s.totalHours || 0), 'Service hours logged'],
    [
      s.treesPlanted ?? s.alumni,
      s.treesPlanted != null
        ? 'Trees planted'
        : 'Alumni in our network',
    ],
  ];

  return (
    <div ref={scope}>
      <Hero next={ev[0]} />

      {/* Statistics */}
      <section className="stats">
        <div className="container stats-grid">
          {counters.map(([n, label]) => (
            <div key={label}>
              <b>
                <CountUp to={n || 0} />
              </b>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="section">
        <div className="container">
          <SectionTitle
            title="Coming up"
            to="/events?status=upcoming"
            linkText="All upcoming events"
          />

          <div className="event-list">
            {ev.length ? (
              ev.map((event) => (
                <EventRow key={event._id} event={event} />
              ))
            ) : (
              <p className="muted">
                No events are scheduled right now. New ones are
                added here as soon as they are planned.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* NSS focus areas */}
      <section className="section section-tint">
        <div className="container split">
          <div className="split-head">
            <h2>Where we show up</h2>
            <p>
              Every activity is student-led and logged against
              the 120 service hours an NSS volunteer completes.
            </p>
          </div>

          <ul className="focus-list">
            {FOCUS.map(([key, text]) => (
              <li key={key} data-reveal>
                <Link to={`/events?category=${key}`}>
                  <span
                    className="focus-dot"
                    style={{
                      background: CATEGORIES[key].color,
                    }}
                  />

                  <div>
                    <h3>{catLabel(key)}</h3>
                    <p>{text}</p>
                  </div>

                  <ArrowUpRight size={20} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Automatically moving gallery */}
      <PhotoStrip photos={photos} />

      {/* Notice board */}
      {pinned.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionTitle
              title="Notice board"
              to="/notices"
              linkText="All notices"
            />

            <ul className="notice-list">
              {pinned.map((notice) => (
                <li key={notice._id} data-reveal>
                  {notice.pinned && (
                    <Pin
                      size={16}
                      className="pin"
                      aria-label="Pinned"
                    />
                  )}

                  <div>
                    <h3>{notice.title}</h3>

                    {notice.body && (
                      <p>
                        {notice.body.slice(0, 140)}
                        {notice.body.length > 140 ? '…' : ''}
                      </p>
                    )}
                  </div>

                  <time>{fmtDate(notice.createdAt)}</time>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <Testimonials items={quotes.data?.items || []} />

      {/* Call to action */}
      <section className="cta-band">
        <Wheel
          className="cta-wheel"
          ring="#fff"
          accent="#fff"
          paper="transparent"
        />

        <div className="container">
          <h2>
            Give your 120 hours to something that matters.
          </h2>

          <p>
            Register once, get approved by your coordinator,
            and sign up for events from your own dashboard.
          </p>

          <Link to="/register" className="btn btn-light">
            Create volunteer account
          </Link>
        </div>
      </section>
    </div>
  );
}