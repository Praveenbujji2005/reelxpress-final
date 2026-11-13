'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeToEnquiries, getEnquiriesFromFirestore } from '@/lib/enquiries';
import {
  getHeroSlides,
  getPricingPlans,
  getFaqs,
  getTestimonials,
  getActivityLogs,
} from '@/lib/cmsServices';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminDashboardPage() {
  const { user } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInquiries: 0,
    newInquiries: 0,
    totalCreators: 0,
    newCreators: 0,
    totalSlides: 0,
    totalPlans: 0,
    totalFaqs: 0,
    totalTestimonials: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [recentCreators, setRecentCreators] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    async function loadCMSData() {
      try {
        const [
          slidesRes,
          plansRes,
          faqsRes,
          testimonialsRes,
          logsRes,
        ] = await Promise.allSettled([
          getHeroSlides(),
          getPricingPlans(),
          getFaqs(),
          getTestimonials(),
          getActivityLogs(),
        ]);

        const slides = slidesRes.status === 'fulfilled' && Array.isArray(slidesRes.value) ? slidesRes.value : [];
        const plans = plansRes.status === 'fulfilled' && Array.isArray(plansRes.value) ? plansRes.value : [];
        const faqs = faqsRes.status === 'fulfilled' && Array.isArray(faqsRes.value) ? faqsRes.value : [];
        const testimonials = testimonialsRes.status === 'fulfilled' && Array.isArray(testimonialsRes.value) ? testimonialsRes.value : [];
        const logs = logsRes.status === 'fulfilled' && Array.isArray(logsRes.value) ? logsRes.value : [];

        setStats((prev) => ({
          ...prev,
          totalSlides: slides.length,
          totalPlans: plans.length,
          totalFaqs: faqs.length,
          totalTestimonials: testimonials.length,
        }));

        setActivityLogs(logs.slice(0, 6));
      } catch (err) {
        console.error('CMS load error:', err);
      } finally {
        setLoading(false);
      }

      // Fetch creator queries for dashboard stats
      try {
        const creatorRes = await fetch('/api/creators');
        const creatorData = await creatorRes.json();
        if (creatorData.success && Array.isArray(creatorData.creatorQueries)) {
          const list = creatorData.creatorQueries;
          const newCount = list.filter((c) => (c.status || '').toLowerCase() === 'new').length;
          setStats((prev) => ({
            ...prev,
            totalCreators: list.length,
            newCreators: newCount,
          }));
          setRecentCreators(list.slice(0, 5));
        }
      } catch (err) {
        console.warn('Dashboard creator queries fetch notice:', err);
      }
    }

    loadCMSData();

    // Real-time listener for enquiries
    const unsubscribe = subscribeToEnquiries({
      onData: (enquiries) => {
        const newCount = enquiries.filter((i) => (i.status || '').toLowerCase() === 'new').length;
        setStats((prev) => ({
          ...prev,
          totalInquiries: enquiries.length,
          newInquiries: newCount,
        }));
        setRecentInquiries(enquiries.slice(0, 5));
      },
      onError: (err) => {
        console.warn('[Dashboard] Real-time listener notice:', err?.message);
        // Fallback fetch
        getEnquiriesFromFirestore()
          .then((list) => {
            if (Array.isArray(list)) {
              const newCount = list.filter((i) => (i.status || '').toLowerCase() === 'new').length;
              setStats((prev) => ({
                ...prev,
                totalInquiries: list.length,
                newInquiries: newCount,
              }));
              setRecentInquiries(list.slice(0, 5));
            }
          })
          .catch(() => {});
      },
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-3 border-[#F28C3C] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-text-muted">Loading CMS metrics &amp; enquiries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F28C3C]/15 border border-[#F28C3C]/30 text-[#F28C3C] text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F28C3C] animate-pulse" />
            <span>Live Cloud CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Welcome back, <span className="text-white font-semibold">{user?.displayName || 'Administrator'}</span>. Here is your website summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/inquiries"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(242,140,60,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">mark_email_unread</span>
            <span>View Inquiries ({stats.newInquiries} New)</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-medium text-sm transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span>Live Site</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          KEY STATS CARDS
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Total Customer Inquiries */}
        <Link
          href="/admin/inquiries"
          className="rounded-2xl p-5 bg-[#151215] border border-white/10 hover:border-[#F28C3C]/60 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Customer Enquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F28C3C]/20 text-[#F28C3C] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">inbox</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white group-hover:text-[#F28C3C] transition-colors tabular-nums">
            {stats.totalInquiries}
          </div>
          <div className="mt-2 text-xs text-text-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              <strong className="text-white">{stats.newInquiries}</strong> new
            </span>
          </div>
        </Link>

        {/* Creator Queries */}
        <Link
          href="/admin/creators"
          className="rounded-2xl p-5 bg-[#151215] border border-white/10 hover:border-emerald-500/60 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Creator Queries
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">badge</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white group-hover:text-emerald-400 transition-colors tabular-nums">
            {stats.totalCreators}
          </div>
          <div className="mt-2 text-xs text-text-muted flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              <strong className="text-white">{stats.newCreators}</strong> new applicants
            </span>
          </div>
        </Link>

        {/* Hero Reel Slides */}
        <Link
          href="/admin/hero"
          className="rounded-2xl p-5 bg-[#151215] border border-white/10 hover:border-amber-500/60 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Hero Reels
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">view_carousel</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white group-hover:text-amber-400 transition-colors tabular-nums">
            {stats.totalSlides}
          </div>
          <p className="mt-2 text-xs text-text-muted">Featured reels deck</p>
        </Link>

        {/* Pricing Plans */}
        <Link
          href="/admin/pricing"
          className="rounded-2xl p-5 bg-[#151215] border border-white/10 hover:border-[#F28C3C]/60 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Pricing Plans
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">sell</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white group-hover:text-emerald-400 transition-colors tabular-nums">
            {stats.totalPlans}
          </div>
          <p className="mt-2 text-xs text-text-muted">Instant &amp; Luxe tiers</p>
        </Link>

        {/* Testimonials & FAQs */}
        <Link
          href="/admin/testimonials"
          className="rounded-2xl p-5 bg-[#151215] border border-white/10 hover:border-purple-500/60 transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Reviews &amp; FAQs
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">reviews</span>
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white group-hover:text-purple-400 transition-colors tabular-nums">
            {stats.totalTestimonials + stats.totalFaqs}
          </div>
          <p className="mt-2 text-xs text-text-muted">
            {stats.totalTestimonials} reviews · {stats.totalFaqs} FAQs
          </p>
        </Link>
      </div>

      {/* =========================================================================
          RECENT INQUIRIES & ACTIVITY LOG
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Customer Enquiries & Creator Applications */}
        <div className="lg:col-span-8 space-y-6">
          {/* Customer Enquiries Card */}
          <div className="rounded-3xl bg-[#151215] border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Recent Customer Enquiries</span>
                {stats.newInquiries > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#F28C3C] text-white">
                    {stats.newInquiries} New
                  </span>
                )}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Submissions from the Booking &amp; Quick Contact forms in Firestore.
              </p>
            </div>

            <Link
              href="/admin/inquiries"
              className="text-xs text-[#F28C3C] hover:underline font-bold flex items-center gap-1"
            >
              <span>Manage All Enquiries</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {recentInquiries.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-sm border border-dashed border-white/10 rounded-2xl">
              No enquiries received yet. Submissions through the contact form will sync here in real time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-text-muted">
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Shoot Type</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(recentInquiries ?? []).map((inq, idx) => {
                    const st = (inq.status || 'New').toLowerCase();
                    const statusBadgeClass =
                      st === 'new'
                        ? 'bg-[#F28C3C]/20 text-[#F28C3C] border-[#F28C3C]/40'
                        : st === 'contacted'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                    const statusLabel =
                      st === 'completed' || st === 'resolved' ? 'COMPLETED' : st === 'contacted' ? 'CONTACTED' : 'NEW';

                    return (
                      <tr key={inq.id ?? `recent-inq-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pr-3">
                          <div className="font-bold text-white">{inq.customerName || inq.fullName}</div>
                          <div className="text-xs text-text-muted">{inq.phone}</div>
                        </td>
                        <td className="py-3.5 pr-3 text-xs text-white/90 max-w-[200px] truncate">
                          {inq.selectedService || inq.serviceType}
                        </td>
                        <td className="py-3.5 pr-3 text-xs text-text-muted whitespace-nowrap">
                          {inq.formattedDate || new Date(inq.createdAt || Date.now()).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadgeClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <Link
                            href="/admin/inquiries"
                            className="inline-flex items-center gap-1 text-xs text-[#F28C3C] hover:underline font-semibold"
                          >
                            <span>Details</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Creator Applications Card */}
        <div className="rounded-3xl bg-[#151215] border border-white/10 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Recent Creator Applications</span>
                {stats.newCreators > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-black">
                    {stats.newCreators} New
                  </span>
                )}
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Content creator queries and iPhone rig applicants from /creators.
              </p>
            </div>

            <Link
              href="/admin/creators"
              className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-1"
            >
              <span>Manage Creators</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {recentCreators.length === 0 ? (
            <div className="py-10 text-center text-text-muted text-sm border border-dashed border-white/10 rounded-2xl">
              No creator queries received yet. Creator applications from the website will automatically sync here in real time.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-text-muted">
                    <th className="pb-3 font-semibold">Creator</th>
                    <th className="pb-3 font-semibold">iPhone Device</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(recentCreators ?? []).map((creator, idx) => {
                    const st = (creator.status || 'New').toLowerCase();
                    const statusBadge =
                      st === 'new'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : st === 'approved'
                        ? 'bg-[#F28C3C]/20 text-[#F28C3C] border-[#F28C3C]/40'
                        : st === 'reviewing'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-white/10 text-white/70 border-white/20';

                    return (
                      <tr key={creator.id ?? `recent-creator-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pr-3">
                          <div className="font-bold text-white">{creator.fullName}</div>
                          <div className="text-xs text-text-muted font-mono">{creator.mobileNumber}</div>
                        </td>
                        <td className="py-3.5 pr-3 text-xs text-white">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            <span className="material-symbols-outlined text-xs text-[#F28C3C]">phone_iphone</span>
                            {creator.phoneModel}
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 text-xs text-text-muted">
                          {creator.cityArea || 'Bengaluru'}
                        </td>
                        <td className="py-3.5 pr-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                            {creator.status || 'NEW'}
                          </span>
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <Link
                            href="/admin/creators"
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline font-semibold"
                          >
                            <span>Review</span>
                            <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

        {/* Right Column (4 cols): Quick Links & Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel */}
          <div className="rounded-3xl bg-[#151215] border border-white/10 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Quick Management</h3>
            <div className="space-y-2">
              <Link
                href="/admin/inquiries"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-[#F28C3C]/15 border border-white/5 hover:border-[#F28C3C]/40 text-sm font-semibold text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#F28C3C] text-base">inbox</span>
                  <span>Customer Enquiries</span>
                </div>
                <span className="material-symbols-outlined text-xs text-text-muted group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </Link>

              <Link
                href="/admin/creators"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/40 text-sm font-semibold text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400 text-base">badge</span>
                  <span>Creator Applications</span>
                </div>
                <span className="material-symbols-outlined text-xs text-text-muted group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </Link>

              <Link
                href="/admin/hero"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-sm font-semibold text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-400 text-base">view_carousel</span>
                  <span>Update Hero Slides</span>
                </div>
                <span className="material-symbols-outlined text-xs text-text-muted group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </Link>

              <Link
                href="/admin/pricing"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-sm font-semibold text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-400 text-base">sell</span>
                  <span>Edit Pricing Tiers</span>
                </div>
                <span className="material-symbols-outlined text-xs text-text-muted group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </Link>

              <Link
                href="/admin/testimonials"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-sm font-semibold text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-purple-400 text-base">reviews</span>
                  <span>Manage Testimonials &amp; FAQs</span>
                </div>
                <span className="material-symbols-outlined text-xs text-text-muted group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </Link>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="rounded-3xl bg-[#151215] border border-white/10 p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Audit Trail</h3>
            {activityLogs.length === 0 ? (
              <p className="text-xs text-text-muted">No recent admin actions recorded.</p>
            ) : (
              <div className="space-y-3">
                {(activityLogs ?? []).map((log, idx) => (
                  <div key={log.id ?? `log-${idx}`} className="text-xs pb-3 border-b border-white/5 last:border-b-0">
                    <div className="text-white font-medium">{log.action}</div>
                    <div className="text-text-muted text-[11px] mt-0.5">
                      {log.userEmail} · {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
