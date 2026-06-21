
export function ClientraIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="b0" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.25"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
        <linearGradient id="b1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c4b5fd"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>
        <filter id="bf"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx="80" cy="80" r="66" fill="url(#b0)"/>
      <path d="M 118 50 A 46 46 0 1 0 118 110" stroke="url(#b1)" stroke-width="7.5" stroke-linecap="round" fill="none" filter="url(#bf)"/>
      <ellipse cx="80" cy="80" rx="62" ry="22" stroke="#8b5cf6" stroke-opacity="0.28" stroke-width="1" fill="none" transform="rotate(-22 80 80)"/>
      <circle cx="122" cy="56" r="7.5" fill="#c4b5fd" filter="url(#bf)"/>
      <circle cx="80" cy="80" r="3.5" fill="#8b5cf6" fill-opacity="0.55"/>
    </svg>
  );
}
