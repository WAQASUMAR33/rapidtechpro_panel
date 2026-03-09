'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginData = {
        email: email,
        password: password
      };

      console.log('Sending login request with:', loginData);

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-api-key': 'rapidtech_secret_key_2026'
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.log('Error response:', errorData);
        setError(errorData.message || `Login failed with status ${res.status}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('Login successful:', data);

      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      }

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Brand Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-teal-600-600 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute top-0 right-0 w-96 h-96" viewBox="0 0 200 200">
            <circle cx="100" cy="50" r="80" fill="currentColor" className="text-teal-700" />
          </svg>
        </div>
        <div className="relative text-white text-center z-10 px-8">
          <img
            src="https://rapidtechpro.com/company/logo.png"
            alt="RapidTechPro Logo"
            className="w-32 h-32 mx-auto mb-6 object-contain"
          />
          <h1 className="text-5xl font-bold mb-4">RapidTechPro</h1>
          <p className="text-lg opacity-90">Manage your company's content with ease</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden text-center">
            <img
              src="https://rapidtechpro.com/company/logo.png"
              alt="RapidTechPro Logo"
              className="w-24 h-24 mx-auto mb-4 object-contain"
            />
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to access the admin panel</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>
            <p className="text-gray-600 mt-2">Enter your credentials to access the admin panel</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">User Name</label>
              <input
                type="email"
                placeholder="username@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-gray-900"
                required
                disabled={loading}
              />
            </div>

            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-gray-700 text-sm">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white font-semibold py-3 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have admin access?{' '}
              <a href="#" className="text-teal-600 font-medium hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


