import jwt from 'jsonwebtoken';
import User, { STAFF_ROLES } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const extractToken = (req) => {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) return h.slice(7);
  return req.cookies?.token || null;
};

const load = async (req) => {
  const token = extractToken(req);
  if (!token) return null;
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(id);
  if (!user || user.status !== 'active') return null;
  return user;
};

export const protect = asyncHandler(async (req, res, next) => {
  const user = await load(req);
  if (!user) throw new ApiError(401, 'Please log in');
  req.user = user;
  req.isStaff = STAFF_ROLES.includes(user.role);
  next();
});

// Attaches req.user / req.isStaff when a valid token exists, never blocks.
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const user = await load(req);
    if (user) {
      req.user = user;
      req.isStaff = STAFF_ROLES.includes(user.role);
    }
  } catch {
    /* ignore invalid token on public routes */
  }
  req.isStaff = req.isStaff || false;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) throw new ApiError(403, 'You do not have permission');
    next();
  };

export const staffOnly = restrictTo(...STAFF_ROLES);
export const adminOnly = restrictTo('superadmin', 'officer');
