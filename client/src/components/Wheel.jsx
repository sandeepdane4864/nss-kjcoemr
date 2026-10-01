
export default function Wheel({
  className = '',
  ring = 'currentColor',
  accent = 'var(--red)',
  paper = 'var(--paper)',
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NSS eight-spoke wheel emblem"
      focusable="false"
    >
      {/* Outer ring */}
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke={ring}
        strokeWidth="9"
      />

      {/* Inner dotted ring */}
      <circle
        cx="100"
        cy="100"
        r="77"
        fill="none"
        stroke={ring}
        strokeWidth="1.5"
        strokeDasharray="1.5 5.5"
        strokeLinecap="round"
      />

      {/* Eight spokes */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 45} 100 100)`}>
          <path
            d="M100 100V22"
            stroke={ring}
            strokeWidth="7"
            strokeLinecap="round"
          />

          <circle
            cx="100"
            cy="34"
            r="5.5"
            fill={accent}
          />

          <path
            d="M100 46 L107 64 L93 64 Z"
            fill={ring}
            transform="rotate(22.5 100 100)"
          />
        </g>
      ))}

      {/* Center */}
      <circle cx="100" cy="100" r="21" fill={accent} />
      <circle cx="100" cy="100" r="8" fill={paper} />
    </svg>
  );
}