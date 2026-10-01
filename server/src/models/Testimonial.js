import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: String, // "Volunteer, TE Comp" / "Beneficiary"
    quote: { type: String, required: true, maxlength: 600 },
    photo: { url: String, publicId: String },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Testimonial', testimonialSchema);
