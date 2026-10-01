import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: String,
    category: { type: String, enum: ['notice', 'news', 'circular', 'download'], default: 'notice' },
    attachment: { url: String, name: String },
    pinned: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Notice', noticeSchema);
