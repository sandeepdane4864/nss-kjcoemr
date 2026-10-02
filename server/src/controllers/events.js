import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { paginate, escapeRegex, findByIdOrSlug } from '../utils/crud.js';
import User from '../models/User.js';
import { sendPushToUsers } from '../utils/pushNotifications.js';

export const list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req, 12);
  const now = new Date();
  const filter = {};
  let sort = '-startDate';
  if (!req.isStaff) filter.isPublished = true;
  if (req.query.status === 'upcoming') {
    filter.endDate = { $gte: now };
    sort = 'startDate';
  } else if (req.query.status === 'completed') {
    filter.endDate = { $lt: now };
  }
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.year) {
    const y = parseInt(req.query.year);
    if (y) filter.startDate = { ...(filter.startDate || {}), $gte: new Date(y, 0, 1), $lt: new Date(y + 1, 0, 1) };
  }
  if (req.query.q) filter.title = new RegExp(escapeRegex(req.query.q), 'i');

  const [items, total] = await Promise.all([
    Event.find(filter).select('-dailyUpdates -report').sort(sort).skip(skip).limit(limit),
    Event.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const get = asyncHandler(async (req, res) => {
  const event = await findByIdOrSlug(Event, req.params.id);
  if (!event || (!event.isPublished && !req.isStaff)) throw new ApiError(404, 'Event not found');
  const registered = await Registration.countDocuments({ event: event._id, status: 'registered' });
  const mine = req.user ? await Registration.findOne({ event: event._id, user: req.user._id }).select('status') : null;
  res.json({ ...event.toJSON(), registeredCount: registered, myRegistration: mine });
});

export const create = asyncHandler(async (req, res) => {
  const { _id, slug, dailyUpdates, ...data } = req.body;
  const event = await Event.create({ ...data, createdBy: req.user._id });
  res.status(201).json(event);
});

export const update = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  const { _id, slug, dailyUpdates, createdBy, ...data } = req.body;
  event.set(data);
  await event.save();
  res.json(event);
});

export const remove = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw new ApiError(404, 'Event not found');
  await Registration.deleteMany({ event: event._id });
  res.json({ message: 'Deleted' });
});

export const addUpdate = asyncHandler(async (req, res) => {
  const text = String(req.body.text || '').trim();
  if (!text) throw new ApiError(400, 'Update text is required');

  const event = await Event.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        dailyUpdates: {
          $each: [{ text, by: req.user._id }],
          $position: 0,
        },
      },
    },
    { new: true }
  );

  if (!event) throw new ApiError(404, 'Event not found');

  try {
    const registrations = await Registration.find({
      event: event._id,
      status: 'registered',
    }).select('user');

    const userIds = [...new Set(
      registrations.map((registration) => String(registration.user))
    )];

    const users = await User.find({
      _id: { $in: userIds },
    }).select('fcmTokens');

    await sendPushToUsers(users, {
      title: `Event Update: ${event.title}`,
      body: text.slice(0, 200),
      url: `/events/${event.slug || event._id}`,
    });
  } catch (error) {
    console.error('Event update notifications failed:', error.message);
  }

  res.status(201).json(event.dailyUpdates);
});

export const removeUpdate = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { $pull: { dailyUpdates: { _id: req.params.updateId } } }, { new: true });
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(event.dailyUpdates);
});

export const addPhotos = asyncHandler(async (req, res) => {
  const photos = (Array.isArray(req.body.photos) ? req.body.photos : []).filter((p) => p?.url);
  if (!photos.length) throw new ApiError(400, 'No photos provided');
  const event = await Event.findByIdAndUpdate(req.params.id, { $push: { photos: { $each: photos } } }, { new: true });
  if (!event) throw new ApiError(404, 'Event not found');
  res.status(201).json(event.photos);
});

export const removePhoto = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, { $pull: { photos: { _id: req.params.photoId } } }, { new: true });
  if (!event) throw new ApiError(404, 'Event not found');
  res.json(event.photos);
});
