import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Team from './pages/Team.jsx';
import Events from './pages/Events.jsx';
import EventDetail from './pages/EventDetail.jsx';
import Volunteers from './pages/Volunteers.jsx';
import VolunteerProfile from './pages/VolunteerProfile.jsx';
import Gallery from './pages/Gallery.jsx';
import AlbumDetail from './pages/AlbumDetail.jsx';
import Alumni from './pages/Alumni.jsx';
import Notices from './pages/Notices.jsx';
import Verify from './pages/Verify.jsx';
import Certificate from './pages/Certificate.jsx';
import Contact from './pages/Contact.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminHome from './pages/admin/AdminHome.jsx';
import AdminVolunteers from './pages/admin/AdminVolunteers.jsx';
import AdminMessages from './pages/admin/AdminMessages.jsx';
import AdminSettings from './pages/admin/AdminSettings.jsx';
import ResourceManager from './pages/admin/ResourceManager.jsx';
import { albumsCfg, alumniCfg, coordinatorsCfg, eventsCfg, noticesCfg, testimonialsCfg } from './pages/admin/configs.js';
import { Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import { Loader } from './components/ui.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container pad"><Loader /></div>;
  if (!user) return <Navigate to="/login" state={{ from: '/me' }} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="team" element={<Team />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetail />} />
        <Route path="volunteers" element={<Volunteers />} />
        <Route path="volunteers/:id" element={<VolunteerProfile />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="gallery/:id" element={<AlbumDetail />} />
        <Route path="alumni" element={<Alumni />} />
        <Route path="notices" element={<Notices />} />
        <Route path="verify" element={<Verify />} />
        <Route path="verify/:code" element={<Verify />} />
        <Route path="certificate/:code" element={<Certificate />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="me" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="events" element={<ResourceManager cfg={eventsCfg} />} />
        <Route path="volunteers" element={<AdminVolunteers />} />
        <Route path="albums" element={<ResourceManager cfg={albumsCfg} />} />
        <Route path="alumni" element={<ResourceManager cfg={alumniCfg} />} />
        <Route path="coordinators" element={<ResourceManager cfg={coordinatorsCfg} />} />
        <Route path="notices" element={<ResourceManager cfg={noticesCfg} />} />
        <Route path="testimonials" element={<ResourceManager cfg={testimonialsCfg} />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
