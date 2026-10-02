import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect, optionalAuth, staffOnly, adminOnly, restrictTo } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { crud } from '../utils/crud.js';
import * as auth from '../controllers/auth.js';
import * as users from '../controllers/users.js';
import * as events from '../controllers/events.js';
import * as regs from '../controllers/registrations.js';
import * as m from '../controllers/misc.js';
import Album from '../models/Album.js';
import Alumni from '../models/Alumni.js';
import Coordinator from '../models/Coordinator.js';
import Notice from '../models/Notice.js';
import Testimonial from '../models/Testimonial.js';
import * as notifications from '../controllers/notifications.js';

const r = Router();
const published = { isPublished: true };
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

// Mounts list/get publicly (unpublished hidden) and write ops for staff.
const mountContent = (path, handlers, { deleteRoles = adminOnly } = {}) => {
  r.get(`/${path}`, optionalAuth, handlers.list);
  r.get(`/${path}/:id`, optionalAuth, handlers.get);
  r.post(`/${path}`, protect, staffOnly, handlers.create);
  r.patch(`/${path}/:id`, protect, staffOnly, handlers.update);
  r.delete(`/${path}/:id`, protect, deleteRoles, handlers.remove);
};

// ---- auth ----
r.post('/auth/register', authLimiter, auth.register);
r.post('/auth/login', authLimiter, auth.login);
r.post('/auth/logout', auth.logout);
r.get('/auth/me', protect, auth.me);
r.patch('/auth/me', protect, auth.updateMe);
r.post('/auth/change-password', protect, auth.changePassword);

r.post('/notifications/token', protect, notifications.saveToken);
r.post('/notifications/test', protect, notifications.testNotification);
// ---- users ----
r.get('/users/public', users.publicList);
r.get('/users/public/:id', users.publicProfile);
r.get('/users/leaderboard', users.leaderboard);
r.get('/users/blood-donors', users.bloodDonors);
r.get('/users/me/dashboard', protect, users.myDashboard);
r.get('/users', protect, staffOnly, users.adminList);
r.post('/users/bulk-approve', protect, adminOnly, users.bulkApprove);
r.get('/users/:id', protect, staffOnly, users.adminGet);
r.patch('/users/:id', protect, staffOnly, users.adminUpdate);
r.patch('/users/:id/hours', protect, staffOnly, users.adjustHours);
r.patch('/users/:id/status', protect, staffOnly, users.setStatus);
r.patch('/users/:id/role', protect, restrictTo('superadmin'), users.setRole);
r.delete('/users/:id', protect, adminOnly, users.adminDelete);

// ---- events ----
r.get('/events', optionalAuth, events.list);
r.get('/events/:id', optionalAuth, events.get);
r.post('/events', protect, staffOnly, events.create);
r.patch('/events/:id', protect, staffOnly, events.update);
r.delete('/events/:id', protect, adminOnly, events.remove);
r.post('/events/:id/updates', protect, staffOnly, events.addUpdate);
r.delete('/events/:id/updates/:updateId', protect, staffOnly, events.removeUpdate);
r.post('/events/:id/photos', protect, staffOnly, events.addPhotos);
r.delete('/events/:id/photos/:photoId', protect, staffOnly, events.removePhoto);

// ---- registrations ----
r.post('/registrations/event/:eventId', protect, regs.register);
r.delete('/registrations/event/:eventId', protect, regs.cancel);
r.get('/registrations/me', protect, regs.mine);
r.get('/registrations/event/:eventId', protect, staffOnly, regs.forEvent);
r.post('/registrations/:id/feedback', protect, regs.feedback);

// ---- simple content collections ----
mountContent('alumni/list', crud(Alumni, { searchFields: ['name', 'company', 'city'], filterFields: ['batchYear', 'department'], publicFilter: published, sort: '-batchYear' }));
r.get('/alumni', optionalAuth, m.alumniGrouped); // grouped by graduation year
mountContent('coordinators/list', crud(Coordinator, { filterFields: ['category', 'department'], publicFilter: published, sort: 'order' }));
r.get('/coordinators', optionalAuth, m.coordinatorsGrouped); // principal / PO / department-wise / student leads
mountContent('notices', crud(Notice, { searchFields: ['title'], filterFields: ['category'], publicFilter: published, sort: '-pinned -createdAt' }));
mountContent('testimonials', crud(Testimonial, { publicFilter: published }));

// ---- albums (gallery) ----
r.get('/albums', optionalAuth, crud(Album, { searchFields: ['title'], publicFilter: published, sort: '-date' }).list);
r.get('/albums/:id', optionalAuth, m.albumGet);
const albumCrud = crud(Album);
r.post('/albums', protect, staffOnly, albumCrud.create);
r.patch('/albums/:id', protect, staffOnly, albumCrud.update);
r.delete('/albums/:id', protect, adminOnly, albumCrud.remove);
r.post('/albums/:id/photos', protect, staffOnly, m.albumAddPhotos);
r.delete('/albums/:id/photos/:photoId', protect, staffOnly, m.albumRemovePhoto);

// ---- certificates ----
r.get('/certificates/verify/:code', m.certVerify);
r.get('/certificates/me', protect, m.certMine);
r.post('/certificates', protect, staffOnly, m.certIssue);
r.post('/certificates/event/:eventId', protect, staffOnly, m.certIssueForEvent);

// ---- contact ----
r.post('/contact', contactLimiter, m.contactCreate);
r.get('/contact', protect, staffOnly, m.contactList);
r.patch('/contact/:id/read', protect, staffOnly, m.contactRead);
r.delete('/contact/:id', protect, adminOnly, m.contactDelete);

// ---- settings / stats ----
r.get('/settings', m.settingsGet);
r.put('/settings', protect, adminOnly, m.settingsUpdate);
r.get('/stats', m.stats);
r.get('/admin/analytics', protect, staffOnly, m.analytics);

// ---- uploads ----
r.post('/uploads', protect, upload.single('file'), m.uploadOne);
r.post('/uploads/multiple', protect, staffOnly, upload.array('files', 20), m.uploadMany);

export default r;
