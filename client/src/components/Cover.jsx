import { Droplets, TreePine, Recycle, Megaphone, Tent, HeartPulse, GraduationCap, Music, Sparkles } from 'lucide-react';
import Wheel from './Wheel.jsx';
import { catColor } from '../constants.js';

const ICONS = { 'blood-donation': Droplets, plantation: TreePine, cleanliness: Recycle, awareness: Megaphone, camp: Tent, health: HeartPulse, education: GraduationCap, cultural: Music, other: Sparkles };

// Photo when available, otherwise a branded fallback tinted by category.
export default function Cover({ src, alt = '', category = 'other', className = '' }) {
  if (src) return <img className={`cover ${className}`} src={src} alt={alt} loading="lazy" />;
  const Icon = ICONS[category] || Sparkles;
  return (
    <div className={`cover cover-fallback ${className}`} style={{ background: catColor(category) }} role="img" aria-label={alt || 'NSS event'}>
      <Wheel className="cover-wheel" ring="#fff" accent="#fff" paper="transparent" />
      <Icon size={30} strokeWidth={1.6} />
    </div>
  );
}
