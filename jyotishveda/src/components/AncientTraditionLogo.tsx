import React from 'react';

interface AncientTraditionLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isLight?: boolean;
}

export const AncientTraditionLogo: React.FC<AncientTraditionLogoProps> = ({
  size = 'md',
  className = '',
  isLight = false,
}) => {
  const sizeDimensions = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dim = sizeDimensions[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl p-1.5 transition-transform duration-300 hover:scale-105 ${
        isLight
          ? 'bg-gradient-to-br from-[#FAF5EC] to-[#E8DCBE] border border-[#C9A050]/40 shadow-md shadow-[#C9A050]/10'
          : 'bg-gradient-to-br from-[#1E1B15] to-[#121114] border border-[#C9A050]/40 shadow-lg shadow-black/40'
      } ${dim} ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAD292" />
            <stop offset="50%" stopColor="#C9A050" />
            <stop offset="100%" stopColor="#966C23" />
          </linearGradient>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EAD292" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C9A050" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer Astrolabe / Celestial Ring */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          strokeDasharray="3 3"
          opacity="0.75"
        />
        
        {/* Solid Inner Ephemeris Boundary */}
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#goldGradient)"
          strokeWidth="1.5"
          opacity="0.9"
        />

        {/* 8 Cardinal & Intercardinal Astrological Directional Markers */}
        <line x1="50" y1="5" x2="50" y2="12" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="88" x2="50" y2="95" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="5" y1="50" x2="12" y2="50" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="88" y1="50" x2="95" y2="50" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round" />
        
        <circle cx="21" cy="21" r="1.8" fill="url(#goldGradient)" />
        <circle cx="79" cy="21" r="1.8" fill="url(#goldGradient)" />
        <circle cx="21" cy="79" r="1.8" fill="url(#goldGradient)" />
        <circle cx="79" cy="79" r="1.8" fill="url(#goldGradient)" />

        {/* Intersecting Celestial Ellipses (Ancient Planetary & Lunar Orbits) */}
        <ellipse
          cx="50"
          cy="50"
          rx="32"
          ry="14"
          stroke="url(#orbitGradient)"
          strokeWidth="1.25"
          transform="rotate(30 50 50)"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="32"
          ry="14"
          stroke="url(#orbitGradient)"
          strokeWidth="1.25"
          transform="rotate(-30 50 50)"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="32"
          ry="14"
          stroke="url(#orbitGradient)"
          strokeWidth="1.25"
          transform="rotate(90 50 50)"
        />

        {/* Central 8-Pointed Ancient Astrological Star Nexus */}
        {/* Primary 4-pointed Star */}
        <polygon
          points="50,22 55,45 78,50 55,55 50,78 45,55 22,50 45,45"
          fill="url(#goldGradient)"
          opacity="0.95"
        />

        {/* Secondary 4-pointed Star (Diagonal 45-degree offset) */}
        <polygon
          points="50,30 53.5,46.5 70,50 53.5,53.5 50,70 46.5,53.5 30,50 46.5,46.5"
          fill="url(#goldGradient)"
          opacity="0.7"
        />

        {/* Central Luminosity Orb (Sun / Origin Nexus) */}
        <circle cx="50" cy="50" r="5" fill="#FFFDF8" />
        <circle cx="50" cy="50" r="2.5" fill="#8C6218" />
      </svg>
    </div>
  );
};
