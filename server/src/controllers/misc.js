import Album from '../models/Album.js';
import Alumni from '../models/Alumni.js';
import Coordinator from '../models/Coordinator.js';
import Certificate from '../models/Certificate.js';
import Event from '../models/Event.js';
import Message from '../models/Message.js';
import Registration from '../models/Registration.js';
import Settings from '../models/Settings.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { findByIdOrSlug } from '../utils/crud.js';
import { uploadBuffer } from '../utils/cloudinary.js';

// ---- grouped lists ----
export const alumniGrouped = asyncHandler(async (req, res) => {
  const filter = req.isStaff ? {} : { isPublished: true };
  if (req.query.department) filter.department = String(req.query.department);
  const items = await Alumni.find(filter).sort('-batchYear name');
  const groups = {};
  for (const a of items) (groups[a.batchYear] ||= []).push(a);
  res.json(Object.entries(groups).map(([year, members]) => ({ year: Number(year), members })).sort((a, b) => b.year - a.year));
});

export const coordinatorsGrouped = asyncHandler(async (req, res) => {
  const items = await Coordinator.find(req.isStaff ? {} : { isPublished: true }).sort('order name');
  const by = (c) => items.filter((i) => i.category === c);
  const departments = {};
  for (const c of by('department-coordinator')) (departments[c.department || 'General'] ||= []).push(c);
  res.json({
    principal: by('principal')[0] || null,
    programOfficers: by('program-officer'),
    departmentCoordinators: Object.entries(departments).map(([department, members]) => ({ department, members })),
    studentLeads: by('student-lead'),
  });
});

// ---- albums ----
export const albumGet = asyncHandler(async (req, res) => {
  const album = await findByIdOrSlug(Album, req.params.id).populate('event', 'title slug startDate');
  if (!album || (!album.isPublished && !req.isStaff)) throw new ApiError(404, 'Album not found');
  res.json(album);
});

export const albumAddPhotos = asyncHandler(async (req, res) => {
  const photos = (Array.isArray(req.body.photos) ? req.body.photos : []).filter((p) => p?.url);
  if (!photos.length) throw new ApiError(400, 'No photos provided');
  const album = await Album.findByIdAndUpdate(req.params.id, { $push: { photos: { $each: photos } } }, { new: true });
  if (!album) throw new ApiError(404, 'Album not found');
  if (!album.cover?.url) {
    album.cover = { url: album.photos[0].url, publicId: album.photos[0].publicId };
    await album.save();
  }
  res.status(201).json(album);
});

export const albumRemovePhoto = asyncHandler(async (req, res) => {
  const album = await Album.findByIdAndUpdate(req.params.id, { $pull: { photos: { _id: req.params.photoId } } }, { new: true });
  if (!album) throw new ApiError(404, 'Album not found');
  res.json(album);
});

// ---- certificates ----
export const certIssue = asyncHandler(async (req, res) => {
  const { userId, eventId, type, title, hours } = req.body;
  if (!userId || !title) throw new ApiError(400, 'userId and title are required');
  const cert = await Certificate.create({ user: userId, event: eventId || undefined, type, title, hours, issuedBy: req.user._id });
  res.status(201).json(cert);
});

// Issue participation certificates to selected users (userIds) or, by default, everyone registered.
export const certIssueForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) throw new ApiError(404, 'Event not found');
  const ids = Array.isArray(req.body.userIds) && req.body.userIds.length
    ? req.body.userIds.map(String)
    : (await Registration.find({ event: event._id, status: 'registered' }).select('user')).map((r) => String(r.user));
  const existing = new Set((await Certificate.find({ event: event._id, type: 'participation' }).select('user')).map((c) => String(c.user)));
  const docs = ids
    .filter((id) => !existing.has(id))
    .map((id) => ({ user: id, event: event._id, type: 'participation', title: `Participation in ${event.title}`, issuedBy: req.user._id }));
  const created = docs.length ? await Certificate.insertMany(docs) : [];
  res.status(201).json({ issued: created.length, skipped: ids.length - created.length });
});

export const certMine = asyncHandler(async (req, res) => {
  res.json(await Certificate.find({ user: req.user._id }).populate('event', 'title slug startDate').sort('-issuedAt'));
});

export const certVerify = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ code: String(req.params.code).toUpperCase() })
    .populate('user', 'name department year')
    .populate('event', 'title startDate');
  if (!cert) throw new ApiError(404, 'Certificate not found. Please check the code.');
  res.json({ valid: true, code: cert.code, title: cert.title, type: cert.type, hours: cert.hours, issuedAt: cert.issuedAt, user: cert.user, event: cert.event });
});

// ---- contact ----
export const contactCreate = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) throw new ApiError(400, 'Name, email and message are required');
  await Message.create({ name, email, subject, message });
  res.status(201).json({ message: 'Thanks! We will get back to you soon.' });
});
export const contactList = asyncHandler(async (req, res) => res.json(await Message.find().sort('-createdAt').limit(200)));
export const contactRead = asyncHandler(async (req, res) => res.json(await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })));
export const contactDelete = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// ---- settings (singleton) ----
export const settingsGet = asyncHandler(async (req, res) => {
  res.json((await Settings.findOne({ key: 'main' })) || (await Settings.create({ key: 'main' })));
});
export const settingsUpdate = asyncHandler(async (req, res) => {
  const { _id, key, ...data } = req.body;
  res.json(await Settings.findOneAndUpdate({ key: 'main' }, data, { new: true, upsert: true, runValidators: true }));
});

// ---- stats ----
export const stats = asyncHandler(async (req, res) => {
  const now = new Date();
  const [volunteers, eventsDone, upcoming, alumni, albums, hours, settings] = await Promise.all([
    User.countDocuments({ status: 'active', role: 'volunteer' }),
    Event.countDocuments({ isPublished: true, endDate: { $lt: now } }),
    Event.countDocuments({ isPublished: true, endDate: { $gte: now } }),
    Alumni.countDocuments({ isPublished: true }),
    Album.countDocuments({ isPublished: true }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$hoursTotal' } } }]),
    Settings.findOne({ key: 'main' }),
  ]);
  res.json({ volunteers, eventsDone, upcoming, alumni, albums, totalHours: hours[0]?.total || 0, ...(settings?.toObject().statsOverride || {}) });
});

// Admin analytics: participation by department and events per month (last 12 months).
export const analytics = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setMonth(since.getMonth() - 11, 1);
  since.setHours(0, 0, 0, 0);
  const [byDepartment, eventsPerMonth, byYear, pending] = await Promise.all([
    User.aggregate([
      { $match: { status: 'active', role: 'volunteer' } },
      { $group: { _id: { $ifNull: ['$department', 'Unknown'] }, volunteers: { $sum: 1 }, hours: { $sum: '$hoursTotal' } } },
      { $sort: { volunteers: -1 } },
    ]),
    Event.aggregate([
      { $match: { startDate: { $gte: since } } },
      { $group: { _id: { y: { $year: '$startDate' }, m: { $month: '$startDate' } }, events: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    User.aggregate([
      { $match: { status: 'active', role: 'volunteer' } },
      { $group: { _id: '$year', volunteers: { $sum: 1 } } },
    ]),
    User.countDocuments({ status: 'pending' }),
  ]);
  res.json({ byDepartment, eventsPerMonth, byYear, pendingApprovals: pending });
});

// ---- uploads ----
const FOLDERS = ['profiles', 'events', 'gallery', 'alumni', 'coordinators', 'notices', 'misc'];
const pickFolder = (req) => (req.isStaff && FOLDERS.includes(req.body.folder) ? req.body.folder : 'profiles');

export const uploadOne = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  res.status(201).json(await uploadBuffer(req.file.buffer, pickFolder(req)));
});
export const uploadMany = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new ApiError(400, 'No files uploaded');
  const folder = pickFolder(req);
  res.status(201).json(await Promise.all(req.files.map((f) => uploadBuffer(f.buffer, folder))));
});
