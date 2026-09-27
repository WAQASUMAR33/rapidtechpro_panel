'use client';

import React, { useEffect, useState } from 'react';

interface TopProgressBarProps {
  isLoading: boolean;
}

export default function TopProgressBar({ isLoading }: TopProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let finishTimer: NodeJS.Timeout;

    if (isLoading) {
      setVisible(true);
      setProgress(15);

      // Simulate quick natural progress
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            return prev;
          }
          const diff = Math.max(1, (90 - prev) * 0.2);
          return Math.min(88, prev + diff);
        });
      }, 150);
    } else if (visible) {
      // Complete to 100% and fade out
      setProgress(100);
      finishTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(finishTimer);
    };
  }, [isLoading, visible]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none overflow-hidden">
      {/* Background track */}
      <div className="absolute inset-0 bg-teal-500/10" />

      {/* Primary animated progress bar */}
      <div
        className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(20,184,166,0.8)] transition-all duration-300 ease-out relative"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? 'width 200ms ease-out, opacity 400ms ease-in' : 'width 300ms ease-out',
        }}
      >
        {/* Leading edge glow effect */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-300/60 blur-xs" />
      </div>

      {/* Shimmer light bar */}
      {isLoading && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-progress-primary bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full opacity-60" />
        </div>
      )}
    </div>
  );
}
