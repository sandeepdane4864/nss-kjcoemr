import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, LogOut, Mail, MapPin, Menu, Phone, X, Youtube } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { useSite } from '../lib/site.jsx';
import { useToast } from '../lib/toast.jsx';
import Wheel from './Wheel.jsx';
import Avatar from './Avatar.jsx';

const NAV = [
  ['/about', 'About'],
  ['/events', 'Events'],
  ['/volunteers', 'Volunteers'],
  ['/gallery', 'Gallery'],
  ['/alumni', 'Alumni'],
  ['/notices', 'Notices'],
  ['/contact', 'Contact'],
];

function Navbar() {
  const { user, isStaff, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clear the session, then always land on the home page (never on a page that needs login).
  const handleLogout = async () => {
    if (leaving) return;
    setLeaving(true);
    setOpen(false);
    await logout();
    navigate('/', { replace: true });
    toast.success('You have been logged out');
    setLeaving(false);
  };

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="NSS KJCOEMR home">
          <Wheel className="brand-wheel" ring="var(--navy)" />
          <span>
            <b>NSS</b>
            <small>KJ College of Engineering</small>
          </span>
        </Link>

        <nav id="main-navigation" className={`nav-links ${open ? 'open' : ''}`} aria-label="Main navigation">
          {NAV.map(([path, label]) => (
            <NavLink key={path} to={path} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          ))}

          <div className="nav-auth-mobile">
            {user ? (
              <>
                <Link to="/me">My profile</Link>
                {isStaff && <Link to="/admin">Admin panel</Link>}
                <button type="button" className="mobile-logout" onClick={handleLogout} disabled={leaving}>
                  <LogOut size={18} /> {leaving ? 'Logging out' : 'Log out'}
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Log in</Link>
                <Link to="/register" className="mobile-primary">Join NSS</Link>
              </>
            )}
          </div>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {isStaff && <Link to="/admin" className="btn btn-ghost btn-sm">Admin</Link>}
              <Link to="/me" className="nav-user" aria-label="My profile">
                <Avatar name={user.name || user.email || 'User'} src={user.photo?.url} size={36} />
              </Link>
              <button type="button" className="btn btn-ghost btn-sm btn-logout" onClick={handleLogout} disabled={leaving}>
                <LogOut size={15} /> {leaving ? 'Logging out' : 'Log out'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-red btn-sm">Join NSS</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="nav-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="main-navigation"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  const { settings } = useSite();
  const s = settings || {};
  const contact = s.contact || {};
  const socials = s.socials || {};
  const social = (href, label, Icon) =>
    href && (
      <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
        <Icon size={20} />
      </a>
    );

  return (
    <footer className="footer">
      <Wheel className="footer-wheel" ring="#fff" accent="#fff" paper="transparent" />
      <div className="container footer-grid">
        <div className="footer-about">
          <p className="footer-motto">{s.motto || 'Not me, but you'}</p>
          <p>{s.unitName || 'NSS Unit'}, {s.collegeName || 'KJ College of Engineering and Management Research'}.</p>
          <div className="socials">
            {social(socials.instagram, 'Instagram', Instagram)}
            {social(socials.linkedin, 'LinkedIn', Linkedin)}
            {social(socials.youtube, 'YouTube', Youtube)}
            {social(socials.facebook, 'Facebook', Facebook)}
          </div>
        </div>

        <div>
          <h4>Explore</h4>
          <ul>
            {NAV.slice(0, 5).map(([path, label]) => (
              <li key={path}><Link to={path}>{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Get involved</h4>
          <ul>
            <li><Link to="/register">Become a volunteer</Link></li>
            <li><Link to="/events?status=upcoming">Upcoming events</Link></li>
            <li><Link to="/alumni">Alumni network</Link></li>
            <li><Link to="/verify">Verify a certificate</Link></li>
          </ul>
        </div>

        <div>
          <h4>Reach us</h4>
          <ul className="contact-list">
            {contact.address && <li><MapPin size={16} /><span>{contact.address}</span></li>}
            {contact.phone && <li><Phone size={16} /><span>{contact.phone}</span></li>}
            {contact.email && <li><Mail size={16} /><span>{contact.email}</span></li>}
          </ul>
        </div>
      </div>

      <div className="container footer-base">
        <span>© {new Date().getFullYear()} {s.unitName || 'NSS Unit'}, KJCOEMR, Pune</span>
        <Link to="/login">Admin login</Link>
      </div>
    </footer>
  );
}

export default function Layout() {
  const location = useLocation();

  // Scroll to a #section if the URL has one (for example /about#team), otherwise to the top.
  useEffect(() => {
    if (location.hash) {
      const t = setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [location.pathname, location.hash]);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <Navbar />
      <main id="main" key={location.pathname} className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}