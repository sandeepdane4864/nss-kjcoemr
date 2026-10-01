import mongoose from 'mongoose';
import slugify from 'slugify';
import crypto from 'crypto';

const img = { url: String, publicId: String, caption: String };

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    summary: { type: String, maxlength: 300 },
    description: { type: String },
    category: {
      type: String,
      enum: ['blood-donation', 'plantation', 'cleanliness', 'awareness', 'camp', 'health', 'education', 'cultural', 'other'],
      default: 'other',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    venue: { name: String, address: String, lat: Number, lng: Number },
    cover: { url: String, publicId: String },
    photos: [img],
    hoursCredit: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, default: 0 }, // 0 = unlimited
    registrationOpen: { type: Boolean, default: true },
    report: String, // post-event write-up
    dailyUpdates: [{ text: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, at: { type: Date, default: Date.now } }],
    highlights: [{ label: String, value: String }], // e.g. "Saplings planted": "500"
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

eventSchema.virtual('status').get(function () {
  const now = new Date();
  if (this.endDate < now) return 'completed';
  if (this.startDate <= now) return 'ongoing';
  return 'upcoming';
});

eventSchema.pre('validate', function (next) {
  if (!this.endDate) this.endDate = this.startDate;
  if (!this.slug && this.title) {
    this.slug = `${slugify(this.title, { lower: true, strict: true })}-${crypto.randomBytes(2).toString('hex')}`;
  }
  next();
});

export default mongoose.model('Event', eventSchema);
