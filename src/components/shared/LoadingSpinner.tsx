
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  size?: number; // outer square size in px (default 120)
  strokeWidth?: number; // spinner stroke width (default 6)
  label?: string;
  className?: string;
};

export default function LoadingSpinner({ size = 120, strokeWidth = 6, label, className }: Props) {
  const half = size / 2;
  const radius = half - strokeWidth; // for the svg circle
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[120px] gap-4", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {/* Rounded square (inverted square look) */}
        <div
          className="absolute inset-0 rounded-2xl"
        />

        {/* Spinning red circle (SVG) */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10 spinner-group"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#e50914" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff4b4b" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* background faint ring */}
          <circle
            cx={half}
            cy={half}
            r={radius}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* animated arc (partial circle) */}
          <g style={{ transformOrigin: 'center' }}>
            <circle
              cx={half}
              cy={half}
              r={radius}
              stroke="url(#g1)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${circumference * 0.3} ${circumference}`}
              strokeDashoffset={0}
              className="spinner-arc"
              style={{
                 // @ts-ignore
                "--circumference": circumference
              }}
            />
          </g>
        </svg>

        {/* subtle center dot like Netflix sometimes has */}
        <div
          className="absolute z-20 rounded-full"
          style={{ width: Math.max(6, strokeWidth), height: Math.max(6, strokeWidth), background: '#e50914' }}
        />
      </div>

      {label ? (
        <div className="text-sm text-gray-300/90 select-none">{label}</div>
      ) : null}
    </div>
  );
}
