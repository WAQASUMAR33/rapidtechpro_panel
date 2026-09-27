import { Suspense } from 'react';
import AdminDashboard from './dashboard';

function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0B132B] flex flex-col items-center justify-center relative overflow-hidden text-white font-sans">
      {/* Top glowing loading bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-900 overflow-hidden z-50">
        <div className="animate-progress-primary bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300 h-full w-full shadow-[0_0_12px_rgba(20,184,166,0.9)]" />
        <div className="animate-progress-secondary bg-gradient-to-r from-cyan-300 via-teal-400 to-emerald-400 h-full w-full" />
      </div>

      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Centered Loading Card */}
      <div className="relative z-10 w-full max-w-sm mx-auto p-8 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-xl text-center space-y-6">
        {/* Logo with breathing halo */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-teal-500/30 blur-md animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-xl flex items-center justify-center">
            <img
              src="https://rapidtechpro.com/company/logo.png"
              alt="RapidTechPro"
              className="w-full h-full object-contain rounded-xl bg-white p-2"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white">RapidTechPro</h2>
          <p className="text-xs text-teal-400 font-semibold tracking-wider uppercase mt-1">
            Admin Suite v2.0
          </p>
        </div>

        {/* High-tech animated progress bar */}
        <div className="space-y-2">
          <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="animate-progress-primary bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300 rounded-full h-full w-full shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            <div className="animate-progress-secondary bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 rounded-full h-full w-full" />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium px-1">
            <span>Loading workspace</span>
            <span className="text-teal-400 animate-pulse">Connecting...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}
