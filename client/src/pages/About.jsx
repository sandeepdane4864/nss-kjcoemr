
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import Wheel from '../components/Wheel.jsx';
import Avatar from '../components/Avatar.jsx';
import { usePageTitle } from '../components/ui.jsx';
import { useFetch } from '../lib/useFetch.js';
import { useSite } from '../lib/site.jsx';
import nssGroup from '../images/nssgrp.jpg';

function Person({ person, featured = false }) {
  return (
    <article className={`about-person ${featured ? 'featured' : ''}`}>
      <Avatar
        name={person.name}
        src={person.photo?.url}
        size={featured ? 104 : 76}
        square
      />

      <div className="about-person-info">
        <h3>{person.name}</h3>

        {person.designation && (
          <p className="about-person-role">{person.designation}</p>
        )}

        {person.bio && (
          <p className="about-person-bio">{person.bio}</p>
        )}

        {(person.email || person.phone) && (
          <div className="about-person-contact">
            {person.email && (
              <a
                href={`mailto:${person.email}`}
                aria-label={`Email ${person.name}`}
              >
                <Mail size={14} />
                <span>{person.email}</span>
              </a>
            )}

            {person.phone && (
              <a
                href={`tel:${person.phone}`}
                aria-label={`Call ${person.name}`}
              >
                <Phone size={14} />
                <span>{person.phone}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <header className="about-section-heading">
      {eyebrow && (
        <span className="about-eyebrow">{eyebrow}</span>
      )}

      <h2>{title}</h2>

      {description && <p>{description}</p>}
    </header>
  );
}

export default function About() {
  usePageTitle('About');

  const { settings: s } = useSite();
  const team = useFetch('/coordinators');
  const data = team.data;

  const leaders = [
    data?.principal,
    ...(data?.programOfficers || []),
  ].filter(Boolean);

  const messages = leaders.filter((person) => person.message);

  return (
    <>
      {/* ABOUT INTRODUCTION */}
      <section className="about-hero">
        <div className="container">
          <header className="about-heading">
            <span className="about-eyebrow">
              NATIONAL SERVICE SCHEME
            </span>

            <h1>About the NSS Unit</h1>

            <p>{s.collegeName}</p>
          </header>

          {/* NSS TEAM GROUP PHOTO */}
          <div className="about-team-photo">
            <img
              src={nssGroup}
              alt="NSS team of KJ College of Engineering and Management Research"
              loading="lazy"
            />

            <div className="about-team-photo-caption">
              <span>OUR NSS FAMILY</span>
              <h2>Together in Service, United in Purpose</h2>
              <p>
                Working together to build a responsible and
                service-minded community.
              </p>
            </div>
          </div>

          {/* ABOUT DETAILS AND NSS BADGE */}
          <div className="about-grid">
            <div className="about-intro">
              <p className="prose lead">{s.about}</p>

              <dl className="facts-row">
                {s.foundedYear && (
                  <div className="about-fact">
                    <dt>Unit founded</dt>
                    <dd>{s.foundedYear}</dd>
                  </div>
                )}

                <div className="about-fact">
                  <dt>Motto</dt>
                  <dd>{s.motto}</dd>
                </div>

                <div className="about-fact">
                  <dt>Service requirement</dt>
                  <dd>{s.targetHours || 120} hours</dd>
                </div>
              </dl>
            </div>

            <aside className="emblem-card">
              <div className="about-emblem-wrap">
                <Wheel
                  className="emblem"
                  ring="var(--navy)"
                />
              </div>

              <h3>The NSS Badge</h3>

              <p>
                The NSS badge features an eight-spoked wheel inspired
                by the Konark Sun Temple. Its spokes represent the
                twenty-four hours of the day, symbolising continuous
                service. The red and blue represent the energy and
                spirit of youth, along with the vast sky and ocean
                of service.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* OBJECTIVES */}
      {s.objectives?.length > 0 && (
        <section className="section section-tint about-objectives">
          <div className="container split">
            <div className="split-head">
              <span className="about-eyebrow">OUR PURPOSE</span>

              <h2>What NSS Sets Out to Do</h2>

              <p>
                Learn through community service, teamwork, and
                meaningful participation in society.
              </p>
            </div>

            <ul className="plain-list about-objective-list">
              {s.objectives.map((objective, index) => (
                <li key={objective}>
                  <span className="about-objective-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* VISION AND MISSION */}
      {(s.vision || s.mission) && (
        <section className="section about-values">
          <div className="container">
            <SectionHeading
              eyebrow="OUR DIRECTION"
              title="Vision & Mission"
            />

            <div className="about-values-grid">
              {s.vision && (
                <article className="about-value-card">
                  <span className="about-value-label">
                    01 / VISION
                  </span>

                  <h3>Our Vision</h3>

                  <p>{s.vision}</p>
                </article>
              )}

              {s.mission && (
                <article className="about-value-card">
                  <span className="about-value-label">
                    02 / MISSION
                  </span>

                  <h3>Our Mission</h3>

                  <p>{s.mission}</p>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      {/* INTEGRATED TEAM */}
      <section className="section section-tint about-team">
        <div className="container">
          <SectionHeading
            eyebrow="MEET OUR TEAM"
            title="The People Behind NSS"
            description="Meet the faculty, department coordinators, and student leaders who support our NSS activities."
          />

          {team.loading && (
            <div className="about-team-status">
              Loading team information...
            </div>
          )}

          {team.error && (
            <div className="about-team-status">
              Team information is temporarily unavailable.
              Please try again later.
            </div>
          )}

          {data && (
            <>
              {/* FACULTY LEADERSHIP */}
              {leaders.length > 0 && (
                <div className="about-team-group">
                  <h2 className="about-group-title">
                    Faculty Leadership
                  </h2>

                  <div className="about-leader-grid">
                    {leaders.map((person) => (
                      <Person
                        key={person._id || person.name}
                        person={person}
                        featured
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* DEPARTMENT COORDINATORS */}
              {data.departmentCoordinators?.length > 0 && (
                <div className="about-team-group">
                  <h2 className="about-group-title">
                    Department Coordinators
                  </h2>

                  <div className="about-departments">
                    {data.departmentCoordinators.map((group) => (
                      <section
                        key={group.department}
                        className="about-department"
                      >
                        <h3 className="about-department-heading">
                          {group.department}
                        </h3>

                        <div className="about-department-grid">
                          {group.members.map((person) => (
                            <Person
                              key={person._id}
                              person={person}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              )}

              {/* STUDENT LEADS */}
              {data.studentLeads?.length > 0 && (
                <div className="about-team-group">
                  <h2 className="about-group-title">
                    Student Leads
                  </h2>

                  <div className="about-student-grid">
                    {data.studentLeads.map((person) => (
                      <Person
                        key={person._id}
                        person={person}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!leaders.length &&
                !data.departmentCoordinators?.length &&
                !data.studentLeads?.length && (
                  <div className="about-team-status">
                    Team profiles will appear here when available.
                  </div>
                )}
            </>
          )}
        </div>
      </section>

      {/* LEADERSHIP MESSAGES */}
      {messages.length > 0 && (
        <section className="section about-messages-section">
          <div className="container">
            <SectionHeading
              eyebrow="WORDS THAT INSPIRE"
              title="Messages from Our Leadership"
              description="Messages from the people guiding our NSS activities and community initiatives."
            />

            <div className="about-messages">
              {messages.map((person) => (
                <figure
                  key={person._id || person.name}
                  className="about-message"
                >
                  <blockquote>{person.message}</blockquote>

                  <figcaption>
                    <Avatar
                      name={person.name}
                      src={person.photo?.url}
                      size={48}
                    />

                    <div className="about-message-author">
                      <b>{person.name}</b>
                      <span>{person.designation}</span>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* JOIN NSS */}
      <section className="cta-band about-cta">
        <Wheel
          className="cta-wheel"
          ring="#fff"
          accent="#fff"
          paper="transparent"
        />

        <div className="container about-cta-content">
          <span className="about-eyebrow">
            MAKE A DIFFERENCE
          </span>

          <h2>Be the Change You Want to See</h2>

          <p>
            Put your skills into action, support your community,
            and make your college journey more meaningful through NSS.
          </p>

          <Link to="/register" className="btn btn-light">
            Join NSS <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}