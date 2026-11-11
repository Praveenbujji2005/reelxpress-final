'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileMenu from '@/components/layout/MobileMenu';
import Footer from '@/components/layout/Footer';
import BrandWatermark from '@/components/sections/BrandWatermark';
import ToastNotification from '@/components/ui/ToastNotification';
import CreatorSuccessModal from '@/components/creators/CreatorSuccessModal';
import ReelXpressWordmark from '@/components/ui/ReelXpressWordmark';
import {
  CREATOR_HERO,
  CREATOR_PERKS,
  CREATOR_ELIGIBILITY,
  CREATOR_JOURNEY,
  CREATOR_TESTIMONIALS,
  PHONE_MODEL_OPTIONS,
  CREATOR_FAQS,
} from '@/lib/creatorData';

export default function CreatorPageView() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobileNumber: '',
    cityArea: '',
    instagramLink: '',
    phoneModel: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'check_circle',
  });

  const showToast = useCallback((toastData) => {
    setToast({
      visible: true,
      title: toastData.title,
      message: toastData.message || '',
      icon: toastData.icon || 'check_circle',
    });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const scrollToApply = (e) => {
    if (e) e.preventDefault();
    const applyEl = document.getElementById('apply');
    if (applyEl) {
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.scrollTo(applyEl, { offset: -70, duration: 1.2 });
      } else {
        applyEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToJourney = (e) => {
    if (e) e.preventDefault();
    const journeyEl = document.getElementById('journey');
    if (journeyEl) {
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.scrollTo(journeyEl, { offset: -70, duration: 1.2 });
      } else {
        journeyEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.mobileNumber.trim()) {
      showToast({
        title: 'Missing Details',
        message: 'Please fill in your name, email, and mobile number.',
        icon: 'warning',
      });
      return;
    }

    if (!formData.phoneModel || formData.phoneModel === 'Select your device') {
      showToast({
        title: 'Select Phone Model',
        message: 'Please choose your iPhone device model.',
        icon: 'phone_iphone',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit to API backend (persisting to Firebase Firestore + Server Store)
      const res = await fetch('/api/creators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sourcePage: '/creators',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application. Please check your network and try again.');
      }

      setSubmittedData({ ...formData });
      setIsSuccessModalOpen(true);
      showToast({
        title: 'Application Received!',
        message: 'Your creator application was submitted to Firebase Firestore.',
        icon: 'check_circle',
      });

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        mobileNumber: '',
        cityArea: '',
        instagramLink: '',
        phoneModel: '',
        reason: '',
      });
    } catch (err) {
      console.error('Creator application submission error:', err);
      showToast({
        title: 'Submission Error',
        message: err.message || 'Unable to submit creator application.',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="relative z-10 flex-1">
        
        {/* ==========================================================================
            1. HERO SECTION: Join Our Ecosystem
            ========================================================================== */}
        <section className="relative pt-20 md:pt-28 pb-16 md:pb-24 px-6 md:px-margin max-w-[1440px] mx-auto overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary-container/15 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="text-center max-w-4xl mx-auto">
            {/* Live Ecosystem Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/15 border border-border-amber text-primary text-xs sm:text-sm font-bold tracking-wider uppercase mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(255,109,41,0.25)]">
              <span className="w-2 h-2 rounded-full bg-primary rec-indicator" />
              <span>{CREATOR_HERO.badge}</span>
            </div>

            {/* Monumental Headline */}
            <h1 className="text-display-md sm:text-display-lg md:text-display-xl font-display-xl font-black text-white tracking-tight leading-[1.08] mb-6">
              {CREATOR_HERO.titlePart1}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-light to-primary-container drop-shadow-[0_4px_24px_rgba(255,109,41,0.4)]">
                {CREATOR_HERO.titlePart2}
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-body-lg sm:text-title-lg font-body-lg text-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
              {CREATOR_HERO.description}
            </p>

            {/* Hero CTA Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={scrollToApply}
                className="btn-shine-sweep btn-ripple w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-primary-container text-white font-bold text-base shadow-[0_12px_36px_rgba(255,109,41,0.55)] hover:shadow-[0_16px_48px_rgba(255,109,41,0.8)] hover:scale-[1.03] active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span>{CREATOR_HERO.ctaPrimary}</span>
                <span className="material-symbols-outlined text-lg">arrow_downward</span>
              </button>

              <button
                onClick={scrollToJourney}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-surface-container/80 hover:bg-surface-container border border-border-specular hover:border-border-amber text-white font-semibold text-base transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              >
                <span>{CREATOR_HERO.ctaSecondary}</span>
                <span className="material-symbols-outlined text-lg">timeline</span>
              </button>
            </div>

            {/* Quick Highlights Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6 border-t border-border-specular">
              {CREATOR_HERO.stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-surface-base/60 border border-border-specular/60 p-4 sm:p-5 backdrop-blur-md text-center hover:border-border-amber/60 transition-colors"
                >
                  <div className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white mb-0.5">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-text-muted">
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ==========================================================================
            2. WHY JOIN REELXPRESS? (8 Feature Perks)
            ========================================================================== */}
        <section id="perks" className="py-16 md:py-24 px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span>Creator Advantages</span>
            </div>
            <h2 className="text-display-sm sm:text-display-md font-display-md text-white font-extrabold mb-4">
              <span>Why Join </span>
              <span className="inline-flex items-center align-middle whitespace-nowrap">
                <ReelXpressWordmark className="inline-block h-[0.92em] sm:h-[1.0em] w-auto align-middle drop-shadow-[0_0_14px_rgba(255,94,30,0.4)]" />
                <span>?</span>
              </span>
            </h2>
            <p className="text-body-lg text-text-muted">
              Turn your iPhone into a creative business
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREATOR_PERKS.map((perk, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl bg-surface-base/80 border border-border-specular hover:border-border-amber/80 backdrop-blur-xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,109,41,0.2)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary-container/15 border border-border-amber text-primary flex items-center justify-center group-hover:scale-110 group-hover:bg-primary-container group-hover:text-white transition-all duration-300 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">
                        {perk.icon}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-muted group-hover:text-white transition-colors">
                      {perk.tag}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-primary-light transition-colors">
                    {perk.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================================================
            3. WHO CAN APPLY? (6 Requirements + Callout Banner)
            ========================================================================== */}
        <section id="eligibility" className="py-16 md:py-24 px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28">
          <div className="rounded-3xl bg-surface-deep/90 border border-border-amber/60 backdrop-blur-2xl p-8 sm:p-12 lg:p-16 shadow-[0_20px_80px_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Top Amber Light */}
            <div className="absolute top-0 right-1/4 w-96 h-48 bg-primary-container/20 blur-3xl pointer-events-none rounded-full" />

            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-bold mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                <span>Join Our Creator Network</span>
              </div>
              <h2 className="text-display-sm sm:text-display-md font-display-md text-white font-extrabold mb-4">
                Who Can Apply?
              </h2>
              <p className="text-body-lg text-text-muted">
                If you&apos;re creative and hungry to grow—you&apos;re in.
              </p>
            </div>

            {/* Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {CREATOR_ELIGIBILITY.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-surface-container/50 border border-border-specular p-6 hover:border-border-amber transition-all flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 border border-border-amber text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner Callout */}
            <div className="rounded-2xl bg-gradient-to-r from-primary-container/25 via-primary-container/15 to-transparent border border-border-amber p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
              <div>
                <div className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
                  ZERO BARRIERS TO ENTRY
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  No degree or prior work experience needed
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  We look for creative eye, camera framing, and energy. We teach the rest.
                </p>
              </div>

              <button
                onClick={scrollToApply}
                className="btn-shine-sweep btn-ripple inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-surface-deep hover:bg-primary-light font-extrabold text-sm sm:text-base tracking-tight shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Apply Now to Become a ReelXpresser</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>

          </div>
        </section>

        {/* ==========================================================================
            4. THE JOURNEY (5 Simple Steps)
            ========================================================================== */}
        <section id="journey" className="py-16 md:py-24 px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span>The Journey</span>
            </div>
            <h2 className="text-display-sm sm:text-display-md font-display-md text-white font-extrabold mb-4">
              Start Your Creator journey
            </h2>
            <p className="text-body-lg text-text-muted">
              Simple steps to start earning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {CREATOR_JOURNEY.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-3xl bg-surface-base/90 border border-border-specular hover:border-border-amber p-6 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-primary tracking-wider uppercase">
                      {step.stepLabel}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary-container/20 border border-border-amber text-primary">
                      {step.duration}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-surface-container border border-border-specular text-white flex items-center justify-center mb-5">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      {step.icon}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-specular/60 flex items-center justify-between">
                  <span className="text-xs text-text-muted font-medium">Stage {step.stepNumber} of 5</span>
                  <div className="w-7 h-7 rounded-full bg-primary-container/25 text-primary text-xs font-extrabold flex items-center justify-center">
                    {step.stepNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================================================
            5. REAL STORIES, REAL EARNINGS (Creator Proof)
            ========================================================================== */}
        <section id="stories" className="py-16 md:py-24 px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span>Real Stories, Real Earnings</span>
            </div>
            <h2 className="text-display-sm sm:text-display-md font-display-md text-white font-extrabold mb-4">
              Real Stories, Real Earnings
            </h2>
            <p className="text-body-lg text-text-muted">
              Join hundreds of active ReelXpress creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREATOR_TESTIMONIALS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-surface-deep/80 border border-border-specular hover:border-border-amber backdrop-blur-xl p-7 sm:p-8 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Creator Header with Avatar Initials */}
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#141014] to-[#ff6d29] border border-border-amber text-white font-extrabold flex items-center justify-center text-base shadow-[0_0_20px_rgba(255,109,41,0.4)]">
                      {item.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-white">
                          {item.name}
                        </span>
                        <span className="material-symbols-outlined text-sm text-primary">
                          verified
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">
                        {item.joined}
                      </div>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-body-md sm:text-base text-text-primary leading-relaxed italic mb-6">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-border-specular flex items-center justify-between">
                  <span className="text-xs text-text-muted font-medium">
                    {item.role}
                  </span>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary-container/15 border border-border-amber">
                    {item.highlight}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==========================================================================
            6. READY TO START? (Interactive Creator Waiting List Form)
            ========================================================================== */}
        <section id="apply" className="py-16 md:py-24 px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28">
          <div className="max-w-3xl mx-auto rounded-3xl bg-surface-base/90 border border-border-amber backdrop-blur-2xl p-8 sm:p-12 shadow-[0_20px_80px_rgba(255,109,41,0.25)] relative overflow-hidden">
            {/* Ambient Background Light */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/15 blur-3xl rounded-full pointer-events-none" />

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-container/20 border border-border-amber text-primary text-xs uppercase font-bold tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-primary rec-indicator" />
                <span>Join Our Waiting List</span>
              </div>
              <h2 className="text-display-sm sm:text-display-md font-display-md text-white font-extrabold mb-3">
                Ready to Start?
              </h2>
              <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
                Fill out the form below to join our waiting list. Spots are limited based on region.
              </p>
            </div>

            {!mounted ? (
              <div className="space-y-6 animate-pulse py-4" aria-hidden="true">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="h-12 rounded-xl bg-surface-container border border-border-specular/40" />
                  <div className="h-12 rounded-xl bg-surface-container border border-border-specular/40" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="h-12 rounded-xl bg-surface-container border border-border-specular/40" />
                  <div className="h-12 rounded-xl bg-surface-container border border-border-specular/40" />
                </div>
                <div className="h-12 rounded-xl bg-surface-container border border-border-specular/40" />
                <div className="h-24 rounded-xl bg-surface-container border border-border-specular/40" />
                <div className="h-14 rounded-full bg-primary-container/40" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
              
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="fullName" className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-2">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="your full name"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-specular focus:border-primary-container focus:ring-1 focus:ring-primary-container text-white text-[16px] sm:text-sm placeholder:text-text-muted/60 transition-all outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-2">
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-specular focus:border-primary-container focus:ring-1 focus:ring-primary-container text-white text-[16px] sm:text-sm placeholder:text-text-muted/60 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Mobile Number & City/Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="mobileNumber" className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-2">
                    Mobile Number <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    id="mobileNumber"
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="your number"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-specular focus:border-primary-container focus:ring-1 focus:ring-primary-container text-white text-[16px] sm:text-sm placeholder:text-text-muted/60 transition-all outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="cityArea" className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-2">
                    City / Area <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="cityArea"
                    name="cityArea"
                    required
                    value={formData.cityArea}
                    onChange={handleInputChange}
                    placeholder="Bengaluru, India"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-specular focus:border-primary-container focus:ring-1 focus:ring-primary-container text-white text-[16px] sm:text-sm placeholder:text-text-muted/60 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Instagram Profile & Phone Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="instagramLink" className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-2">
                    Instagram / Portfolio Link (Must be public) <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="instagramLink"
                    name="instagramLink"
                    required
                    value={formData.instagramLink}
                    onChange={handleInputChange}
                    placeholder="instagram.com/yourhandle"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-specular focus:border-primary-container focus:ring-1 focus:ring-primary-container text-white text-[16px] sm:text-sm placeholder:text-text-muted/60 transition-all outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="phoneModel" className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-2">
                    Phone Model <span className="text-primary">*</span>
                  </label>
                  <select
                    id="phoneModel"
                    name="phoneModel"
                    required
                    value={formData.phoneModel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-specular focus:border-primary-container focus:ring-1 focus:ring-primary-container text-white text-[16px] sm:text-sm transition-all outline-none"
                  >
                    {PHONE_MODEL_OPTIONS.map((model, i) => (
                      <option key={i} value={model} className="bg-surface-deep text-white">
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Why do you want to join */}
              <div>
                <label htmlFor="reason" className="block text-xs uppercase tracking-wider font-bold text-text-muted mb-2">
                  Why do you want to join ReelXpress?
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={4}
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Tell us about your passion for content creation..."
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-specular focus:border-primary-container focus:ring-1 focus:ring-primary-container text-white text-[16px] sm:text-sm placeholder:text-text-muted/60 transition-all outline-none resize-none"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-shine-sweep btn-ripple w-full py-4 px-8 rounded-full bg-primary-container text-white font-extrabold text-base tracking-wide shadow-[0_12px_40px_rgba(255,109,41,0.6)] hover:shadow-[0_16px_50px_rgba(255,109,41,0.85)] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Now</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-center text-xs text-text-muted pt-2">
                By applying, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline font-semibold">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline font-semibold">
                  Privacy Policy
                </Link>.
              </p>

            </form>
            )}
          </div>
        </section>

        {/* ==========================================================================
            7. GOT QUESTIONS? (Frequently Asked Questions Accordion)
            ========================================================================== */}
        <section id="faq" className="py-16 md:py-24 px-4 sm:px-6 md:px-margin max-w-4xl mx-auto scroll-mt-20 md:scroll-mt-28">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-display-sm sm:text-display-md font-display-md text-white font-extrabold mb-3">
              Got Questions?
            </h2>
            <p className="text-body-md text-text-muted">
              Frequently Asked Questions.
            </p>
          </div>

          <div className="space-y-4">
            {CREATOR_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-surface-base/80 border border-border-specular overflow-hidden transition-colors hover:border-border-amber"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-white pr-4">
                      {faq.question}
                    </span>
                    <span
                      className={`material-symbols-outlined text-primary text-xl shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      keyboard_arrow_down
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-sm text-text-muted leading-relaxed border-t border-border-specular/40 pt-4 animate-fadeIn">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Application Success Celebration Modal */}
      <CreatorSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        applicationData={submittedData}
      />

      {/* Toast Notification */}
      <ToastNotification toast={toast} />
    </>
  );
}
