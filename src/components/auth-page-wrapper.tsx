'use client';

import React, { ReactNode } from 'react';

interface AuthPageWrapperProps {
  children: ReactNode;
}

export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* SVG Background - Renders once and persists across auth pages */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1200" height="800" fill="url(#bgGradient)" />

        <circle cx="200" cy="100" r="150" fill="#60a5fa" opacity="0.3" filter="url(#blur)">
          <animate attributeName="cx" from="200" to="250" dur="8s" repeatCount="indefinite" />
          <animate attributeName="cy" from="100" to="150" dur="8s" repeatCount="indefinite" />
        </circle>

        <circle cx="1000" cy="700" r="200" fill="#93c5fd" opacity="0.25" filter="url(#blur)">
          <animate attributeName="cx" from="1000" to="950" dur="10s" repeatCount="indefinite" />
          <animate attributeName="cy" from="700" to="650" dur="10s" repeatCount="indefinite" />
        </circle>

        <circle cx="600" cy="400" r="180" fill="#3b82f6" opacity="0.2" filter="url(#blur)">
          <animate attributeName="r" from="180" to="220" dur="6s" repeatCount="indefinite" />
        </circle>

        <circle cx="100" cy="600" r="120" fill="#60a5fa" opacity="0.2" filter="url(#blur)">
          <animate attributeName="cx" from="100" to="150" dur="7s" repeatCount="indefinite" />
        </circle>

        {/* Additional animated circles */}
        <circle cx="150" cy="750" r="100" fill="#93c5fd" opacity="0.15" filter="url(#blur)">
          <animate attributeName="cy" from="750" to="700" dur="9s" repeatCount="indefinite" />
          <animate attributeName="r" from="100" to="140" dur="9s" repeatCount="indefinite" />
        </circle>

        <circle cx="1100" cy="200" r="130" fill="#60a5fa" opacity="0.2" filter="url(#blur)">
          <animate attributeName="cx" from="1100" to="1050" dur="11s" repeatCount="indefinite" />
          <animate attributeName="cy" from="200" to="250" dur="11s" repeatCount="indefinite" />
        </circle>

        <circle cx="800" cy="100" r="90" fill="#3b82f6" opacity="0.25" filter="url(#blur)">
          <animate attributeName="r" from="90" to="140" dur="8s" repeatCount="indefinite" />
          <animate attributeName="cx" from="800" to="850" dur="12s" repeatCount="indefinite" />
        </circle>

        {/* Extended animation circles for longer cycle */}
        <circle cx="400" cy="150" r="110" fill="#93c5fd" opacity="0.18" filter="url(#blur)">
          <animate attributeName="cx" from="400" to="450" dur="14s" repeatCount="indefinite" />
          <animate attributeName="cy" from="150" to="200" dur="14s" repeatCount="indefinite" />
          <animate attributeName="r" from="110" to="160" dur="14s" repeatCount="indefinite" />
        </circle>

        <circle cx="950" cy="500" r="140" fill="#60a5fa" opacity="0.15" filter="url(#blur)">
          <animate attributeName="cx" from="950" to="900" dur="16s" repeatCount="indefinite" />
          <animate attributeName="r" from="140" to="190" dur="16s" repeatCount="indefinite" />
        </circle>

        <circle cx="300" cy="500" r="95" fill="#3b82f6" opacity="0.2" filter="url(#blur)">
          <animate attributeName="cy" from="500" to="450" dur="15s" repeatCount="indefinite" />
          <animate attributeName="cx" from="300" to="350" dur="15s" repeatCount="indefinite" />
        </circle>

        <circle cx="1050" cy="750" r="120" fill="#93c5fd" opacity="0.17" filter="url(#blur)">
          <animate attributeName="cx" from="1050" to="1000" dur="18s" repeatCount="indefinite" />
          <animate attributeName="cy" from="750" to="700" dur="18s" repeatCount="indefinite" />
          <animate attributeName="r" from="120" to="170" dur="18s" repeatCount="indefinite" />
        </circle>

        <circle cx="500" cy="650" r="130" fill="#60a5fa" opacity="0.16" filter="url(#blur)">
          <animate attributeName="r" from="130" to="180" dur="17s" repeatCount="indefinite" />
          <animate attributeName="cy" from="650" to="600" dur="17s" repeatCount="indefinite" />
        </circle>

        <circle cx="200" cy="300" r="100" fill="#93c5fd" opacity="0.19" filter="url(#blur)">
          <animate attributeName="cx" from="200" to="250" dur="20s" repeatCount="indefinite" />
          <animate attributeName="r" from="100" to="150" dur="20s" repeatCount="indefinite" />
        </circle>

        {/* Decorative shapes */}
        <path
          d="M 1200 0 Q 1100 100, 1050 200 T 1000 400"
          stroke="#60a5fa"
          strokeWidth="2"
          fill="none"
          opacity="0.3"
        >
          <animate attributeName="d" 
            from="M 1200 0 Q 1100 100, 1050 200 T 1000 400"
            to="M 1200 0 Q 1100 150, 1050 250 T 1000 450"
            dur="5s"
            repeatCount="indefinite"
          />
        </path>

        <g opacity="0.05" strokeWidth="1" stroke="#ffffff">
          <line x1="0" y1="0" x2="1200" y2="0" />
          <line x1="0" y1="100" x2="1200" y2="100" />
          <line x1="0" y1="200" x2="1200" y2="200" />
          <line x1="0" y1="300" x2="1200" y2="300" />
          <line x1="0" y1="400" x2="1200" y2="400" />
          <line x1="0" y1="500" x2="1200" y2="500" />
          <line x1="0" y1="600" x2="1200" y2="600" />
          <line x1="0" y1="700" x2="1200" y2="700" />
          <line x1="0" y1="800" x2="1200" y2="800" />
          <line x1="0" y1="0" x2="0" y2="800" />
          <line x1="150" y1="0" x2="150" y2="800" />
          <line x1="300" y1="0" x2="300" y2="800" />
          <line x1="450" y1="0" x2="450" y2="800" />
          <line x1="600" y1="0" x2="600" y2="800" />
          <line x1="750" y1="0" x2="750" y2="800" />
          <line x1="900" y1="0" x2="900" y2="800" />
          <line x1="1050" y1="0" x2="1050" y2="800" />
          <line x1="1200" y1="0" x2="1200" y2="800" />
        </g>
      </svg>

      {/* Content overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  );
}
