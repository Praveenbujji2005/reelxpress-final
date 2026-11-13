'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { getInquiries } from '@/lib/inquiries';

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [newCreatorsCount, setNewCreatorsCount] = useState(0);

  const isAuthPage =
    pathname === '/admin/login' || pathname === '/admin/forgot-password';

  // Fetch count of new inquiries & creator queries for sidebar badges
  useEffect(() => {
    if (isAuthenticated) {
      getInquiries({ status: 'new' })
        .then((items) => setNewInquiriesCount(items.length))
        .catch(() => {});

      fetch('/api/creators?status=new')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && typeof data.count === 'number') {
            setNewCreatorsCount(data.count);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, pathname]);

  // Route protection: redirect to login if unauthenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthPage) {
      router.push('/admin/login');
    }
  }, [loading, isAuthenticated, isAuthPage, router]);

  // If on login / forgot-password, render clean full-screen wrapper
  if (isAuthPage) {
    return <div className="min-h-screen bg-[#0c0a0c] text-white">{children}</div>;
  }

  // Loading spinner while verifying session
  if (loading || (!isAuthenticated && !isAuthPage)) {
    return (
      <div className="min-h-screen bg-[#0c0a0c] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-3 border-[#F28C3C] border-t-transparent animate-spin mb-4" />
        <p className="text-text-muted text-sm tracking-wide">Authenticating Admin Access...</p>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    {
      label: 'Booking Inquiries',
      href: '/admin/inquiries',
      icon: 'contact_page',
      badge: newInquiriesCount > 0 ? newInquiriesCount : null,
    },
    {
      label: 'Creator Queries',
      href: '/admin/creators',
      icon: 'badge',
      badge: newCreatorsCount > 0 ? newCreatorsCount : null,
    },
    { label: 'Hero Carousel', href: '/admin/hero', icon: 'view_carousel' },
    { label: 'Pricing Plans', href: '/admin/pricing', icon: 'payments' },
    { label: 'FAQs', href: '/admin/faqs', icon: 'quiz' },
    { label: 'Testimonials', href: '/admin/testimonials', icon: 'reviews' },
    { label: 'Activity Log', href: '/admin/activity', icon: 'history' },
  ];

  return (
    <div className="min-h-screen bg-[#0c0a0c] text-white flex flex-col md:flex-row font-sans selection:bg-[#F28C3C] selection:text-white">
      {/* =========================================================================
          DESKTOP SIDEBAR (Fixed Left Column)
         ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#120f12] border-r border-white/10 shrink-0 sticky top-0 h-screen select-none z-40">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1c171c] border border-[#F28C3C]/40 flex items-center justify-center p-2 shadow-[0_0_15px_rgba(242,140,60,0.25)] group-hover:border-[#F28C3C] transition-all">
              <img
                src="/brand/icon-gold.png"
                alt="ReelXpress"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                <span>reelXpress</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F28C3C]/20 text-[#F28C3C] border border-[#F28C3C]/40">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-text-muted">Cloud Content CMS</p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white shadow-[0_0_20px_rgba(242,140,60,0.4)]'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#DC6A2C] shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">
                  open_in_new
                </span>
                <span>View Live Site</span>
              </div>
              <span className="text-xs text-text-muted">↗</span>
            </Link>
          </div>
        </nav>

        {/* Admin User Footer & Sign Out */}
        <div className="p-4 border-t border-white/10 bg-[#0e0b0e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#F28C3C]/20 border border-[#F28C3C]/40 flex items-center justify-center text-[#F28C3C] font-bold text-sm shrink-0">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.displayName || 'Administrator'}
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  {user?.email || 'admin@reelxpress.com'}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE TOP NAVBAR & DRAWER
         ========================================================================= */}
      <header className="md:hidden sticky top-0 z-50 bg-[#120f12]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1c171c] border border-[#F28C3C]/40 flex items-center justify-center p-1.5">
            <img src="/brand/icon-gold.png" alt="ReelXpress" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-sm text-white">reelXpress Admin</span>
        </div>

        <div className="flex items-center gap-2">
          {newInquiriesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F28C3C] text-white">
              {newInquiriesCount} new
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-[#120f12] p-5 flex flex-col justify-between overflow-y-auto animate-fadeIn">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-[#DC6A2C]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-white/60"
            >
              <span>View Live Website</span>
              <span className="material-symbols-outlined">open_in_new</span>
            </Link>
          </nav>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-text-muted">{user?.email}</span>
            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 text-sm font-semibold flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN ADMIN CONTENT VIEWPORT
         ========================================================================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
