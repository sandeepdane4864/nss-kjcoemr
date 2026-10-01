export const DEPARTMENTS = ['Computer Engineering', 'Information Technology', 'Civil Engineering', 'Mechanical Engineering', 'E&TC Engineering', 'First Year Engineering'];
export const YEARS = ['FE', 'SE', 'TE', 'BE'];
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// color = fallback cover tint for events without a photo
export const CATEGORIES = {
  'blood-donation': { label: 'Blood donation', color: '#B3122D' },
  plantation: { label: 'Plantation', color: '#1F6B45' },
  cleanliness: { label: 'Cleanliness', color: '#0E6E8C' },
  awareness: { label: 'Awareness', color: '#6B3FA0' },
  camp: { label: 'Camp', color: '#B25E09' },
  health: { label: 'Health', color: '#B3122D' },
  education: { label: 'Education', color: '#1B2F7A' },
  cultural: { label: 'Cultural', color: '#9A2B6B' },
  other: { label: 'Other', color: '#33427A' },
};
export const catLabel = (c) => CATEGORIES[c]?.label || 'Event';
export const catColor = (c) => CATEGORIES[c]?.color || '#33427A';
