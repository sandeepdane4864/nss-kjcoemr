import mongoose from 'mongoose';
import crypto from 'crypto';

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    type: { type: String, enum: ['participation', 'appreciation', 'completion', 'special-camp'], default: 'participation' },
    title: { type: String, required: true },
    hours: Number,
    code: { type: String, unique: true, default: () => `NSS-${crypto.randomBytes(4).toString('hex').toUpperCase()}` },
    issuedAt: { type: Date, default: Date.now },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, event: 1, type: 1 }, { unique: true, partialFilterExpression: { event: { $exists: true } } });

export default mongoose.model('Certificate', certificateSchema);
