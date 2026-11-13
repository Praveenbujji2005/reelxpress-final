'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotice(null);
    setError(null);

    try {
      const res = await resetPassword(email);
      setNotice(res.message || 'Password reset link sent! Check your inbox.');
    } catch (err) {
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a0c] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/admin/login" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1c171c] border border-[#F28C3C]/50 flex items-center justify-center p-2.5 shadow-[0_0_25px_rgba(242,140,60,0.35)]">
              <img src="/brand/icon-gold.png" alt="ReelXpress" className="w-full h-full object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Reset Admin Password</h1>
          <p className="text-sm text-text-muted mt-1.5">
            Enter your authorized email to receive recovery instructions.
          </p>
        </div>

        <div className="rounded-3xl bg-[#151215]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-xl">
          {notice && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-emerald-400 text-lg shrink-0 mt-0.5">
                check_circle
              </span>
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-sm flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-400 text-lg shrink-0 mt-0.5">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                Administrator Email Address*
              </label>
              <input
                type="email"
                required
                placeholder="admin@reelxpress.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white placeholder:text-text-muted/40 focus:border-[#F28C3C] focus:outline-none focus:ring-2 focus:ring-[#F28C3C]/40 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-[#F28C3C] hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
