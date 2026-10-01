import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sendToken = (res, user, status = 200) => {
  const token = signToken(user._id);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(status).json({ token, user });
};

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  department: z.string().max(80).optional(),
  year: z.enum(['FE', 'SE', 'TE', 'BE', 'ME']).optional(),
  rollNo: z.string().max(30).optional(),
  phone: z.string().max(20).optional(),
});

const PROFILE_FIELDS = z.object({
  name: z.string().min(2).max(80),
  department: z.string().max(80),
  year: z.enum(['FE', 'SE', 'TE', 'BE', 'ME', '']),
  rollNo: z.string().max(30),
  phone: z.string().max(20),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']),
  bio: z.string().max(500),
  skills: z.array(z.string().max(40)).max(15),
  socials: z.object({ linkedin: z.string().max(200), instagram: z.string().max(200), github: z.string().max(200) }).partial(),
  photo: z.object({ url: z.string().url(), publicId: z.string().optional() }),
  isPublic: z.boolean(),
  showBloodGroup: z.boolean(),
  joinedYear: z.number().int().min(2000).max(new Date().getFullYear() + 1),
}).partial();

export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  if (await User.exists({ email: data.email.toLowerCase() })) throw new ApiError(409, 'An account with this email already exists');
  // Volunteers are always created as pending; staff approve them from the admin panel.
  await User.create({ ...data, role: 'volunteer', status: 'pending', joinedYear: new Date().getFullYear() });
  res.status(201).json({ message: 'Registration received. You can log in once an NSS coordinator approves your account.' });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (user.status === 'pending') throw new ApiError(403, 'Your account is awaiting approval');
  if (user.status !== 'active') throw new ApiError(403, 'Your account is not active. Please contact the NSS office');
  user.lastLoginAt = new Date();
  await user.save();
  sendToken(res, user);
});

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

export const me = (req, res) => res.json(req.user);

export const updateMe = asyncHandler(async (req, res) => {
  const data = PROFILE_FIELDS.parse(req.body);
  req.user.set(data);
  await req.user.save();
  res.json(req.user);
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = z
    .object({ currentPassword: z.string(), newPassword: z.string().min(8).max(72) })
    .parse(req.body);
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) throw new ApiError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  sendToken(res, user);
});
