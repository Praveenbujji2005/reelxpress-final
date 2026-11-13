'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading, lockoutUntil } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If already logged in, redirect straight to admin dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/admin');
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err) {
      setErrorMessage(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('admin@reelxpress.com');
    setPassword('ReelXpress@Admin2026!');
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login('admin@reelxpress.com', 'ReelXpress@Admin2026!');
      router.push('/admin');
    } catch (err) {
      setErrorMessage(err?.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLocked = lockoutUntil && Date.now() < lockoutUntil;

  return (
    <div className="min-h-screen bg-[#0c0a0c] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Background Radial Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#F28C3C]/15 via-[#DC6A2C]/08 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="w-full max-w-md">
        {/* Logo & Headline */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1c171c] border border-[#F28C3C]/50 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(242,140,60,0.35)] group-hover:scale-105 transition-transform">
              <img src="/brand/icon-gold.png" alt="ReelXpress" className="w-full h-full object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-sm text-text-muted mt-1.5">
            Secure access to reelXpress content, pricing &amp; inquiries.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl bg-[#151215]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-red-400 text-lg shrink-0 mt-0.5">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {isLocked && (
            <div className="mb-5 p-4 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-400 text-lg shrink-0 mt-0.5">
                lock_clock
              </span>
              <span>Security Lockout: Too many failed attempts. Try again later.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                Admin Email / Username*
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={isLocked || isSubmitting}
                  placeholder="admin@reelxpress.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white placeholder:text-text-muted/40 focus:border-[#F28C3C] focus:outline-none focus:ring-2 focus:ring-[#F28C3C]/40 text-sm transition-all"
                />
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                  mail
                </span>
              </div>
            </div>

            {/* Password with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted">
                  Password*
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-[#F28C3C] hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={isLocked || isSubmitting}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white placeholder:text-text-muted/40 focus:border-[#F28C3C] focus:outline-none focus:ring-2 focus:ring-[#F28C3C]/40 text-sm transition-all"
                />
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg">
                  lock
                </span>

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide Password' : 'Show Password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLocked || isSubmitting}
              className="btn-shine-sweep btn-ripple w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(242,140,60,0.5)] hover:shadow-[0_0_40px_rgba(242,140,60,0.85)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Dashboard →</span>
              )}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-text-muted mb-2.5">
              Testing credentials available: <span className="text-white font-mono">admin@reelxpress.com</span>
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white/90 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm text-[#F28C3C]">key</span>
              <span>1-Click Demo Admin Login</span>
            </button>
          </div>
        </div>

        {/* Return to Site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-text-muted hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
