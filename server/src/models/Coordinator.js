import mongoose from 'mongoose';

const coordinatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['principal', 'program-officer', 'department-coordinator', 'student-lead'],
      required: true,
    },
    designation: String, // e.g. "Assistant Professor"
    department: String,
    photo: { url: String, publicId: String },
    email: String,
    phone: String,
    bio: String,
    message: String, // short message shown on About page
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Coordinator', coordinatorSchema);
