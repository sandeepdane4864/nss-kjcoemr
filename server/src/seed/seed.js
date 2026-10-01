// Usage: npm run seed            (adds data if empty)
//        npm run seed:reset      (wipes collections first)
// All names/text below are PLACEHOLDERS - replace from the admin panel.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Coordinator from '../models/Coordinator.js';
import Event from '../models/Event.js';
import Alumni from '../models/Alumni.js';
import Notice from '../models/Notice.js';
import Testimonial from '../models/Testimonial.js';
import Album from '../models/Album.js';
import Registration from '../models/Registration.js';
import Certificate from '../models/Certificate.js';
import Message from '../models/Message.js';

const reset = process.argv.includes('--reset');
const day = (n, h = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, 0, 0, 0);
  return d;
};

await connectDB();

if (reset) {
  await Promise.all([User, Settings, Coordinator, Event, Alumni, Notice, Testimonial, Album, Registration, Certificate, Message].map((m) => m.deleteMany({})));
  console.log('Collections cleared');
}

if (!(await User.exists({ role: 'superadmin' }))) {
  await User.create({
    name: 'NSS Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@nss.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123',
    role: 'superadmin',
    status: 'active',
  });
  console.log('Super admin created');
}

await Settings.findOneAndUpdate(
  { key: 'main' },
  {
    unitName: 'NSS Unit, KJCOEMR',
    motto: 'Not Me, But You',
    foundedYear: 2010, // PLACEHOLDER - confirm with Program Officer
    about: 'The National Service Scheme (NSS) unit of KJ College of Engineering and Management Research engages students in community service, building character and social responsibility alongside their engineering education.',
    objectives: [
      'Understand the community in which they work',
      'Identify the needs and problems of the community and involve them in problem solving',
      'Develop a sense of social and civic responsibility',
      'Utilise their knowledge in finding practical solutions to individual and community problems',
      'Develop competence required for group living and sharing of responsibilities',
    ],
    vision: 'To be a premier knowledge center of the nation for socio-economic development.',
    contact: { email: 'office.kjcoemr@kjei.edu.in', phone: '+91-8446021199', address: 'Sr.No. 25 & 27, Kondhwa-Saswad Road, Bopdev Ghat, Pune 411048' },
  },
  { upsert: true, new: true }
);

if (!(await Coordinator.countDocuments())) {
  await Coordinator.insertMany([
    { name: 'Principal Name', category: 'principal', designation: 'Principal, KJCOEMR', order: 0 },
    { name: 'Program Officer Name', category: 'program-officer', designation: 'NSS Program Officer', email: 'nss@kjei.edu.in', order: 0 },
    { name: 'Computer Coordinator', category: 'department-coordinator', department: 'Computer Engineering', designation: 'Assistant Professor', order: 1 },
    { name: 'Civil Coordinator', category: 'department-coordinator', department: 'Civil Engineering', designation: 'Assistant Professor', order: 2 },
    { name: 'Mechanical Coordinator', category: 'department-coordinator', department: 'Mechanical Engineering', designation: 'Assistant Professor', order: 3 },
    { name: 'E&TC Coordinator', category: 'department-coordinator', department: 'E&TC Engineering', designation: 'Assistant Professor', order: 4 },
    { name: 'Student Secretary', category: 'student-lead', designation: 'Student Secretary', order: 1 },
  ]);
}

let events = [];
if (!(await Event.countDocuments())) {
  events = await Event.create([
    { title: 'Blood Donation Camp', category: 'blood-donation', summary: 'Annual blood donation drive in association with a local blood bank.', description: 'Placeholder description.', startDate: day(6, 9), endDate: day(6, 15), venue: { name: 'College Auditorium', address: 'KJCOEMR, Bopdev Ghat, Pune' }, hoursCredit: 4 },
    { title: 'Tree Plantation Drive', category: 'plantation', summary: 'Plant saplings across the campus and nearby hill.', startDate: day(14, 8), endDate: day(14, 12), venue: { name: 'Campus Hill', address: 'KJCOEMR, Pune' }, hoursCredit: 4, capacity: 80 },
    { title: 'Cleanliness Drive', category: 'cleanliness', summary: 'Clean-up drive at the nearby village road.', startDate: day(-20, 8), endDate: day(-20, 12), venue: { name: 'Bopdev Ghat', address: 'Pune' }, hoursCredit: 4, highlights: [{ label: 'Volunteers', value: '60' }], report: 'Placeholder report.' },
    { title: 'Road Safety Awareness Rally', category: 'awareness', summary: 'Rally and street play on road safety.', startDate: day(-60, 9), endDate: day(-60, 13), venue: { name: 'Kondhwa Road', address: 'Pune' }, hoursCredit: 3, registrationOpen: false },
  ]);
  await Album.create({ title: 'Cleanliness Drive Gallery', event: events[2]._id, date: events[2].startDate, description: 'Placeholder album. Upload photos from the admin panel.' });
  console.log('Events and album created');
}

if (!(await Alumni.countDocuments())) {
  await Alumni.insertMany([
    { name: 'Alumni One', batchYear: 2024, department: 'Computer Engineering', company: 'Company A', designation: 'Software Engineer', city: 'Pune', story: 'Placeholder story.' },
    { name: 'Alumni Two', batchYear: 2024, department: 'Mechanical Engineering', company: 'Company B', designation: 'Design Engineer', city: 'Pune' },
    { name: 'Alumni Three', batchYear: 2023, department: 'Civil Engineering', company: 'Company C', designation: 'Site Engineer', city: 'Mumbai' },
    { name: 'Alumni Four', batchYear: 2022, department: 'E&TC Engineering', company: 'Company D', designation: 'Embedded Engineer', city: 'Bengaluru' },
  ]);
}

if (!(await Notice.countDocuments())) {
  await Notice.insertMany([
    { title: 'NSS volunteer registration open for this academic year', category: 'notice', pinned: true, body: 'Placeholder notice.' },
    { title: 'Guidelines for NSS special camp', category: 'circular' },
  ]);
}

if (!(await Testimonial.countDocuments())) {
  await Testimonial.insertMany([{ name: 'Volunteer Name', role: 'Volunteer, TE Computer', quote: 'Placeholder testimonial about what NSS meant to me.' }]);
}

if (!(await User.exists({ role: 'volunteer' }))) {
  const depts = ['Computer Engineering', 'Civil Engineering', 'Mechanical Engineering', 'E&TC Engineering'];
  const years = ['FE', 'SE', 'TE', 'BE'];
  for (let i = 1; i <= 8; i++) {
    await User.create({
      name: `Volunteer ${i}`,
      email: `volunteer${i}@example.com`,
      password: 'Volunteer@123',
      role: 'volunteer',
      status: 'active',
      department: depts[i % depts.length],
      year: years[i % years.length],
      joinedYear: new Date().getFullYear(),
      hoursTotal: i * 6,
    });
  }
  console.log('Sample volunteers created (password: Volunteer@123)');
}

console.log('Seed complete');
await mongoose.disconnect();
