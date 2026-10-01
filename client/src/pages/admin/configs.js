import { BLOOD_GROUPS, CATEGORIES, DEPARTMENTS } from '../../constants.js';
import { AlbumExtra, EventExtra } from './extras.jsx';

const published = { name: 'isPublished', label: 'Visible on the public site', type: 'checkbox' };
const cats = Object.entries(CATEGORIES).map(([k, c]) => [k, c.label]);

export const eventsCfg = {
  title: 'Events', singular: 'Event', endpoint: '/events', titleKey: 'title', Extra: EventExtra,
  intro: 'Create upcoming events and add live updates, photos and the final report after they finish.',
  defaults: { category: 'other', registrationOpen: true, isPublished: true, hoursCredit: 4 },
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'startDate', label: 'Starts', type: 'date' },
    { key: 'status', label: 'Status' },
    { key: 'isPublished', label: 'Visibility', type: 'bool' },
  ],
  fields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'summary', label: 'One-line summary' },
    { name: 'category', label: 'Category', type: 'select', required: true, options: cats, half: true },
    { name: 'cover', label: 'Cover photo', type: 'image', folder: 'events' },
    { name: 'startDate', label: 'Starts', type: 'datetime', required: true, half: true },
    { name: 'endDate', label: 'Ends', type: 'datetime', half: true },
    { name: 'venue.name', label: 'Venue name', half: true },
    { name: 'venue.address', label: 'Venue address', half: true },
    { name: 'venue.lat', label: 'Latitude', type: 'number', step: 'any', half: true },
    { name: 'venue.lng', label: 'Longitude', type: 'number', step: 'any', half: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 6 },
    { name: 'capacity', label: 'Capacity', type: 'number', min: 0, half: true, help: '0 means unlimited' },
    { name: 'hoursCredit', label: 'Service hours for this event', type: 'number', min: 0, half: true },
    { name: 'highlights', label: 'Results', type: 'pairs', help: 'One per line as Label: value, for example Saplings planted: 500' },
    { name: 'report', label: 'Event report', type: 'textarea', rows: 6, help: 'Write after the event. Separate paragraphs with a blank line.' },
    { name: 'registrationOpen', label: 'Registration is open', type: 'checkbox' },
    published,
  ],
};

export const albumsCfg = {
  title: 'Gallery', singular: 'Album', endpoint: '/albums', titleKey: 'title', Extra: AlbumExtra,
  intro: 'One album per event. Create the album, then add photos in bulk.',
  defaults: { isPublished: true },
  columns: [
    { key: 'cover', label: 'Cover', type: 'image' },
    { key: 'title', label: 'Title' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'photos', label: 'Photos', type: 'count' },
    { key: 'isPublished', label: 'Visibility', type: 'bool' },
  ],
  fields: [
    { name: 'title', label: 'Album title', required: true },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { name: 'date', label: 'Date', type: 'date', half: true },
    { name: 'cover', label: 'Cover photo (optional)', type: 'image', folder: 'gallery' },
    published,
  ],
};

export const alumniCfg = {
  title: 'Alumni', singular: 'Alumnus', endpoint: '/alumni/list', titleKey: 'name',
  defaults: { isPublished: true },
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'batchYear', label: 'Batch' },
    { key: 'company', label: 'Company' },
    { key: 'isPublished', label: 'Visibility', type: 'bool' },
  ],
  fields: [
    { name: 'photo', label: 'Photo', type: 'image', folder: 'alumni' },
    { name: 'name', label: 'Name', required: true, half: true },
    { name: 'batchYear', label: 'Graduation year', type: 'number', required: true, min: 1990, half: true },
    { name: 'department', label: 'Department', type: 'select', options: DEPARTMENTS, half: true },
    { name: 'city', label: 'City', half: true },
    { name: 'company', label: 'Company', half: true },
    { name: 'designation', label: 'Role', half: true },
    { name: 'linkedin', label: 'LinkedIn URL' },
    { name: 'story', label: 'Where are they now', type: 'textarea', rows: 4, help: 'Shown on the alumni page. Their NSS memories or current work.' },
    published,
  ],
};

export const coordinatorsCfg = {
  title: 'Coordinators', singular: 'Coordinator', endpoint: '/coordinators/list', titleKey: 'name',
  intro: 'Principal, Program Officer, department coordinators and student leads, as shown on the Team page.',
  defaults: { category: 'department-coordinator', isPublished: true, order: 0 },
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Role group' },
    { key: 'department', label: 'Department' },
    { key: 'isPublished', label: 'Visibility', type: 'bool' },
  ],
  fields: [
    { name: 'photo', label: 'Photo', type: 'image', folder: 'coordinators' },
    { name: 'name', label: 'Name', required: true, half: true },
    { name: 'category', label: 'Role group', type: 'select', required: true, half: true, options: [['principal', 'Principal'], ['program-officer', 'Program officer'], ['department-coordinator', 'Department coordinator'], ['student-lead', 'Student lead']] },
    { name: 'designation', label: 'Designation', half: true },
    { name: 'department', label: 'Department', type: 'select', options: DEPARTMENTS, half: true },
    { name: 'email', label: 'Email', type: 'email', half: true },
    { name: 'phone', label: 'Phone', half: true },
    { name: 'bio', label: 'Short bio', type: 'textarea', rows: 3 },
    { name: 'message', label: 'Message (shown on the About page)', type: 'textarea', rows: 4 },
    { name: 'order', label: 'Display order', type: 'number', half: true, help: 'Lower numbers show first' },
    published,
  ],
};

export const noticesCfg = {
  title: 'Notices', singular: 'Notice', endpoint: '/notices', titleKey: 'title',
  defaults: { category: 'notice', isPublished: true },
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Type' },
    { key: 'createdAt', label: 'Posted', type: 'date' },
    { key: 'isPublished', label: 'Visibility', type: 'bool' },
  ],
  fields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'category', label: 'Type', type: 'select', required: true, options: [['notice', 'Notice'], ['news', 'News'], ['circular', 'Circular'], ['download', 'Download']], half: true },
    { name: 'body', label: 'Details', type: 'textarea', rows: 5 },
    { name: 'attachment.url', label: 'File link', placeholder: 'https://drive.google.com/…', half: true, help: 'Upload the PDF to Google Drive and paste the share link' },
    { name: 'attachment.name', label: 'File name', half: true },
    { name: 'pinned', label: 'Pin to the top', type: 'checkbox' },
    published,
  ],
};

export const testimonialsCfg = {
  title: 'Testimonials', singular: 'Testimonial', endpoint: '/testimonials', titleKey: 'name',
  defaults: { isPublished: true },
  columns: [{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role' }, { key: 'isPublished', label: 'Visibility', type: 'bool' }],
  fields: [
    { name: 'photo', label: 'Photo', type: 'image', folder: 'misc' },
    { name: 'name', label: 'Name', required: true, half: true },
    { name: 'role', label: 'Role', half: true, placeholder: 'Volunteer, TE Computer' },
    { name: 'quote', label: 'Quote', type: 'textarea', rows: 4, required: true },
    published,
  ],
};

export { BLOOD_GROUPS };
