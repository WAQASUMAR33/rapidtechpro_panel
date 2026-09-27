'use client';

import React from 'react';

interface SectionLoadingBarProps {
  title?: string;
  subtitle?: string;
}

export default function SectionLoadingBar({
  title = 'Loading data...',
  subtitle = 'Fetching latest records from server',
}: SectionLoadingBarProps) {
  return (
    <div className="w-full py-12 px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center space-y-4">
        {/* Pulsing indicator icon */}
        <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-xs">
          <svg className="w-6 h-6 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* High-tech dual-wave indeterminate loading bar */}
        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="animate-progress-primary bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full h-full w-full" />
          <div className="animate-progress-secondary bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full h-full w-full" />
        </div>
      </div>
    </div>
  );
}
