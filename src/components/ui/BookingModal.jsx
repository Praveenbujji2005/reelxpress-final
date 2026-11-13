'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * BookingModal Component
 *
 * Appears only after a successful form submission.
 * Unmounted from DOM when closed or on initial page load.
 */
export default function BookingModal({ isOpen, bookingDetails, onClose }) {
  const modalRef = useRef(null);
  const doneButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Trigger festive gold and orange confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F28C3C', '#ffd700', '#ffffff', '#ffb599'],
      });
    } catch {
      // Fallback gracefully if canvas blocked
    }

    // Lock body scroll while modal is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus primary action on open
    setTimeout(() => {
      doneButtonRef.current?.focus();
    }, 50);

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Accessible Tab focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Unmount completely when not open
  if (!isOpen) return null;

  const clientName = bookingDetails?.name?.trim();
  const formattedDate = bookingDetails?.date
    ? (() => {
        try {
          const d = new Date(bookingDetails.date);
          if (isNaN(d.getTime())) return bookingDetails.date;
          return d.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
        } catch {
          return bookingDetails.date;
        }
      })()
    : 'To be confirmed on call';

  return (
    <div
      id="booking-modal"
      data-lenis-prevent
      className="fixed inset-0 z-[100030] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl transition-all duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-3xl bg-[#151215] border border-white/10 p-6 sm:p-8 text-center shadow-[0_30px_100px_rgba(242,140,60,0.3)] animate-fadeIn"
      >
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(242,140,60,0.35)] p-3">
          <img
            src="/brand/icon-gold.png"
            alt="reelXpress"
            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(242,140,60,0.6)]"
          />
        </div>

        {/* Title */}
        <h3 id="booking-modal-title" className="text-2xl font-extrabold text-white mb-2 tracking-tight">
          Request received
        </h3>

        {/* Name Greeting & Body Copy */}
        <p className="text-sm text-text-muted mb-6 leading-relaxed">
          {clientName ? (
            <>
              Thank you, <span className="text-[#F28C3C] font-semibold">{clientName}</span>!{' '}
            </>
          ) : (
            <>Thank you! </>
          )}
          Our Bengaluru coordinator will WhatsApp you shortly to confirm your slot.
        </p>

        {/* Booking Details Card */}
        <div className="p-4 rounded-xl bg-[#1E1B1F] border border-white/10 text-left mb-6 space-y-2 text-xs text-text-muted">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Status:</span>
            <span className="text-amber-400 font-bold tracking-wide">● Pending confirmation</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Date:</span>
            <span className="text-white font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">City Zone:</span>
            <span className="text-white font-medium">{bookingDetails?.city || 'Bengaluru'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Turnaround:</span>
            <span className="text-[#F28C3C] font-bold">Delivery in Minutes</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          ref={doneButtonRef}
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-bold text-base shadow-[0_4px_20px_rgba(242,140,60,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
