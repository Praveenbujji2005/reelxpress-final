'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  subscribeToCreatorQueries,
  getCreatorQueriesFromFirestore,
} from '@/lib/creatorQueries';
import { useAdminAuth } from '@/context/AdminAuthContext';

const PAGE_SIZE = 12;

export default function AdminCreatorsPage() {
  const { user } = useAdminAuth();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected item for modal
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [creatorToDelete, setCreatorToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (selectedCreator || creatorToDelete) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        if (typeof window !== 'undefined' && window.lenis && typeof window.lenis.start === 'function') {
          window.lenis.start();
        }
      };
    }
  }, [selectedCreator, creatorToDelete]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const manualRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/creators');
      const data = await res.json();
      if (data.success && Array.isArray(data.creatorQueries)) {
        setCreators(data.creatorQueries);
        setErrorNotice(null);
        setIsConnected(true);
      } else {
        throw new Error(data.error || 'Failed to refresh.');
      }
    } catch (err) {
      console.error('Refresh error:', err);
      showToast(err.message || 'Refresh failed.');
    } finally {
      setLoading(false);
    }
  };

  // Real-time Firestore onSnapshot listener + fast API verification
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorNotice(null);

    // 1. Initial fast API fetch
    fetch('/api/creators')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!isMounted) return;
        if (!res.ok || !data.success) {
          setErrorNotice(data.error || 'Firestore database is not accessible.');
          setIsConnected(false);
          setLoading(false);
        } else if (Array.isArray(data.creatorQueries)) {
          setCreators(data.creatorQueries);
          setIsConnected(true);
          setErrorNotice(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('API creator queries check notice:', err);
      });

    // 2. Real-time Firestore push listener
    const unsubscribe = subscribeToCreatorQueries({
      onData: (data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setCreators(data);
          setIsConnected(true);
          setErrorNotice(null);
          setLoading(false);
        }
      },
      onError: (err) => {
        if (!isMounted) return;
        console.warn('[AdminCreators] Real-time listener notice:', err.message);
        getCreatorQueriesFromFirestore()
          .then((items) => {
            if (isMounted && Array.isArray(items)) {
              setCreators(items);
              setLoading(false);
            }
          })
          .catch(() => {
            if (isMounted) setLoading(false);
          });
      },
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filtered & Sorted creator queries
  const filteredCreators = useMemo(() => {
    let result = [...creators];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(
        (c) => (c.status || 'new').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((c) => {
        const name = (c.fullName || c.name || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const phone = (c.mobileNumber || c.phone || '').toLowerCase();
        const city = (c.cityArea || c.city || '').toLowerCase();
        const device = (c.phoneModel || c.device || '').toLowerCase();
        const insta = (c.instagramLink || '').toLowerCase();
        const reason = (c.reason || c.message || '').toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          device.includes(q) ||
          insta.includes(q) ||
          reason.includes(q)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [creators, statusFilter, search, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCreators.length / PAGE_SIZE) || 1;
  const paginatedCreators = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCreators.slice(start, start + PAGE_SIZE);
  }, [filteredCreators, currentPage]);

  // Metrics
  const metrics = useMemo(() => {
    const total = creators.length;
    const newCount = creators.filter((c) => (c.status || '').toLowerCase() === 'new').length;
    const reviewingCount = creators.filter((c) => (c.status || '').toLowerCase() === 'reviewing').length;
    const approvedCount = creators.filter((c) => (c.status || '').toLowerCase() === 'approved').length;
    return { total, newCount, reviewingCount, approvedCount };
  }, [creators]);

  // Handle status update
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/creators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus,
          adminEmail: user?.email || 'admin@reelxpress.com',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status.');
      }

      setCreators((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedCreator && selectedCreator.id === id) {
        setSelectedCreator((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Status updated to "${newStatus}".`);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!creatorToDelete) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/creators?id=${creatorToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete application.');
      }

      setCreators((prev) => prev.filter((c) => c.id !== creatorToDelete.id));
      if (selectedCreator?.id === creatorToDelete.id) {
        setSelectedCreator(null);
      }
      showToast('Creator application removed.');
      setCreatorToDelete(null);
    } catch (err) {
      alert('Error deleting application: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // WhatsApp quick contact link builder
  const getWhatsAppLink = (creator) => {
    const rawPhone = (creator.mobileNumber || creator.phone || '').replace(/\D/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const firstName = (creator.fullName || creator.name || 'Creator').split(' ')[0];
    const device = creator.phoneModel || creator.device || 'iPhone';
    const message = encodeURIComponent(
      `Hi ${firstName}! This is reelXpress Creator Onboarding. We received your creator application with your ${device}. We'd love to discuss scheduling a quick 20-min demo shoot in Bengaluru. Are you available this week?`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const getStatusBadge = (status) => {
    const s = (status || 'new').toLowerCase();
    switch (s) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            New
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Reviewing
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-[#F28C3C]/20 text-[#F28C3C] border border-[#F28C3C]/40">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            Approved
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <span className="material-symbols-outlined text-[12px]">chat</span>
            Contacted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/10 text-white/70">
            {status}
          </span>
        );
    }
  };

  const exportToCSV = () => {
    if (creators.length === 0) {
      alert('No creator applications to export.');
      return;
    }
    const headers = ['Full Name', 'Email', 'Mobile', 'City', 'Phone Model', 'Instagram', 'Status', 'Date', 'Reason'];
    const rows = creators.map((c) => [
      `"${c.fullName || ''}"`,
      `"${c.email || ''}"`,
      `"${c.mobileNumber || ''}"`,
      `"${c.cityArea || ''}"`,
      `"${c.phoneModel || ''}"`,
      `"${c.instagramLink || ''}"`,
      `"${c.status || ''}"`,
      `"${c.createdAt || ''}"`,
      `"${(c.reason || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reelxpress_creator_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100050] px-5 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-white text-sm shadow-2xl flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Creator Queries &amp; Applications
            </h1>
            {isConnected ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firebase Firestore Sync</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Local Cache / Connecting</span>
              </div>
            )}
          </div>
          <p className="text-sm text-text-muted mt-1.5">
            Review, approve, and contact content creator applicants in real-time from the website.
          </p>
          {errorNotice && (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-amber-400 text-base shrink-0">info</span>
              <span>{errorNotice}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={manualRefresh}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-border-specular text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#151215] border border-white/10">
          <div className="text-xs uppercase tracking-wider font-bold text-text-muted mb-1 flex items-center justify-between">
            <span>Total Applied</span>
            <span className="material-symbols-outlined text-base text-text-muted">groups</span>
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">{metrics.total}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#151215] border border-emerald-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-1 flex items-center justify-between">
            <span>New Unreviewed</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">{metrics.newCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#151215] border border-amber-500/30">
          <div className="text-xs uppercase tracking-wider font-bold text-amber-400 mb-1 flex items-center justify-between">
            <span>Under Review</span>
            <span className="material-symbols-outlined text-base text-amber-400">hourglass_top</span>
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">{metrics.reviewingCount}</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#151215] border border-[#F28C3C]/40">
          <div className="text-xs uppercase tracking-wider font-bold text-[#F28C3C] mb-1 flex items-center justify-between">
            <span>Approved Creators</span>
            <span className="material-symbols-outlined text-base text-[#F28C3C]">verified</span>
          </div>
          <div className="text-3xl font-extrabold text-white tabular-nums">{metrics.approvedCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#151215] border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search by creator name, email, phone, city, or iPhone model..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white text-sm focus:border-[#F28C3C] focus:outline-none placeholder:text-white/40"
            />
          </div>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white text-sm focus:border-[#F28C3C] focus:outline-none"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
          </select>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider mr-2">Status:</span>
          {['all', 'new', 'reviewing', 'approved', 'contacted', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white shadow-md'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Creators Table / List */}
      {loading ? (
        <div className="p-16 rounded-3xl bg-[#151215] border border-white/10 text-center space-y-4">
          <div className="w-10 h-10 border-3 border-[#F28C3C] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-text-muted text-sm">Loading creator applications from Firebase Firestore...</p>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#151215] border border-dashed border-white/15 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-text-muted">
            <span className="material-symbols-outlined text-3xl">person_search</span>
          </div>
          <h3 className="text-lg font-bold text-white">No creator applications found</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search keywords or filter criteria.'
              : 'New applications submitted on /creators will automatically appear here in real-time.'}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-[#151215] border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1b171b] border-b border-white/10 text-xs uppercase font-extrabold text-text-muted tracking-wider">
                <tr>
                  <th className="py-4 px-6">Creator</th>
                  <th className="py-4 px-6">Device &amp; City</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Portfolio</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(paginatedCreators ?? []).map((creator, idx) => (
                  <tr
                    key={creator.id ?? `creator-${idx}`}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Creator Name & Initials */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F28C3C] to-[#FFD700] text-black font-extrabold flex items-center justify-center shrink-0 shadow-md">
                          {(creator.fullName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedCreator(creator)}
                            className="font-bold text-white hover:text-[#F28C3C] transition-colors truncate block text-left cursor-pointer"
                          >
                            {creator.fullName}
                          </button>
                          <span className="text-xs text-text-muted truncate block">
                            ID: {creator.id?.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Device & Location */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-semibold text-white">
                          <span className="material-symbols-outlined text-[13px] text-[#F28C3C]">phone_iphone</span>
                          {creator.phoneModel || creator.device || 'iPhone 13 Pro+'}
                        </span>
                        <div className="text-xs text-text-muted flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">location_on</span>
                          <span>{creator.cityArea || 'Bengaluru'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact (Phone & Email) */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-mono text-xs text-white">
                          <span>{creator.mobileNumber || creator.phone}</span>
                          <a
                            href={getWhatsAppLink(creator)}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Chat with ${creator.fullName} on WhatsApp`}
                            className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[12px]">chat</span>
                          </a>
                        </div>
                        <a
                          href={`mailto:${creator.email}`}
                          className="text-xs text-text-muted hover:text-white truncate block max-w-[200px]"
                        >
                          {creator.email}
                        </a>
                      </div>
                    </td>

                    {/* Instagram Link */}
                    <td className="py-4 px-6">
                      {creator.instagramLink ? (
                        <a
                          href={
                            creator.instagramLink.startsWith('http')
                              ? creator.instagramLink
                              : `https://instagram.com/${creator.instagramLink.replace('@', '')}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#F28C3C] hover:underline font-semibold"
                        >
                          <span>{creator.instagramLink}</span>
                          <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        </a>
                      ) : (
                        <span className="text-xs text-text-muted/60">—</span>
                      )}
                    </td>

                    {/* Applied Date */}
                    <td className="py-4 px-6 text-xs text-text-muted whitespace-nowrap">
                      <div>{creator.formattedDate || new Date(creator.createdAt).toLocaleDateString('en-IN')}</div>
                      <div className="text-[11px] text-text-muted/60">{creator.formattedTime || ''}</div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-6">
                      <select
                        value={creator.status || 'New'}
                        onChange={(e) => handleStatusChange(creator.id, e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#0c0a0c] border border-white/15 text-xs font-bold text-white focus:border-[#F28C3C] focus:outline-none cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Reviewing">Reviewing</option>
                        <option value="Approved">Approved</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCreator(creator)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-colors cursor-pointer"
                          title="View Full Profile"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <a
                          href={getWhatsAppLink(creator)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                          title="WhatsApp Creator"
                        >
                          <span className="material-symbols-outlined text-sm">send</span>
                        </a>
                        <button
                          onClick={() => setCreatorToDelete(creator)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-colors cursor-pointer"
                          title="Delete Application"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-text-muted">
              <div>
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(currentPage * PAGE_SIZE, filteredCreators.length)} of{' '}
                {filteredCreators.length} applicants
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 cursor-pointer"
                >
                  Prev
                </button>
                <span className="px-2 font-bold text-white">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-20 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          DETAILED CREATOR APPLICATION MODAL
         ========================================================================= */}
      {selectedCreator && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100040] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl bg-[#151215] border border-border-amber p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto"
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary-container/20 blur-3xl pointer-events-none rounded-full" />

            <button
              onClick={() => setSelectedCreator(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F28C3C] to-[#FFD700] text-black font-black text-xl flex items-center justify-center shadow-lg">
                {(selectedCreator.fullName || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
                    {selectedCreator.fullName}
                  </h2>
                  {getStatusBadge(selectedCreator.status)}
                </div>
                <p className="text-xs text-text-muted">
                  Applied on {selectedCreator.formattedDate || new Date(selectedCreator.createdAt).toLocaleDateString()} at{' '}
                  {selectedCreator.formattedTime || ''}
                </p>
              </div>
            </div>

            {/* Quick Action Contact Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-2xl bg-[#0c0a0c] border border-white/10">
              <a
                href={getWhatsAppLink(selectedCreator)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine-sweep py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>Message on WhatsApp</span>
              </a>

              <a
                href={`mailto:${selectedCreator.email}?subject=reelXpress%20Creator%20Application%20Update`}
                className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Send Email</span>
              </a>
            </div>

            {/* Application Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  iPhone Device Rig
                </span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#F28C3C] text-base">phone_iphone</span>
                  {selectedCreator.phoneModel || selectedCreator.device}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Location / Zone
                </span>
                <span className="text-white font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-400 text-base">location_on</span>
                  {selectedCreator.cityArea || 'Bengaluru'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Mobile Number
                </span>
                <span className="text-white font-mono font-bold">
                  {selectedCreator.mobileNumber || selectedCreator.phone}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                  Instagram Profile / Portfolio
                </span>
                {selectedCreator.instagramLink ? (
                  <a
                    href={
                      selectedCreator.instagramLink.startsWith('http')
                        ? selectedCreator.instagramLink
                        : `https://instagram.com/${selectedCreator.instagramLink.replace('@', '')}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F28C3C] hover:underline font-bold flex items-center gap-1 truncate block"
                  >
                    <span>{selectedCreator.instagramLink}</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                ) : (
                  <span className="text-text-muted">Not provided</span>
                )}
              </div>
            </div>

            {/* Why Join ReelXpress Message */}
            <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Why they want to join reelXpress:
              </span>
              <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                {selectedCreator.reason || selectedCreator.message || 'No additional statement provided.'}
              </p>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                Update Application Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {['New', 'Reviewing', 'Approved', 'Contacted', 'Rejected'].map((statusOption) => (
                  <button
                    key={statusOption}
                    disabled={actionLoading || selectedCreator.status === statusOption}
                    onClick={() => handleStatusChange(selectedCreator.id, statusOption)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer disabled:opacity-40 ${
                      selectedCreator.status === statusOption
                        ? 'bg-[#F28C3C] text-white shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Mark as {statusOption}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {creatorToDelete && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100060] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#151215] border border-red-500/40 p-6 sm:p-8 shadow-2xl text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-500/15 text-red-400 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Delete Creator Application?</h3>
            <p className="text-sm text-text-muted">
              Are you sure you want to permanently delete the application for{' '}
              <span className="text-white font-bold">{creatorToDelete.fullName}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setCreatorToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
