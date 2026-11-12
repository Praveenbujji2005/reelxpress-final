'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  subscribeToEnquiries,
} from '@/lib/enquiries';
import { useAdminAuth } from '@/context/AdminAuthContext';

const PAGE_SIZE = 10;
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'reelxpress-a862c';

export default function AdminInquiriesPage() {
  const { user } = useAdminAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected inquiry for detail modal
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  // Inquiry marked for deletion confirmation
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const manualRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/enquiries');
      const data = await res.json();
      if (data.success && Array.isArray(data.enquiries)) {
        setInquiries(data.enquiries);
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

    // 1. Fast REST check to verify Firestore connectivity & status immediately
    fetch('/api/enquiries')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!isMounted) return;
        if (!res.ok || !data.success) {
          setErrorNotice(data.error || 'Firestore database is not accessible.');
          setIsConnected(false);
          setLoading(false);
        } else if (Array.isArray(data.enquiries)) {
          setInquiries(data.enquiries);
          setIsConnected(true);
          setErrorNotice(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('API enquiries check notice:', err);
      });

    // 2. Real-time Firestore onSnapshot push listener
    const unsubscribe = subscribeToEnquiries({
      onData: (data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setInquiries(data);
          setIsConnected(true);
          setErrorNotice(null);
          setLoading(false);
        }
      },
      onError: (err) => {
        if (!isMounted) return;
        console.warn('[AdminInquiries] Real-time listener notice:', err);
        const errMsg = err?.message || String(err);
        if (errMsg.includes('database (default) does not exist') || errMsg.includes('NOT_FOUND') || errMsg.includes('not-found')) {
          setErrorNotice(
            `Firestore database (default) is not created yet in Firebase project "${FIREBASE_PROJECT_ID}". Please click "Create database" in the Firebase Console.`
          );
        } else if (errMsg.includes('permission') || errMsg.includes('PERMISSION_DENIED')) {
          setErrorNotice(
            'Firestore permission denied. Please verify your Firestore Security Rules allow read/write to the "enquiries" collection.'
          );
        } else {
          setErrorNotice(errMsg);
        }
        setIsConnected(false);
        setLoading(false);
      },
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const syncToCloud = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/enquiries', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        if (data.syncedCount > 0) {
          showToast(`Successfully synced ${data.syncedCount} enquiry(ies) to Cloud Firestore!`);
        } else if (data.totalUnsynced === 0) {
          showToast('All enquiries are already synced with Cloud Firestore.');
        } else {
          showToast(`Database instance pending creation in Firebase Console. Click "Create Database" link above.`);
        }
        await manualRefresh();
      }
    } catch (err) {
      showToast('Sync error: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      await fetch('/api/enquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, adminEmail: user?.email || 'admin@reelxpress.com' }),
      });
      showToast(`Status updated to "${newStatus}".`);
      // Optimistic update in state
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!inquiryToDelete) return;
    setActionLoading(true);
    try {
      await fetch(`/api/enquiries?id=${encodeURIComponent(inquiryToDelete.id)}`, {
        method: 'DELETE',
      });
      showToast('Enquiry permanently deleted.');
      setInquiries((prev) => prev.filter((item) => item.id !== inquiryToDelete.id));
      if (selectedInquiry?.id === inquiryToDelete.id) {
        setSelectedInquiry(null);
      }
      setInquiryToDelete(null);
    } catch (err) {
      alert(err.message || 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!filteredInquiries.length) {
      showToast('No enquiries available to export.');
      return;
    }
    const headers = [
      'Ref ID',
      'Customer Name',
      'Email',
      'Phone',
      'Selected Package / Service',
      'Event Date',
      'City',
      'Status',
      'Submitted Date',
      'Message / Notes',
    ];

    const rows = filteredInquiries.map((inq) => [
      `"${(inq.id || '').replace(/"/g, '""')}"`,
      `"${(inq.customerName || inq.fullName || '').replace(/"/g, '""')}"`,
      `"${(inq.email || '').replace(/"/g, '""')}"`,
      `"${(inq.phone || '').replace(/"/g, '""')}"`,
      `"${(inq.selectedService || inq.package || inq.companyName || '').replace(/"/g, '""')}"`,
      `"${(inq.eventDate || inq.date || '').replace(/"/g, '""')}"`,
      `"${(inq.city || 'Bengaluru').replace(/"/g, '""')}"`,
      `"${(inq.status || 'New').replace(/"/g, '""')}"`,
      `"${(inq.createdAt || inq.formattedDate || '').replace(/"/g, '""')}"`,
      `"${(inq.enquiryMessage || inq.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reelxpress-inquiries-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredInquiries.length} enquiry(ies) to CSV!`);
  };

  // Filtered and sorted enquiries
  const filteredInquiries = useMemo(() => {
    let result = [...inquiries];

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (inq) =>
          (inq.customerName && inq.customerName.toLowerCase().includes(term)) ||
          (inq.fullName && inq.fullName.toLowerCase().includes(term)) ||
          (inq.email && inq.email.toLowerCase().includes(term)) ||
          (inq.phone && inq.phone.toLowerCase().includes(term)) ||
          (inq.companyName && inq.companyName.toLowerCase().includes(term)) ||
          (inq.selectedService && inq.selectedService.toLowerCase().includes(term)) ||
          (inq.eventDate && inq.eventDate.toLowerCase().includes(term)) ||
          (inq.city && inq.city.toLowerCase().includes(term)) ||
          (inq.enquiryMessage && inq.enquiryMessage.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      const target = statusFilter.toLowerCase();
      result = result.filter((inq) => (inq.status || '').toLowerCase() === target);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter((inq) => {
        const itemDateStr = inq.eventDate || inq.createdAt || inq.timestampDate;
        if (!itemDateStr) return false;
        const itemDate = new Date(itemDateStr);
        if (isNaN(itemDate.getTime())) return false;

        if (dateFilter === 'today') {
          return itemDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'this_week') {
          const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
          return diffDays >= -1 && diffDays <= 7;
        } else if (dateFilter === 'this_month') {
          return (
            itemDate.getMonth() === now.getMonth() &&
            itemDate.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.timestampDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestampDate || 0).getTime();
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [inquiries, search, statusFilter, dateFilter, sortBy]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredInquiries.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInquiries.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInquiries, currentPage]);

  return (
    <div className="space-y-6 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100050] px-5 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-white text-sm shadow-[0_15px_40px_rgba(0,0,0,0.8)] flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Firestore Synced</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Server &amp; Cloud Buffer Active</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Customer Enquiries &amp; Bookings
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time Firestore sync with automated customer tracking, status updates, and WhatsApp integration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-md"
            title="Download inquiries as a CSV spreadsheet"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={syncToCloud}
            disabled={syncing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff6d29] hover:from-[#ff6d29] hover:to-[#ff8547] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-60 shadow-[0_0_15px_rgba(255,109,41,0.3)]"
            title="Upload pending server enquiries to Cloud Firestore"
          >
            <span className={`material-symbols-outlined text-sm ${syncing ? 'animate-spin' : ''}`}>cloud_upload</span>
            <span>{syncing ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>

          <button
            onClick={manualRefresh}
            className="px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-medium text-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Database Setup Notice Banner (Shown if Firestore 404 occurs) */}
      {errorNotice && (
        <div className="p-5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-100 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl shrink-0 mt-0.5">
              database
            </span>
            <div>
              <div className="font-bold text-amber-200 text-sm">
                Cloud Firestore Setup Step Required
              </div>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                {errorNotice}
              </p>
            </div>
          </div>
          <a
            href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs tracking-wider uppercase whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0"
          >
            <span>Open Firebase Console</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-[#151215] border border-white/10 shadow-lg">
        {/* Search */}
        <div className="md:col-span-4 relative">
          <input
            type="text"
            placeholder="Search by name, email, phone, service, date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white placeholder:text-text-muted/40 focus:border-[#ff6d29] focus:outline-none text-sm transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg">
            search
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="md:col-span-4 flex items-center gap-1 p-1 rounded-xl bg-[#0c0a0c] border border-white/10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {['all', 'New', 'Contacted', 'Booked', 'Lost'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st.toLowerCase())}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap text-center ${
                statusFilter === st.toLowerCase()
                  ? 'bg-gradient-to-r from-[#ff5722] to-[#ff6d29] text-white shadow-sm'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>

        {/* Date Filter Dropdown */}
        <div className="md:col-span-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white text-xs font-semibold focus:border-[#ff6d29] focus:outline-none cursor-pointer"
          >
            <option value="all">Dates: All Time</option>
            <option value="today">Dates: Today</option>
            <option value="this_week">Dates: Last 7 Days</option>
            <option value="this_month">Dates: This Month</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#0c0a0c] border border-white/15 text-white text-xs font-semibold focus:border-[#ff6d29] focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table Card */}
      <div className="rounded-3xl bg-[#151215] border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-text-muted text-sm">
            <div className="w-8 h-8 border-2 border-[#ff6d29] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Connecting to Firestore database...
          </div>
        ) : paginatedInquiries.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm px-4">
            <span className="material-symbols-outlined text-4xl text-white/20 mb-2 block">
              inbox
            </span>
            No customer enquiries match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0e0b0e] border-b border-white/10 text-xs uppercase tracking-wider text-text-muted">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Customer / Brand</th>
                  <th className="py-3.5 px-4 font-semibold">Contact Details</th>
                  <th className="py-3.5 px-4 font-semibold">Selected Service</th>
                  <th className="py-3.5 px-4 font-semibold">Shoot Date &amp; City</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedInquiries.map((inq) => {
                  const sanitizedPhone = (inq.phone || '').replace(/\D/g, '');
                  const waNumber = sanitizedPhone.startsWith('91') ? sanitizedPhone : `91${sanitizedPhone}`;
                  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `Hello ${inq.customerName || inq.fullName}! Thank you for choosing reelXpress. We received your booking enquiry for "${inq.selectedService || inq.serviceType}".`
                  )}`;
                  const mailLink = `mailto:${inq.email}?subject=${encodeURIComponent(
                    `reelXpress Booking Confirmation - ${inq.selectedService || inq.serviceType}`
                  )}&body=${encodeURIComponent(
                    `Hi ${inq.customerName || inq.fullName},\n\nThank you for reaching out to reelXpress regarding your booking for ${inq.selectedService || inq.serviceType}.\n\nOur Bengaluru shoot crew is ready to assist you!`
                  )}`;

                  const currentStatus = (inq.status || 'New').toLowerCase();

                  return (
                    <tr
                      key={`inq-${inq.id ?? idx}-${idx}`}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedInquiry(inq)}
                    >
                      {/* Name & Company */}
                      <td className="py-4 px-5">
                        <div className="font-extrabold text-white text-base">
                          {inq.customerName || inq.fullName}
                        </div>
                        {inq.companyName && (
                          <div className="text-xs text-[#ff6d29] font-medium mt-0.5">
                            🏢 {inq.companyName}
                          </div>
                        )}
                        <div className="text-[11px] text-text-muted mt-0.5">
                          {inq.formattedDate ? `${inq.formattedDate} at ${inq.formattedTime}` : inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recent'}
                        </div>
                        {inq.cloudSynced ? (
                          <div className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Cloud Synced</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Local Buffer</span>
                          </div>
                        )}
                      </td>

                      {/* Email & Phone */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 text-xs text-white/90">
                          <span className="material-symbols-outlined text-[15px] text-[#ff6d29]">mail</span>
                          <a href={mailLink} className="hover:underline">{inq.email}</a>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
                          <span className="material-symbols-outlined text-[15px] text-emerald-400">call</span>
                          <a href={`tel:${inq.phone}`} className="hover:underline">{inq.phone}</a>
                        </div>
                      </td>

                      {/* Service Type */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-semibold text-white/90 max-w-[220px] truncate" title={inq.selectedService || inq.serviceType}>
                          {inq.selectedService || inq.serviceType}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          Source: {inq.sourcePage || inq.source || 'Website'}
                        </div>
                      </td>

                      {/* Event Date & Location */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs text-white">
                          📅 {inq.eventDate || 'Date not specified'}
                        </div>
                        <div className="text-[11px] text-text-muted mt-0.5">
                          📍 {inq.city || 'Bengaluru'}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={
                            currentStatus === 'completed' || currentStatus === 'resolved'
                              ? 'Completed'
                              : currentStatus === 'contacted'
                              ? 'Contacted'
                              : currentStatus === 'booked'
                              ? 'Booked'
                              : currentStatus === 'lost'
                              ? 'Lost'
                              : 'New'
                          }
                          disabled={actionLoading}
                          onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none uppercase tracking-wider ${
                            currentStatus === 'new'
                              ? 'bg-[#ff6d29]/20 text-[#ff6d29] border-[#ff6d29]/40'
                              : currentStatus === 'contacted'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : currentStatus === 'booked'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : currentStatus === 'lost'
                              ? 'bg-zinc-600/30 text-zinc-300 border-zinc-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <option value="New" className="bg-[#151215] text-[#ff6d29]">NEW</option>
                          <option value="Contacted" className="bg-[#151215] text-blue-300">CONTACTED</option>
                          <option value="Booked" className="bg-[#151215] text-purple-300">BOOKED</option>
                          <option value="Lost" className="bg-[#151215] text-zinc-400">LOST</option>
                          <option value="Completed" className="bg-[#151215] text-emerald-300">COMPLETED</option>
                        </select>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          {/* WhatsApp Button */}
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="p-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.09 7.4 8.87 7.65C8.64 7.89 8 8.49 8 9.72C8 10.95 8.89 12.14 9.01 12.3C9.14 12.46 10.77 14.96 13.25 16.03C13.84 16.29 14.3 16.44 14.66 16.55C15.25 16.74 15.79 16.71 16.22 16.65C16.7 16.58 17.69 16.05 17.89 15.48C18.1 14.9 18.1 14.41 18.04 14.31C17.97 14.2 17.8 14.14 17.55 14.02C17.3 13.89 16.07 13.29 15.84 13.21C15.62 13.12 15.45 13.08 15.29 13.33C15.12 13.57 14.64 14.14 14.5 14.31C14.35 14.47 14.21 14.49 13.96 14.37C13.71 14.24 12.89 13.98 11.93 13.12C11.18 12.45 10.67 11.63 10.53 11.38C10.38 11.13 10.51 11 10.64 10.87C10.75 10.76 10.89 10.58 11.01 10.43C11.14 10.29 11.18 10.18 11.26 10.02C11.35 9.85 11.3 9.71 11.24 9.58C11.18 9.46 10.7 8.28 10.5 7.79C10.3 7.31 10.1 7.38 9.95 7.37C9.81 7.36 9.67 7.34 9.53 7.34Z" />
                            </svg>
                          </a>

                          {/* Email Button */}
                          <a
                            href={mailLink}
                            title="Email Customer"
                            className="p-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">mail</span>
                          </a>

                          {/* View Modal */}
                          <button
                            onClick={() => setSelectedInquiry(inq)}
                            title="View Full Details"
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setInquiryToDelete(inq)}
                            title="Delete Enquiry"
                            className="p-2 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-white/10 text-xs text-text-muted bg-[#0c0a0c]">
            <div>
              Showing <span className="text-white font-bold">{(currentPage - 1) * PAGE_SIZE + 1}</span> to{' '}
              <span className="text-white font-bold">{Math.min(currentPage * PAGE_SIZE, totalItems)}</span> of{' '}
              <span className="text-white font-bold">{totalItems}</span> enquiries
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">chevron_left</span>
                <span>Previous</span>
              </button>

              <span className="px-2 text-white font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          ENQUIRY DETAIL DRAWER / MODAL
         ========================================================================= */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-[100040] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-[#151215] border border-white/15 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#ff6d29]/20 text-[#ff6d29] flex items-center justify-center font-extrabold text-lg">
                {(selectedInquiry.customerName || selectedInquiry.fullName || 'C').charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">
                  {selectedInquiry.customerName || selectedInquiry.fullName}
                </h3>
                <p className="text-xs text-text-muted">
                  Enquiry ID: <code className="text-white/80 font-mono">{selectedInquiry.id}</code>
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1">
                    Phone / WhatsApp
                  </span>
                  <a
                    href={`tel:${selectedInquiry.phone}`}
                    className="text-white font-semibold hover:text-[#ff6d29]"
                  >
                    {selectedInquiry.phone}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-white font-semibold hover:text-[#ff6d29] break-all"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1">
                    Shoot Date
                  </span>
                  <span className="text-white font-semibold">
                    {selectedInquiry.eventDate || 'Not specified'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1">
                    Location / City
                  </span>
                  <span className="text-white font-semibold">
                    {selectedInquiry.city || 'Bengaluru'}
                  </span>
                </div>

                {selectedInquiry.companyName && (
                  <div className="col-span-2">
                    <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1">
                      Company / Brand
                    </span>
                    <span className="text-[#ff6d29] font-bold">
                      {selectedInquiry.companyName}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1">
                  Selected Shoot Service
                </span>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 font-semibold text-[#ff6d29]">
                  {selectedInquiry.selectedService || selectedInquiry.serviceType}
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-1">
                  Customer Enquiry Message
                </span>
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-white/90 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.enquiryMessage || selectedInquiry.message || 'No additional notes provided.'}
                </div>
              </div>

              {/* Status Update Options */}
              <div className="pt-2">
                <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold block mb-2">
                  Update Enquiry Status
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {['New', 'Contacted', 'Booked', 'Lost', 'Completed'].map((st) => {
                    const isSelected = (selectedInquiry.status || '').toLowerCase() === st.toLowerCase();
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(selectedInquiry.id, st)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#ff6d29] text-white shadow-md'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Contact Footer */}
            <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${(selectedInquiry.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hello ${selectedInquiry.customerName || selectedInquiry.fullName}! Thank you for contacting reelXpress.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                  `reelXpress - ${selectedInquiry.selectedService || selectedInquiry.serviceType}`
                )}`}
                className="flex-1 py-3 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2"
              >
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {inquiryToDelete && (
        <div className="fixed inset-0 z-[100050] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#181318] border border-red-500/30 p-6 sm:p-7 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2">Delete Customer Enquiry?</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Are you sure you want to delete the enquiry from{' '}
              <strong className="text-white">{inquiryToDelete.customerName || inquiryToDelete.fullName}</strong>? This action is permanent.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setInquiryToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-lg"
              >
                {actionLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
