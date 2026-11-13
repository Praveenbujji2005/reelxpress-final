'use client';

import React, { useState, useEffect } from 'react';
import {
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
  uploadImageFile,
} from '@/lib/cmsServices';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminTestimonialsPage() {
  const { user } = useAdminAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (editingTestimonial || testimonialToDelete) {
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
  }, [editingTestimonial, testimonialToDelete]);

  const fetchList = async () => {
    try {
      const data = await getTestimonials();
      setTestimonials(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateNew = () => {
    setEditingTestimonial({
      id: 'new_' + Date.now(),
      name: '',
      role: 'Bride & Groom · Palace Grounds',
      review: '',
      quote: '',
      rating: 5,
      avatar: '/brand/icon-gold.png',
      enabled: true,
      order: testimonials.length + 1,
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImageFile(file, 'testimonials');
      setEditingTestimonial((prev) => ({ ...prev, avatar: url }));
      showToast('Avatar image uploaded!');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const reviewText = (editingTestimonial.review || editingTestimonial.quote || '').trim();
    if (!editingTestimonial.name?.trim() || !reviewText) {
      alert('Client name and review text are required.');
      return;
    }
    setIsSaving(true);
    try {
      await saveTestimonial(
        {
          ...editingTestimonial,
          review: reviewText,
          quote: reviewText,
        },
        user?.email
      );
      showToast('Testimonial saved successfully!');
      setEditingTestimonial(null);
      await fetchList();
    } catch (err) {
      alert('Failed to save testimonial: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!testimonialToDelete) return;
    try {
      await deleteTestimonial(testimonialToDelete.id, user?.email);
      showToast('Testimonial deleted.');
      setTestimonialToDelete(null);
      await fetchList();
    } catch (err) {
      alert('Failed to delete testimonial: ' + (err?.message || 'Unknown error'));
    }
  };

  return (
    <div className="space-y-6 select-none">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[100050] px-5 py-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/50 text-white text-sm shadow-xl flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Client Testimonials &amp; Reviews CMS
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage customer reviews, star ratings, avatar photos, and marquee visibility.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-[#151215] border border-white/5 p-6 flex flex-col justify-between shadow-xl ambient-skeleton min-h-[260px]"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 shrink-0 ambient-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 rounded bg-white/10 ambient-pulse" />
                    <div className="w-24 h-3 rounded bg-white/5 ambient-pulse" />
                  </div>
                </div>
                <div className="space-y-2 my-4">
                  <div className="w-full h-3 rounded bg-white/10 ambient-pulse" />
                  <div className="w-5/6 h-3 rounded bg-white/10 ambient-pulse" />
                  <div className="w-2/3 h-3 rounded bg-white/5 ambient-pulse" />
                </div>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <div className="w-16 h-3 rounded bg-white/10 ambient-pulse" />
                <div className="w-16 h-8 rounded-xl bg-white/10 ambient-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="py-20 text-center text-text-muted border border-dashed border-white/10 rounded-3xl">
          No testimonials found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(testimonials ?? []).map((t, idx) => (
            <div
              key={t.id ?? `admin-testi-${idx}`}
              className={`rounded-3xl bg-[#151215] border p-6 flex flex-col justify-between shadow-xl transition-all ${
                t.enabled ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-60'
              }`}
            >
              <div>
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black/60 border border-white/20 shrink-0">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-white text-base truncate">{t.name}</h3>
                    <p className="text-xs text-text-muted truncate">{t.role}</p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`material-symbols-outlined text-sm ${
                        i < (t.rating || 5) ? 'fill-current' : 'text-white/20'
                      }`}
                    >
                      star
                    </span>
                  ))}
                  <span className="text-xs font-bold text-white/80 ml-1.5">
                    {t.rating || 5}.0
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs text-white/80 leading-relaxed italic line-clamp-4">
                  &quot;{t.review || t.quote}&quot;
                </p>
              </div>

              {/* Controls */}
              <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    t.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'
                  }`}
                >
                  {t.enabled ? 'Published' : 'Hidden'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingTestimonial(t)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setTestimonialToDelete(t)}
                    className="p-2 rounded-xl bg-red-500/15 hover:bg-red-500/30 text-red-400 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {editingTestimonial && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100040] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl bg-[#161318] border border-white/15 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setEditingTestimonial(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-extrabold text-white mb-6">
              {editingTestimonial.id.startsWith('new_') ? 'Add Testimonial' : 'Edit Testimonial'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Customer Name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya & Karthik"
                    value={editingTestimonial.name}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Role / Event Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bride & Groom · Taj West End"
                    value={editingTestimonial.role}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Star Rating (1 - 5)
                </label>
                <select
                  value={editingTestimonial.rating || 5}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm cursor-pointer"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Exceptional)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars - Great)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars - Average)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Review Text*
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What did the client say about our on-site delivery and quality?"
                  value={editingTestimonial.review ?? editingTestimonial.quote ?? ''}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      review: e.target.value,
                      quote: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm resize-none"
                />
              </div>

              {/* Avatar Upload & URL Picker */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Profile Avatar Image
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-[#0c0a0c] border border-white/15">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-black shrink-0 border border-white/20">
                    <img
                      src={editingTestimonial.avatar || '/brand/icon-gold.png'}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/brand/icon-gold.png';
                      }}
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Image URL or preset path..."
                        value={editingTestimonial.avatar || ''}
                        onChange={(e) =>
                          setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value })
                        }
                        className="flex-1 px-3 py-2 rounded-xl bg-[#151215] border border-white/15 text-white text-xs focus:border-[#F28C3C] focus:outline-none"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Quick Avatar Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-text-muted">
                      <span>Presets:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            avatar: '/brand/icon-gold.png',
                          })
                        }
                        className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-amber-400 border border-white/10"
                      >
                        Gold Icon
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            avatar: '/creators/dp-1.jpg',
                          })
                        }
                        className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 border border-white/10"
                      >
                        Avatar 1
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTestimonial({
                            ...editingTestimonial,
                            avatar: '/creators/dp-2.jpg',
                          })
                        }
                        className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 border border-white/10"
                      >
                        Avatar 2
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="testi-en"
                  checked={editingTestimonial.enabled !== false}
                  onChange={(e) =>
                    setEditingTestimonial({
                      ...editingTestimonial,
                      enabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-[#F28C3C] accent-[#F28C3C] bg-[#0c0a0c]"
                />
                <label htmlFor="testi-en" className="text-sm font-semibold text-white cursor-pointer">
                  Publish to client reviews marquee
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTestimonial(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  )}
                  <span>{isSaving ? 'Saving Testimonial...' : 'Save Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {testimonialToDelete && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[100050] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
        >
          <div
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-[#181318] border border-red-500/30 p-6 sm:p-7 shadow-2xl text-center"
          >
            <h3 className="text-xl font-extrabold text-white mb-2">Delete Testimonial?</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Are you sure you want to delete review from <strong className="text-white">&quot;{testimonialToDelete.name}&quot;</strong>?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTestimonialToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Delete Testimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
