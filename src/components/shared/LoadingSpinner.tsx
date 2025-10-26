"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  fullscreen?: boolean; // optional: center overlay across screen
};

export default function LoadingSpinner({
  size = 120,
  strokeWidth = 6,
  label,
  className,
  fullscreen = false,
}: Props) {
  const half = size / 2;
  const radius = half - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn(
        fullscreen
          ? "fixed inset-0 z-[999] flex items-center justify-center bg-transparent backdrop-blur-[2px]"
          : "flex flex-col items-center justify-center min-h-[120px]",
        "gap-4 animate-fade-in",
        className
      )}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {/* faint red glow */}
        <div
          className="absolute inset-0 rounded-full bg-[#e50914]/10 blur-lg animate-pulse"
        />

        {/* spinning red arc */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="relative z-10 animate-spin-smooth"
        >
          <defs>
            <linearGradient id="netflixGradient" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#e50914" />
              <stop offset="100%" stopColor="#b00610" />
            </linearGradient>
          </defs>

          {/* faint ring */}
          <circle
            cx={half}
            cy={half}
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* animated arc */}
          <circle
            cx={half}
            cy={half}
            r={radius}
            stroke="url(#netflixGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * 0.25} ${circumference}`}
            strokeDashoffset={0}
            className="animate-dash"
          />
        </svg>

        {/* center pulse */}
        <div
          className="absolute z-20 rounded-full bg-[#e50914] animate-ping-slow"
          style={{
            width: Math.max(6, strokeWidth),
            height: Math.max(6, strokeWidth),
          }}
        />
      </div>

      {label && (
        <div className="text-sm text-gray-300/90 select-none tracking-wide">
          {label}
        </div>
      )}

      <style jsx>{`
        @keyframes spin-smooth {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
          0% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: -${circumference * 0.3};
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-spin-smooth {
          animation: spin-smooth 1.2s cubic-bezier(0.4, 0.2, 0.2, 1) infinite;
        }
        .animate-dash {
          animation: dash 1.6s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 1.8s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
