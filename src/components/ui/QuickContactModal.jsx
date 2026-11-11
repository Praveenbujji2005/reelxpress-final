'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { OCCASIONS_LIST, SHOOT_TYPE_CATEGORIES } from '@/lib/data';

// Compact modal popup for quick booking / contact form triggered from Navbar & mobile navigation
export default function QuickContactModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    date: '',
    type: OCCASIONS_LIST[0] || 'Quick Shoot (1 Hour - Single Reel)',
    city: 'Bengaluru',
  });
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const emailVal = (formData.email || `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client'}@reelxpress-inquiry.com`).trim();

    const payload = {
      customerName: formData.name.trim(),
      fullName: formData.name.trim(),
      email: emailVal,
      phone: formData.phone.trim(),
      companyName: formData.companyName.trim(),
      selectedService: formData.type,
      serviceType: formData.type,
      city: formData.city.trim(),
      eventDate: formData.date,
      enquiryMessage: `Quick booking enquiry for ${formData.type} in ${formData.city} on ${formData.date}${formData.companyName ? ` (Brand: ${formData.companyName})` : ''}`,
      message: `Quick booking enquiry for ${formData.type} in ${formData.city} on ${formData.date}${formData.companyName ? ` (Brand: ${formData.companyName})` : ''}`,
      sourcePage: 'Quick Contact Modal',
      source: 'quick_modal',
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to submit booking. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#ff6d29', '#ffd700', '#ffffff', '#ff9e66'],
        });
      } catch {}
    } catch (err) {
      console.error('[QuickContactModal] Error:', err);
      setErrorMessage(err?.message || 'Could not save enquiry to Firestore. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      companyName: '',
      date: '',
      type: OCCASIONS_LIST[0] || 'Quick Shoot (1 Hour - Single Reel)',
      city: 'Bengaluru',
    });
    onClose();
  };

  if (!mounted || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100030] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-[440px] rounded-3xl bg-[#110e13]/98 border border-[#FF5E1E]/40 p-5 sm:p-7 shadow-[0_25px_80px_rgba(255,94,30,0.3),0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-left text-text-primary overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#ff6d29]/25 blur-3xl pointer-events-none rounded-full"
          aria-hidden="true"
        />

        {/* Close Button (Min 44x44px touch target) */}
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Close form"
          className="absolute top-3 right-3 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10 touch-manipulation active:scale-90"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {!isSuccess ? (
          <div>
            {/* Header Badge & Title */}
            <div className="mb-4 pr-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ff6d29]/15 border border-[#ff6d29]/40 text-[#ff8f50] text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6d29] animate-pulse" />
                <span>Instant Firestore Booking</span>
              </div>
              <h3 id="contact-modal-title" className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                <span>Book </span>
                <img
                  src="/brand/reelxpress-wordmark-white-hd.png"
                  alt="reelXpress"
                  className="inline-block h-[0.92em] sm:h-[1.0em] w-auto object-contain align-middle mx-1 drop-shadow-[0_0_12px_rgba(255,109,41,0.4)]"
                />
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Shoot • Edit • Deliver Reels in Minutes. Saved securely to Firestore.
              </p>
            </div>

            {/* Quick Contact Form */}
            {errorMessage && (
              <div className="mb-3 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-sm text-red-400 shrink-0 mt-0.5">error</span>
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name & Company Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                    Your Name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sravanthi Reddy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border-specular text-white placeholder:text-text-muted/50 focus:border-[#ff6d29] focus:outline-none focus:ring-1 focus:ring-[#ff6d29]/50 transition-all text-[16px] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                    Company / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border-specular text-white placeholder:text-text-muted/50 focus:border-[#ff6d29] focus:outline-none focus:ring-1 focus:ring-[#ff6d29]/50 transition-all text-[16px] sm:text-sm"
                  />
                </div>
              </div>

              {/* Email & Phone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. sravanthi@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border-specular text-white placeholder:text-text-muted/50 focus:border-[#ff6d29] focus:outline-none focus:ring-1 focus:ring-[#ff6d29]/50 transition-all text-[16px] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                    WhatsApp / Phone*
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border-specular text-white placeholder:text-text-muted/50 focus:border-[#ff6d29] focus:outline-none focus:ring-1 focus:ring-[#ff6d29]/50 transition-all text-[16px] sm:text-sm"
                  />
                </div>
              </div>

              {/* Shoot Type & Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                    Shoot Date*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border-specular text-white placeholder:text-text-muted/50 focus:border-[#ff6d29] focus:outline-none focus:ring-1 focus:ring-[#ff6d29]/50 transition-all text-[16px] sm:text-sm [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                    City / Area*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border-specular text-white placeholder:text-text-muted/50 focus:border-[#ff6d29] focus:outline-none focus:ring-1 focus:ring-[#ff6d29]/50 transition-all text-[16px] sm:text-sm"
                  />
                </div>
              </div>

              {/* Shoot Type Dropdown */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-text-muted mb-1">
                  Selected Service*
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-base border border-border-specular text-white focus:border-[#ff6d29] focus:outline-none focus:ring-1 focus:ring-[#ff6d29]/50 transition-all text-[16px] sm:text-sm cursor-pointer"
                >
                  {SHOOT_TYPE_CATEGORIES.map((cat) => (
                    <optgroup key={cat.group} label={cat.group} className="bg-[#181318] text-[#ff6d29] font-bold">
                      {cat.options.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#151215] text-white font-normal py-1">
                          {opt}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-glow-orange btn-shine-sweep w-full mt-3 py-3.5 rounded-full text-white font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 touch-manipulation min-h-[46px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Shoot Slot</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Success Card */
          <div className="text-center py-6 px-2 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h4 className="text-2xl font-black text-white tracking-tight mb-2">
              Slot Inquiry Confirmed!
            </h4>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto mb-6">
              Saved directly to Firestore. Our Bengaluru reel crew will connect with you on WhatsApp within 10 minutes.
            </p>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer touch-manipulation"
            >
              Done &amp; Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
