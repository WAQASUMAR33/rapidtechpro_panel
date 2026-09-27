'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopProgressBar from '@/components/TopProgressBar';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Load remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('adminEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSuccess) return;

    setError('');
    setLoading(true);

    try {
      const loginData = {
        email: email.trim(),
        password: password,
      };

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026',
        },
        body: JSON.stringify(loginData),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid username or password. Please try again.');
        setLoading(false);
        return;
      }

      // Success
      setIsSuccess(true);
      if (rememberMe) {
        localStorage.setItem('adminEmail', email.trim());
      } else {
        localStorage.removeItem('adminEmail');
      }

      // Smooth redirection to dashboard
      setTimeout(() => {
        router.push('/admin');
      }, 600);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Unable to connect to authentication server. Please check your network.');
      setLoading(false);
    }
  };

  // Helper for quick-filling credentials (development convenience)
  const handleQuickFill = () => {
    setEmail('admin@company.com');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden font-sans antialiased text-slate-800 selection:bg-teal-500 selection:text-white">
      {/* Top Viewport Progress Bar during Auth */}
      <TopProgressBar isLoading={loading || isSuccess} />

      {/* ========================================================================= */}
      {/* LEFT SIDE: BRAND SHOWCASE & ATMOSPHERE */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B132B] relative flex-col justify-between p-12 lg:p-16 overflow-hidden border-r border-slate-800/80">
        {/* Ambient Glowing Blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Decorative Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top Header Logo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-xl shadow-teal-500/20">
            <img
              src="https://rapidtechpro.com/company/logo.png"
              alt="RapidTechPro"
              className="w-full h-full object-contain rounded-[14px] bg-white p-2"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">RapidTechPro</h1>
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Administrative Suite
            </p>
          </div>
        </div>

        {/* Centerpiece Hero Text & Capability Pills */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold">
              <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Enterprise Security · TLS 1.3 Encrypted
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Control your brand with precision & speed.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Experience the next generation admin console designed for high-performance portfolio curation, automated WebP image delivery, and service management.
            </p>
          </div>

          {/* Three Feature Highlights */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Instant CDN Sync</p>
                <p className="text-slate-400">Automated WebP asset conversion and CDN hosting</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-bold text-white">Multi-Layered Authentication</p>
                <p className="text-slate-400">Environment backup authorization & bcrypt protection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800/80">
          <span>RapidTechPro Platform v2.0</span>
          <span className="flex items-center gap-1.5 text-teal-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Database Systems Online
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE: AUTHENTICATION FORM */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-gradient-to-b from-slate-900 to-slate-950 relative">
        {/* Subtle Background Glow for Form Side */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-8 relative z-10">
          {/* Mobile Header */}
          <div className="lg:hidden text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-xl shadow-teal-500/20">
              <img
                src="https://rapidtechpro.com/company/logo.png"
                alt="RapidTechPro"
                className="w-full h-full object-contain rounded-[14px] bg-white p-2"
              />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">RapidTechPro</h2>
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Admin Portal</p>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Enter your administrative credentials to access your control center.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-shake">
                <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">{error}</div>
                <button
                  type="button"
                  onClick={() => setError('')}
                  className="text-rose-400 hover:text-rose-200 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Success Notification */}
            {isSuccess && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs sm:text-sm flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                <span>Verification successful! Redirecting to workspace...</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Admin Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    required
                    disabled={loading || isSuccess}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400">Protected</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading || isSuccess}
                    className="w-full pl-11 pr-11 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition disabled:opacity-50"
                  />
                  {/* Show/Hide Password Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 bg-slate-800 border-slate-700 focus:ring-teal-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <span className="text-slate-300 font-medium">Remember my session</span>
                </label>

                {/* Quick autofill helper */}
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
                >
                  Fill default
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isSuccess}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:from-teal-300 hover:to-emerald-400 shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <svg className="w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Entering Console...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Support Link */}
            <div className="pt-2 text-center border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Trouble logging in?{' '}
                <a
                  href="https://rapidtechpro.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-400 hover:text-teal-300 font-semibold hover:underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
