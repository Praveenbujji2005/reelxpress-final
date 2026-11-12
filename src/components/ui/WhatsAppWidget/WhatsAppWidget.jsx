'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { WHATSAPP_CONFIG, openWhatsApp, getWhatsAppUrl } from '@/config/whatsapp';

/**
 * WhatsApp Chat Widget for ReelXpress
 *
 * Features:
 * - On Mobile (< 768px / mobile touch): Tapping directly launches native WhatsApp via official click-to-chat.
 * - On Laptop / Desktop (>= 768px): Tapping toggles the interactive mini WhatsApp chat window with message composer.
 * - Centralized business number: +91 84319 12122.
 * - Zero blockers, native iOS/Android universal link handoff, zero popup errors.
 */
export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState('');
  const [timestamp, setTimestamp] = useState('11:06 AM');
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile viewport or touch device
  useEffect(() => {
    const checkMobile = () => {
      const isNarrow = window.innerWidth < 768;
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || ''
      );
      const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints > 0);
      setIsMobile(isNarrow || (isMobileUA && isTouch));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set local user timestamp on client mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const now = new Date();
      setTimestamp(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      // Fallback stays as default
    }
  }, []);

  // Auto-focus input when chat window opens (on desktop)
  useEffect(() => {
    if (isOpen && !isMobile) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMobile]);

  // Handle Escape key to close widget
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside chat window or launcher button
  useEffect(() => {
    function handleClickOutside(e) {
      if (!isOpen) return;
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(e.target) &&
        !e.target.closest('[data-whatsapp-launcher]')
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle launcher click: on mobile, direct WhatsApp launch; on laptop, toggle chat dialog
  const handleLauncherClick = (e) => {
    const isMobileNow =
      window.innerWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent || ''
      );

    if (isMobileNow) {
      // Allow native <a> navigation or trigger openWhatsApp
      // Does not preventDefault, letting standard link handoff occur cleanly
      return;
    }

    // On laptop / desktop, prevent default link navigation and toggle the interactive chat box
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    // Redirects to official WhatsApp click-to-chat with URL-encoded message
    openWhatsApp(message);
    setMessage('');
    setIsOpen(false);
  };

  if (!mounted || pathname?.startsWith('/admin')) return null;

  return (
    <div className="whatsapp-widget-root select-none">
      {/* 1. Mini WhatsApp Chat Window (Active on Desktop / Laptop) */}
      {!isMobile && (
        <div
          id="whatsapp-chat-box"
          ref={chatWindowRef}
          role="dialog"
          aria-modal="false"
          aria-label="ReelXpress WhatsApp Chat"
          aria-hidden={!isOpen}
          data-lenis-prevent
          className={`fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-[100000] w-[350px] sm:w-[380px] max-w-[calc(100vw-24px)] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5),0_8px_24px_rgba(37,211,102,0.18)] border border-white/10 transition-all duration-250 ease-out origin-bottom-right flex flex-col ${
            isOpen
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
          }`}
        >
          {/* Chat Window Header (Dark Teal with ReelXpress Branding) */}
          <div className="bg-gradient-to-r from-[#075E54] via-[#0b6b60] to-[#128C7E] px-4 py-3.5 flex items-center justify-between text-white shadow-md relative z-10">
            <div className="flex items-center gap-3">
              {/* ReelXpress Avatar with Online Indicator */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#151215] border-2 border-white/30 flex items-center justify-center p-1.5 shadow-inner">
                  <img
                    src="/brand/icon-gold.png"
                    alt="ReelXpress Brand Icon"
                    className="w-full h-full object-contain drop-shadow-[0_0_4px_rgba(255,109,41,0.5)]"
                  />
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] border-2 border-[#075E54]"
                  title="Online"
                  aria-label="Online status"
                />
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm sm:text-base tracking-tight text-white leading-tight">
                    ReelXpress
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                </div>
                <span className="text-[11px] text-white/85 font-medium leading-tight">
                  Instant Content Creation
                </span>
                <span className="text-[10px] text-emerald-200/90 font-normal leading-tight mt-0.5">
                  Replies within minutes
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close WhatsApp chat"
              className="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <svg
                className="w-5 h-5 fill-none stroke-current stroke-2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Canvas (Subtle WhatsApp Doodle Background) */}
          <div
            className="p-4 sm:p-5 flex flex-col gap-3 min-h-[190px] max-h-[260px] overflow-y-auto relative"
            style={{
              backgroundColor: '#ECE5DD',
              backgroundImage: `radial-gradient(#d3c9be 1px, transparent 1px), radial-gradient(#d3c9be 1px, #ECE5DD 1px)`,
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          >
            {/* Subtle WhatsApp doodle watermark overlay */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
              }}
              aria-hidden="true"
            />

            {/* Date Stamp */}
            <div className="flex justify-center my-0.5">
              <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-xs border border-gray-300/40">
                Today
              </span>
            </div>

            {/* Incoming Welcome Message Bubble from ReelXpress */}
            <div className="flex flex-col items-start relative z-10 animate-fadeIn">
              <div className="bg-white text-gray-900 rounded-2xl rounded-tl-xs p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.12)] max-w-[88%] text-left border border-gray-100">
                <span className="block text-[11px] font-bold text-[#075E54] mb-1">
                  ReelXpress
                </span>
                <div className="text-[13px] sm:text-sm text-gray-800 leading-relaxed">
                  <p className="font-semibold text-gray-900">Hello there! 👋</p>
                  <p className="mt-1">How can we help you?</p>
                </div>
                <div className="text-[10px] text-gray-400 font-medium text-right mt-1.5 flex items-center justify-end gap-1">
                  <span>{timestamp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message Composer Section */}
          <div className="bg-[#F0F2F5] p-3 border-t border-gray-200/90 relative z-10">
            <form onSubmit={handleSend} className="flex items-center gap-2" suppressHydrationWarning>
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                aria-label="Type your message to ReelXpress"
                className="flex-1 py-2.5 px-4 rounded-full bg-white text-gray-900 placeholder:text-gray-400 text-[16px] sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/60 border border-gray-300/70 shadow-inner transition-all"
              />

              <button
                type="submit"
                aria-label="Send message to WhatsApp"
                className="w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
              >
                {/* WhatsApp Send Paper Airplane Icon */}
                <svg
                  className="w-4 h-4 fill-current translate-x-0.5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Floating Circular WhatsApp Launcher Button */}
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        data-whatsapp-launcher
        onClick={handleLauncherClick}
        aria-label={!isMobile && isOpen ? 'Close WhatsApp chat' : 'Chat with ReelXpress on WhatsApp'}
        aria-expanded={!isMobile && isOpen}
        aria-haspopup={!isMobile ? 'dialog' : undefined}
        className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-[99995] w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-gradient-to-tr from-[#20ba5a] to-[#25D366] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.65)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] group"
      >
        {/* Soft pulse glow ring behind button */}
        <span
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-50 blur-md pointer-events-none transition-opacity -z-10"
          aria-hidden="true"
        />

        {!isMobile && isOpen ? (
          /* Smooth Cross Close Icon (Desktop Open State) */
          <svg
            className="w-6 h-6 fill-none stroke-current stroke-2 transition-transform duration-200 rotate-0 group-hover:rotate-90"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Official WhatsApp Brand Icon */
          <svg
            className="w-7 h-7 fill-current drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.09 7.4 8.87 7.65C8.64 7.89 8 8.49 8 9.72C8 10.95 8.89 12.14 9.01 12.3C9.14 12.46 10.77 14.96 13.25 16.03C13.84 16.29 14.3 16.44 14.66 16.55C15.25 16.74 15.79 16.71 16.22 16.65C16.7 16.58 17.69 16.05 17.89 15.48C18.1 14.9 18.1 14.41 18.04 14.31C17.97 14.2 17.8 14.14 17.55 14.02C17.3 13.89 16.07 13.29 15.84 13.21C15.62 13.12 15.45 13.08 15.29 13.33C15.12 13.57 14.64 14.14 14.5 14.31C14.35 14.47 14.21 14.49 13.96 14.37C13.71 14.24 12.89 13.98 11.93 13.12C11.18 12.45 10.67 11.63 10.53 11.38C10.38 11.13 10.51 11 10.64 10.87C10.75 10.76 10.89 10.58 11.01 10.43C11.14 10.29 11.18 10.18 11.26 10.02C11.35 9.85 11.3 9.71 11.24 9.58C11.18 9.46 10.7 8.28 10.5 7.79C10.3 7.31 10.1 7.38 9.95 7.37C9.81 7.36 9.67 7.34 9.53 7.34Z" />
          </svg>
        )}
      </a>
    </div>
  );
}
