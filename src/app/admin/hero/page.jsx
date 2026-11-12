'use client';

import React, { useState, useEffect } from 'react';
import {
  getHeroSlides,
  saveHeroSlide,
  deleteHeroSlide,
  uploadImageFile,
} from '@/lib/cmsServices';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminHeroPage() {
  const { user } = useAdminAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchSlides = async () => {
    try {
      const data = await getHeroSlides();
      setSlides(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (err) {
      console.error('Failed to load slides:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateNew = () => {
    setEditingSlide({
      id: 'new_' + Date.now(),
      title: '',
      creator: '',
      category: 'Celebrations',
      views: '150K views',
      poster: '/thumbnails/reel-frame-1.jpg',
      instagramUrl: 'https://www.instagram.com/reelxpress___',
      enabled: true,
      order: slides.length + 1,
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImageFile(file, 'hero');
      setEditingSlide((prev) => ({ ...prev, poster: url }));
      showToast('Image uploaded and previewed successfully!');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingSlide.title || !editingSlide.creator) {
      alert('Title and creator are required.');
      return;
    }
    try {
      await saveHeroSlide(editingSlide, user?.email);
      showToast('Hero slide saved successfully!');
      setEditingSlide(null);
      await fetchSlides();
    } catch (err) {
      alert('Failed to save slide: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!slideToDelete) return;
    try {
      await deleteHeroSlide(slideToDelete.id, user?.email);
      showToast('Slide deleted.');
      setSlideToDelete(null);
      await fetchSlides();
    } catch (err) {
      alert('Failed to delete slide: ' + (err?.message || 'Unknown error'));
    }
  };

  const handleMove = async (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= slides.length) return;

    const copy = [...slides];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // Update order property
    copy.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSlides(copy);
    try {
      await Promise.all(copy.map((s) => saveHeroSlide(s, user?.email)));
      showToast('Slide order updated.');
    } catch {
      fetchSlides();
    }
  };

  const handleToggleEnabled = async (slide) => {
    const updated = { ...slide, enabled: !slide.enabled };
    try {
      await saveHeroSlide(updated, user?.email);
      setSlides((prev) => prev.map((s) => (s.id === slide.id ? updated : s)));
      showToast(`Slide ${updated.enabled ? 'Enabled' : 'Disabled'}.`);
    } catch {}
  };

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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hero Section &amp; Carousel Management
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Manage reel portfolio slides, posters, Instagram destinations, and display order.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5722] to-[#ff6d29] text-white font-bold text-sm tracking-wide shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Add New Reel Slide</span>
        </button>
      </div>

      {/* Slides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-[#151215] border border-white/5 overflow-hidden shadow-xl flex flex-col ambient-skeleton min-h-[380px]"
            >
              <div className="aspect-[9/16] max-h-[220px] bg-white/5 ambient-pulse" />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-16 h-3 rounded-full bg-white/10 ambient-pulse" />
                  <div className="w-3/4 h-5 rounded bg-white/10 ambient-pulse" />
                  <div className="w-1/2 h-3 rounded bg-white/5 ambient-pulse" />
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center mt-4">
                  <div className="w-16 h-3 rounded bg-white/10 ambient-pulse" />
                  <div className="w-16 h-8 rounded-xl bg-white/10 ambient-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : slides.length === 0 ? (
        <div className="py-20 text-center text-text-muted border border-dashed border-white/10 rounded-3xl">
          No carousel slides found. Click &quot;Add New Reel Slide&quot; to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {slides.map((slide, idx) => (
            <div
              key={`admin-slide-${slide.id ?? idx}-${idx}`}
              className={`rounded-3xl bg-[#151215] border overflow-hidden shadow-xl flex flex-col transition-all ${
                slide.enabled
                  ? 'border-white/10 hover:border-[#ff6d29]/50'
                  : 'border-white/5 opacity-60'
              }`}
            >
              {/* Image Preview Container (9:16 portrait) */}
              <div className="relative aspect-[9/16] bg-black/60 overflow-hidden group">
                <img
                  src={slide.poster}
                  alt={slide.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white font-bold text-[11px]">
                    #{idx + 1} · {slide.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-text-muted text-[11px]">
                    {slide.views}
                  </span>
                </div>

                {/* Center Instagram Action Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f09433] to-[#bc1888] flex items-center justify-center text-white shadow-lg">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Title inside Image */}
                <div className="absolute inset-x-3 bottom-3 text-left">
                  <h3 className="font-extrabold text-white text-base leading-tight truncate">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-[#ff6d29] font-semibold mt-0.5">
                    Shot by {slide.creator}
                  </p>
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="p-4 bg-[#110e11] border-t border-white/10 flex items-center justify-between text-xs">
                {/* Reorder Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, -1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                    title="Move Left/Up"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_upward</span>
                  </button>
                  <button
                    disabled={idx === slides.length - 1}
                    onClick={() => handleMove(idx, 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white disabled:opacity-30 flex items-center justify-center cursor-pointer"
                    title="Move Right/Down"
                  >
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                </div>

                {/* Enable Toggle & Edit / Delete */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(slide)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer ${
                      slide.enabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/10 text-text-muted border border-white/20'
                    }`}
                  >
                    {slide.enabled ? 'ACTIVE' : 'HIDDEN'}
                  </button>

                  <button
                    onClick={() => setEditingSlide(slide)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                    title="Edit Slide"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>

                  <button
                    onClick={() => setSlideToDelete(slide)}
                    className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 cursor-pointer"
                    title="Delete Slide"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT SLIDE MODAL
         ========================================================================= */}
      {editingSlide && (
        <div className="fixed inset-0 z-[100040] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl bg-[#151215] border border-white/15 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingSlide(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-extrabold text-white mb-6">
              {editingSlide.id.startsWith('new_') ? 'Add New Reel Slide' : 'Edit Reel Slide'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Reel Title*
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SIIMA Awards - ReelXpress"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#ff6d29] focus:outline-none text-sm"
                />
              </div>

              {/* Creator & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Creator Name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sneha D."
                    value={editingSlide.creator}
                    onChange={(e) => setEditingSlide({ ...editingSlide, creator: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#ff6d29] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Category Tag*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red Carpet, Wedding"
                    value={editingSlide.category}
                    onChange={(e) => setEditingSlide({ ...editingSlide, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#ff6d29] focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Views Count & Instagram URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Views Display
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 310K views"
                    value={editingSlide.views}
                    onChange={(e) => setEditingSlide({ ...editingSlide, views: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#ff6d29] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Instagram Redirect URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/reelxpress___"
                    value={editingSlide.instagramUrl}
                    onChange={(e) => setEditingSlide({ ...editingSlide, instagramUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#ff6d29] focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Poster Image File Upload & Preview */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                  Reel Poster Image (Single Frame)
                </label>
                <div className="space-y-3 p-4 rounded-2xl bg-[#0c0a0c] border border-white/15">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-28 aspect-[9/16] rounded-xl overflow-hidden bg-black shrink-0 border border-white/20">
                      <img
                        src={editingSlide.poster}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        <span>{isUploading ? 'Uploading Image...' : 'Upload & Replace Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-text-muted mt-1.5">
                        Recommended: High resolution 9:16 portrait image (JPEG/PNG). Auto-optimized for instant loading.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                      Or Direct Image / Poster URL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /thumbnails/reel-frame-1.jpg or https://..."
                      value={editingSlide.poster || ''}
                      onChange={(e) => setEditingSlide({ ...editingSlide, poster: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#070507] border border-white/10 text-white text-xs focus:border-[#ff6d29] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="slide-enabled"
                  checked={editingSlide.enabled}
                  onChange={(e) => setEditingSlide({ ...editingSlide, enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#ff6d29] focus:ring-[#ff6d29] bg-[#0c0a0c] border-white/20"
                />
                <label htmlFor="slide-enabled" className="text-sm font-semibold text-white">
                  Publish slide to live website carousel
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#eb5b1f] to-[#ff6d29] text-white font-bold text-sm tracking-wide shadow-lg cursor-pointer"
                >
                  Save Reel Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {slideToDelete && (
        <div className="fixed inset-0 z-[100050] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#181318] border border-red-500/30 p-6 sm:p-7 shadow-2xl text-center">
            <h3 className="text-xl font-extrabold text-white mb-2">Delete Carousel Slide?</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-white">&quot;{slideToDelete.title}&quot;</strong>? This reel will be removed from the public homepage.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSlideToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Delete Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
