import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    batchYear: { type: Number, required: true, index: true }, // graduation year
    department: String,
    photo: { url: String, publicId: String },
    company: String,
    designation: String,
    city: String,
    bio: String,
    story: String, // "where are they now" / NSS memories
    email: String,
    linkedin: String,
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Alumni', alumniSchema);
