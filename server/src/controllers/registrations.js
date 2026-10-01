import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event || !event.isPublished) throw new ApiError(404, 'Event not found');
  if (!event.registrationOpen) throw new ApiError(400, 'Registration is closed for this event');
  if (event.endDate < new Date()) throw new ApiError(400, 'This event has already ended');

  if (event.capacity > 0) {
    const taken = await Registration.countDocuments({ event: event._id, status: 'registered' });
    if (taken >= event.capacity) throw new ApiError(409, 'This event is full');
  }

  let reg = await Registration.findOne({ event: event._id, user: req.user._id });
  if (reg) {
    if (reg.status !== 'cancelled') throw new ApiError(409, 'You are already registered');
    reg.status = 'registered';
    await reg.save();
  } else {
    reg = await Registration.create({ event: event._id, user: req.user._id });
  }
  res.status(201).json(reg);
});

export const cancel = asyncHandler(async (req, res) => {
  const reg = await Registration.findOne({ event: req.params.eventId, user: req.user._id, status: 'registered' });
  if (!reg) throw new ApiError(404, 'No active registration found');
  reg.status = 'cancelled';
  await reg.save();
  res.json({ message: 'Registration cancelled' });
});

export const mine = asyncHandler(async (req, res) => {
  const items = await Registration.find({ user: req.user._id })
    .populate('event', 'title slug startDate endDate venue cover category')
    .sort('-createdAt');
  res.json(items);
});

export const forEvent = asyncHandler(async (req, res) => {
  const items = await Registration.find({ event: req.params.eventId, status: 'registered' })
    .populate('user', 'name email phone department year rollNo photo')
    .sort('createdAt');
  res.json(items);
});

// Feedback is allowed once the event has ended.
export const feedback = asyncHandler(async (req, res) => {
  const reg = await Registration.findOne({ _id: req.params.id, user: req.user._id, status: 'registered' }).populate('event', 'endDate');
  if (!reg) throw new ApiError(404, 'Registration not found');
  if (reg.event.endDate > new Date()) throw new ApiError(400, 'Feedback opens after the event ends');
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) throw new ApiError(400, 'Rating must be between 1 and 5');
  reg.feedback = { rating, comment: String(req.body.comment || '').slice(0, 500) };
  await reg.save();
  res.json(reg);
});
