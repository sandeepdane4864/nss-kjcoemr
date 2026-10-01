
import { initials } from '../lib/format.js';

const TINTS = [
  '#1B2F7A',
  '#B3122D',
  '#0E6E8C',
  '#1F6B45',
  '#6B3FA0',
  '#B25E09',
];

const tint = (name = '') =>
  TINTS[
    [...name].reduce((total, char) => total + char.charCodeAt(0), 0) %
      TINTS.length
  ];

export default function Avatar({
  name = 'User',
  src,
  size = 56,
  square = false,
}) {
  const style = {
    width: size,
    height: size,
    minWidth: size,
    borderRadius: square ? 14 : '50%',
    objectFit: 'cover',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  if (src) {
    return (
      <img
        className="avatar"
        style={style}
        src={src}
        alt={`${name} avatar`}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <span
      className="avatar avatar-fallback"
      style={{
        ...style,
        background: tint(name),
        color: '#ffffff',
        fontSize: size * 0.36,
        fontWeight: 700,
      }}
      role="img"
      aria-label={`${name} avatar`}
    >
      {initials(name) || 'U'}
    </span>
  );
}