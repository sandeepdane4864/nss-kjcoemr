import { z } from 'zod';
import User, { PUBLIC_USER_FIELDS } from '../models/User.js';
import Registration from '../models/Registration.js';
import Certificate from '../models/Certificate.js';
import { awardBadges } from '../utils/badges.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { paginate, escapeRegex } from '../utils/crud.js';
import { sendPushToUsers } from '../utils/pushNotifications.js';

const publicBase = { status: 'active', isPublic: true, role: { $in: ['volunteer', 'coordinator'] } };

// ---- public ----
export const publicList = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req, 24);
  const filter = { ...publicBase };
  if (req.query.department) filter.department = String(req.query.department);
  if (req.query.year) filter.year = String(req.query.year);
  if (req.query.q) filter.name = new RegExp(escapeRegex(req.query.q), 'i');
  const [items, total] = await Promise.all([
    User.find(filter).select(PUBLIC_USER_FIELDS).sort('name').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const publicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, ...publicBase }).select(PUBLIC_USER_FIELDS);
  if (!user) throw new ApiError(404, 'Volunteer not found');
  res.json({ user });
});

export const leaderboard = asyncHandler(async (req, res) => {
  const items = await User.find({ ...publicBase, hoursTotal: { $gt: 0 } })
    .select(PUBLIC_USER_FIELDS)
    .sort('-hoursTotal')
    .limit(Math.min(parseInt(req.query.limit) || 10, 50));
  res.json(items);
});

// Opt-in blood donor directory (only members who enabled showBloodGroup).
export const bloodDonors = asyncHandler(async (req, res) => {
  const filter = { ...publicBase, showBloodGroup: true, bloodGroup: { $ne: '' } };
  if (req.query.group) filter.bloodGroup = String(req.query.group);
  const items = await User.find(filter).select('name department year bloodGroup photo').sort('name').limit(100);
  res.json(items);
});

// ---- self dashboard ----
export const myDashboard = asyncHandler(async (req, res) => {
  const [registrations, certificates] = await Promise.all([
    Registration.find({ user: req.user._id, status: 'registered' })
      .populate('event', 'title slug startDate endDate venue cover category')
      .sort('-createdAt'),
    Certificate.find({ user: req.user._id }).populate('event', 'title slug').sort('-issuedAt'),
  ]);
  const now = new Date();
  res.json({
    hoursTotal: req.user.hoursTotal,
    badges: req.user.badges,
    upcoming: registrations.filter((r) => r.event.endDate >= now),
    past: registrations.filter((r) => r.event.endDate < now),
    certificates,
  });
});

// ---- admin ----
export const adminList = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req, 25);
  const filter = {};
  for (const f of ['status', 'role', 'department', 'year']) if (req.query[f]) filter[f] = String(req.query[f]);
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { rollNo: rx }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

export const adminGet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json(user);
});


export const setStatus = asyncHandler(async (req, res) => {
  const { status } = z.object({
    status: z.enum(['active', 'rejected', 'suspended', 'pending']),
  }).parse(req.body);

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  const wasPending = user.status === 'pending';
  user.status = status;
  await user.save();

  if (wasPending && status === 'active') {
    try {
      await sendPushToUsers([user], {
        title: 'NSS Membership Approved',
        body: 'Your NSS membership has been approved. Welcome to NSS KJCOEMR!',
        url: '/me',
      });
    } catch (error) {
      console.error('Membership notification failed:', error.message);
    }
  }

  res.json(user);
});


export const bulkApprove = asyncHandler(async (req, res) => {
  const { ids } = z.object({
    ids: z.array(z.string()).min(1).max(200),
  }).parse(req.body);

  const users = await User.find({
    _id: { $in: ids },
    status: 'pending',
  });

  await User.updateMany(
    { _id: { $in: users.map((user) => user._id) } },
    { $set: { status: 'active' } }
  );

  try {
    await sendPushToUsers(users, {
      title: 'NSS Membership Approved',
      body: 'Your NSS membership has been approved. Welcome to NSS KJCOEMR!',
      url: '/me',
    });
  } catch (error) {
    console.error('Bulk approval notifications failed:', error.message);
  }

  res.json({ approved: users.length });
});

export const setRole = asyncHandler(async (req, res) => {
  const { role } = z.object({ role: z.enum(['superadmin', 'officer', 'coordinator', 'volunteer']) }).parse(req.body);
  if (String(req.user._id) === req.params.id) throw new ApiError(400, 'You cannot change your own role');
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json(user);
});

export const adminUpdate = asyncHandler(async (req, res) => {
  const { password, role, status, email, ...rest } = req.body; // role/status/password have dedicated flows
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.set(rest);
  await user.save();
  res.json(user);
});

export const adminDelete = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) throw new ApiError(400, 'You cannot delete your own account');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  await Registration.deleteMany({ user: user._id });
  res.json({ message: 'Deleted' });
});

// Staff record NSS hours manually (positive or negative adjustment).
export const adjustHours = asyncHandler(async (req, res) => {
  const { hours } = z.object({ hours: z.number().min(-500).max(500) }).parse(req.body);
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.hoursTotal = Math.max(0, user.hoursTotal + hours);
  await user.save();
  await awardBadges(user);
  res.json(user);
});
