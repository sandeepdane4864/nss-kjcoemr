import mongoose from 'mongoose';
import slugify from 'slugify';
import crypto from 'crypto';

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: String,
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    date: Date,
    cover: { url: String, publicId: String },
    photos: [{ url: String, publicId: String, caption: String }],
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

albumSchema.pre('validate', function (next) {
  if (!this.slug && this.title) this.slug = `${slugify(this.title, { lower: true, strict: true })}-${crypto.randomBytes(2).toString('hex')}`;
  next();
});

export default mongoose.model('Album', albumSchema);
