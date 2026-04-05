import React from 'react';

export default function SketchyPlaceholder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="sketchy">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" filter="url(#sketchy)" />
      <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="2" filter="url(#sketchy)" />
      <line x1="90" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="2" filter="url(#sketchy)" />
    </svg>
  );
}
