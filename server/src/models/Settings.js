import mongoose from 'mongoose';

// Singleton: site-wide content edited from the admin panel.
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    unitName: { type: String, default: 'NSS Unit' },
    collegeName: { type: String, default: 'KJ College of Engineering and Management Research' },
    motto: { type: String, default: 'Not Me, But You' },
    foundedYear: Number,
    about: String,
    objectives: [String],
    vision: String,
    mission: String,
    targetHours: { type: Number, default: 120 },
    contact: { email: String, phone: String, address: String, mapUrl: String },
    socials: { instagram: String, linkedin: String, youtube: String, facebook: String },
    statsOverride: { villagesAdopted: Number, treesPlanted: Number, bloodUnits: Number, beneficiaries: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
