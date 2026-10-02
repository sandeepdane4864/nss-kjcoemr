import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const STAFF_ROLES = ['superadmin', 'officer', 'coordinator'];

const imageSchema = new mongoose.Schema({ url: String, publicId: String }, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['superadmin', 'officer', 'coordinator', 'volunteer'], default: 'volunteer' },
    status: { type: String, enum: ['pending', 'active', 'rejected', 'suspended'], default: 'pending' },

    // volunteer profile
    department: { type: String, trim: true },
    year: { type: String, enum: ['FE', 'SE', 'TE', 'BE', 'ME', ''], default: '' },
    rollNo: { type: String, trim: true },
    phone: { type: String, trim: true },
    bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], default: '' },
    photo: imageSchema,
    bio: { type: String, maxlength: 500 },
    skills: [String],
    socials: { linkedin: String, instagram: String, github: String },
    joinedYear: Number,
    isPublic: { type: Boolean, default: true }, // member controls public visibility
    showBloodGroup: { type: Boolean, default: false }, // opt-in to blood donor directory

    // tracking
    hoursTotal: { type: Number, default: 0 },
    badges: [{ key: String, label: String, awardedAt: { type: Date, default: Date.now }, _id: false }],
    lastLoginAt: Date,
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.index({ status: 1, isPublic: 1, department: 1, year: 1 });

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function () {
  const o = this.toObject();
  delete o.password;
  delete o.__v;
  return o;
};

export const PUBLIC_USER_FIELDS =
  'name department year photo bio skills socials hoursTotal badges joinedYear createdAt';

export default mongoose.model('User', userSchema);
