import { Link, NavLink, Navigate, Outlet } from 'react-router-dom';
import { Bell, CalendarDays, FolderHeart, GraduationCap, Image, LayoutDashboard, Mail, Quote, Settings, ShieldCheck, Users } from 'lucide-react';
import Wheel from '../../components/Wheel.jsx';
import Avatar from '../../components/Avatar.jsx';
import { Loader } from '../../components/ui.jsx';
import { useAuth } from '../../lib/auth.jsx';

const LINKS = [
  ['/admin', 'Dashboard', LayoutDashboard, true],
  ['/admin/events', 'Events', CalendarDays],
  ['/admin/volunteers', 'Volunteers', Users],
  ['/admin/albums', 'Gallery', Image],
  ['/admin/alumni', 'Alumni', GraduationCap],
  ['/admin/coordinators', 'Coordinators', ShieldCheck],
  ['/admin/notices', 'Notices', Bell],
  ['/admin/testimonials', 'Testimonials', Quote],
  ['/admin/messages', 'Messages', Mail],
  ['/admin/settings', 'Site settings', Settings, false, true],
];

export default function AdminLayout() {
  const { user, loading, isStaff, isAdmin, logout } = useAuth();
  if (loading) return <div className="container pad"><Loader /></div>;
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  if (!isStaff) return <Navigate to="/me" replace />;
  return (
    <div className="admin">
      <aside className="admin-side">
        <Link to="/admin" className="admin-brand"><Wheel ring="#fff" accent="var(--red)" paper="var(--navy-900)" className="brand-wheel" /> <span>NSS Admin</span></Link>
        <nav aria-label="Admin">
          {LINKS.filter((l) => !l[4] || isAdmin).map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end}><Icon size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div className="admin-user">
          <Avatar name={user.name} src={user.photo?.url} size={34} />
          <div><b>{user.name}</b><span>{user.role}</span></div>
          <Link to="/" className="admin-exit">View site</Link>
          <button onClick={logout}>Log out</button>
        </div>
      </aside>
      <div className="admin-main"><Outlet /></div>
    </div>
  );
}

export const AdminTitle = ({ title, children }) => (
  <div className="admin-title"><h1>{title}</h1><div>{children}</div></div>
);
export { FolderHeart };
