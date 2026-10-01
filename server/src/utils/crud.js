import mongoose from 'mongoose';
import asyncHandler from './asyncHandler.js';
import ApiError from './ApiError.js';

export const paginate = (req, def = 20) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || def, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const safeSort = (s, fallback) => (/^-?\w+$/.test(String(s || '')) ? String(s) : fallback);
const strip = (body) => {
  const { _id, __v, createdAt, updatedAt, ...rest } = body || {};
  return rest;
};

export const findByIdOrSlug = (Model, param) =>
  mongoose.isValidObjectId(param) ? Model.findById(param) : Model.findOne({ slug: param });

/**
 * Generic CRUD handlers.
 * Public callers only see docs matching `publicFilter`; staff see everything.
 */
export function crud(Model, { searchFields = [], filterFields = [], publicFilter = {}, sort = '-createdAt', populate = '' } = {}) {
  const list = asyncHandler(async (req, res) => {
    const { page, limit, skip } = paginate(req);
    const filter = {};
    for (const f of filterFields) {
      if (req.query[f] !== undefined && req.query[f] !== '') filter[f] = String(req.query[f]);
    }
    if (req.query.q && searchFields.length) {
      const rx = new RegExp(escapeRegex(req.query.q), 'i');
      filter.$or = searchFields.map((f) => ({ [f]: rx }));
    }
    if (!req.isStaff) Object.assign(filter, publicFilter);
    const [items, total] = await Promise.all([
      Model.find(filter).sort(safeSort(req.query.sort, sort)).skip(skip).limit(limit).populate(populate),
      Model.countDocuments(filter),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  });

  const get = asyncHandler(async (req, res) => {
    const doc = await findByIdOrSlug(Model, req.params.id).populate(populate);
    if (!doc || (!req.isStaff && Object.entries(publicFilter).some(([k, v]) => doc[k] !== v))) {
      throw new ApiError(404, 'Not found');
    }
    res.json(doc);
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create({ ...strip(req.body), createdBy: req.user._id });
    res.status(201).json(doc);
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) throw new ApiError(404, 'Not found');
    doc.set(strip(req.body));
    await doc.save();
    res.json(doc);
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Not found');
    res.json({ message: 'Deleted' });
  });

  return { list, get, create, update, remove };
}
