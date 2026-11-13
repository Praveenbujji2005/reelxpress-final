'use client';

import React, { useState, useEffect } from 'react';
import {
  getHeroSlides,
  saveHeroSlide,
  deleteHeroSlide,
  uploadImageFile,
  uploadVideoFile,
} from '@/lib/cmsServices';
import { useAdminAuth } from '@/context/AdminAuthContext';

const MAX_HERO_REELS = 7;

export default function AdminHeroPage() {
  const { user } = useAdminAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (editingSlide || slideToDelete) {
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
  }, [editingSlide, slideToDelete]);

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
    if (slides.length >= MAX_HERO_REELS) {
      showToast(`Maximum limit of ${MAX_HERO_REELS} reels reached.`);
      return;
    }
    setEditingSlide({
      id: 'new_' + Date.now(),
      title: '',
      creator: '',
      category: 'Celebrations',
      views: '150K views',
      poster: '/thumbnails/reel-frame-1.jpg',
      videoUrl: '',
      videoSrc: '',
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

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsVideoUploading(true);
    try {
      const url = await uploadVideoFile(file, 'hero');
      setEditingSlide((prev) => ({ ...prev, videoUrl: url, videoSrc: url }));
      showToast('Video uploaded successfully!');
    } catch (err) {
      alert('Video upload failed: ' + err.message);
    } finally {
      setIsVideoUploading(false);
    }
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSaving) return;
    if (!editingSlide?.title || !editingSlide?.creator) {
      alert('Title and creator are required.');
      return;
    }
    const isNew = !editingSlide.id || editingSlide.id.startsWith('new_');
    if (isNew && slides.length >= MAX_HERO_REELS) {
      alert(`Cannot add more than ${MAX_HERO_REELS} reels. Please edit or delete an existing reel.`);
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...editingSlide,
        videoUrl: editingSlide.videoUrl || editingSlide.videoSrc || '',
        videoSrc: editingSlide.videoUrl || editingSlide.videoSrc || '',
      };
      await saveHeroSlide(payload, user?.email);
      showToast('Hero slide saved successfully!');
      setEditingSlide(null);
      try {
        await fetchSlides();
      } catch (fetchErr) {
        console.warn('Post-save refresh notice:', fetchErr);
      }
    } catch (err) {
      alert('Failed to save slide: ' + err.message);
    } finally {
      setIsSaving(false);
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hero Section &amp; Carousel Management
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                slides.length >= MAX_HERO_REELS
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-white/10 border-white/15 text-white/80'
              }`}
            >
              {slides.length} / {MAX_HERO_REELS} Reels Max
            </span>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Manage reel portfolio slides, posters, Instagram destinations, and display order (Max {MAX_HERO_REELS} reels).
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          disabled={slides.length >= MAX_HERO_REELS}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-lg flex items-center gap-2 transition-all self-start sm:self-auto ${
            slides.length >= MAX_HERO_REELS
              ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              : 'bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white hover:opacity-95 active:scale-95 cursor-pointer'
          }`}
          title={slides.length >= MAX_HERO_REELS ? `Maximum ${MAX_HERO_REELS} reels reached` : 'Add New Reel Slide'}
        >
          <span className="material-symbols-outlined text-sm">
            {slides.length >= MAX_HERO_REELS ? 'lock' : 'add'}
          </span>
          <span>{slides.length >= MAX_HERO_REELS ? 'Max 7 Reels Reached' : 'Add New Reel Slide'}</span>
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
          {(slides ?? []).map((slide, idx) => (
            <div
              key={`admin-slide-${slide.id ?? idx}-${idx}`}
              className={`rounded-3xl bg-[#151215] border overflow-hidden shadow-xl flex flex-col transition-all ${
                slide.enabled
                  ? 'border-white/10 hover:border-[#F28C3C]/50'
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
                  {slide.videoUrl || slide.videoSrc ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Video</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-text-muted text-[11px]">
                      {slide.views}
                    </span>
                  )}
                </div>

                {/* Center Video Play Action Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 fill-[#F28C3C] translate-x-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Bottom Title inside Image */}
                <div className="absolute inset-x-3 bottom-3 text-left">
                  <h3 className="font-extrabold text-white text-base leading-tight truncate">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-[#F28C3C] font-semibold mt-0.5">
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
              onClick={() => setEditingSlide(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-xl font-extrabold text-white mb-6">
              {editingSlide.id.startsWith('new_') ? 'Add New Reel Slide' : 'Edit Reel Slide'}
            </h3>

            <form onSubmit={handleSave} noValidate className="space-y-4">
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
                  className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
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
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
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
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
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
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5">
                    Instagram Redirect URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.instagram.com/reelxpress___"
                    value={editingSlide.instagramUrl}
                    onChange={(e) => setEditingSlide({ ...editingSlide, instagramUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0c0a0c] border border-white/15 text-white focus:border-[#F28C3C] focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Video URL & Video File Upload */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-1.5 flex items-center justify-between">
                  <span>Reel Video (MP4 / WebM / QuickTime)</span>
                  {(editingSlide.videoUrl || editingSlide.videoSrc) && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span>Video Configured</span>
                    </span>
                  )}
                </label>
                <div className="space-y-3 p-4 rounded-2xl bg-[#0c0a0c] border border-white/15">
                  <div className="flex items-center gap-4">
                    {editingSlide.videoUrl || editingSlide.videoSrc ? (
                      <div className="w-16 h-28 aspect-[9/16] rounded-xl overflow-hidden bg-black shrink-0 border border-white/20 relative">
                        <video
                          src={editingSlide.videoUrl || editingSlide.videoSrc}
                          playsInline
                          muted
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-28 aspect-[9/16] rounded-xl bg-white/5 border border-dashed border-white/20 shrink-0 flex flex-col items-center justify-center text-text-muted">
                        <span className="material-symbols-outlined text-xl">videocam_off</span>
                        <span className="text-[9px] mt-1">No video</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs cursor-pointer transition-colors">
                        <span className="material-symbols-outlined text-sm">video_file</span>
                        <span>{isVideoUploading ? 'Uploading Video...' : 'Upload Video File'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          disabled={isVideoUploading}
                          onChange={handleVideoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-text-muted mt-1.5">
                        Upload 9:16 vertical video directly. Automatically optimized and persisted.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                      Or Direct Video URL / File Path
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. /uploads/videos/... or https://... or /assets/video.mp4"
                      value={editingSlide.videoUrl || editingSlide.videoSrc || ''}
                      onChange={(e) =>
                        setEditingSlide({
                          ...editingSlide,
                          videoUrl: e.target.value,
                          videoSrc: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#070507] border border-white/10 text-white text-xs focus:border-[#F28C3C] focus:outline-none font-mono"
                    />
                  </div>
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
                      className="w-full px-3 py-2 rounded-xl bg-[#070507] border border-white/10 text-white text-xs focus:border-[#F28C3C] focus:outline-none"
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
                  className="w-4 h-4 rounded text-[#F28C3C] focus:ring-[#F28C3C] accent-[#F28C3C] bg-[#0c0a0c] border-white/20"
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
                  disabled={isSaving || isUploading || isVideoUploading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-sm tracking-wide shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" />
                      <span>Saving Reel Slide...</span>
                    </>
                  ) : (
                    <span>Save Reel Slide</span>
                  )}
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
