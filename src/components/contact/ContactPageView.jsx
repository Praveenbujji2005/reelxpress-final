'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import MobileMenu from '@/components/layout/MobileMenu';
import Footer from '@/components/layout/Footer';

export default function ContactPageView() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    website_trap: '', // Anti-spam honeypot
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const [referenceId, setReferenceId] = useState('');

  // Read optional service query param (e.g. from mobile pricing CTAs)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const serviceParam = params.get('service');
      if (serviceParam) {
        setFormData((prev) => ({ ...prev, subject: serviceParam }));
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const errors = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim() || digitsOnly.length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Please select or provide a subject.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Please provide a message with at least 10 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check honeypot
    if (formData.website_trap) {
      setSubmitSuccess(true);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    const payload = {
      customerName: formData.fullName.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      companyName: formData.subject.trim(),
      selectedService: formData.subject.trim() || 'General Inquiry',
      serviceType: formData.subject.trim() || 'General Inquiry',
      enquiryMessage: formData.message.trim(),
      message: formData.message.trim(),
      city: 'Bengaluru',
      sourcePage: 'Contact Us Dedicated Page',
      source: 'contact_page',
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to submit your message. Please try again.');
      }

      setSubmitSuccess(true);
      setReferenceId(data.enquiry?.id || 'RX-' + Math.floor(100000 + Math.random() * 900000));
    } catch (err) {
      console.error('[ContactPage] Submission failed:', err);
      setServerError(err.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: '',
      website_trap: '',
    });
    setFormErrors({});
    setSubmitSuccess(false);
    setServerError('');
    setReferenceId('');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col selection:bg-primary-container selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="flex-1 relative z-10 pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 md:px-margin max-w-7xl mx-auto w-full">
        {/* Background Ambient Glows */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] rounded-full bg-gradient-to-br from-[#FF5E1E]/15 via-[#5c1d00]/05 to-transparent blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Page Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-muted font-medium select-none" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-white/30">/</span>
          <span className="text-white">Contact Us</span>
        </nav>

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161318] border border-border-amber text-primary text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_15px_rgba(255,94,30,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container rec-indicator" />
            <span>CONTACT REELXPRESS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Let&apos;s Connect with Our <span className="text-shimmer text-primary-container">Bengaluru Team</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
            Have questions about on-site iPhone 4K reel shoots, brand launches, weddings, or custom event packages? Reach out and we&apos;ll get back to you in minutes.
          </p>
        </div>

        {/* Two-Column Layout: Details & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          
          {/* LEFT COLUMN: Contact Details & Quick Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Card */}
            <div className="rounded-3xl bg-[#110e13] border border-white/10 p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-primary-container" />
                <span>Direct Contact Information</span>
              </h2>

              <ul className="space-y-6">
                {/* Location */}
                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary-container">
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Production HQ</div>
                    <div className="text-sm sm:text-base font-semibold text-white mt-0.5">
                      Bengaluru, Karnataka, India
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Serving Indiranagar, Koramangala, Whitefield, MG Road &amp; all NCR zones.
                    </p>
                  </div>
                </li>

                {/* Direct Phone / WhatsApp */}
                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary-container">
                    <span className="material-symbols-outlined text-xl">phone_iphone</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Call / WhatsApp</div>
                    <a
                      href="tel:+919988338180"
                      className="text-sm sm:text-base font-bold text-white hover:text-primary transition-colors block mt-0.5"
                    >
                      +91 9988338180
                    </a>
                    <span className="text-[11px] text-[#22c55e] font-medium flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                      Live response desk active
                    </span>
                  </div>
                </li>

                {/* Email */}
                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary-container">
                    <span className="material-symbols-outlined text-xl">mail</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Support</div>
                    <a
                      href="mailto:contact@reelxpress.com"
                      className="text-sm sm:text-base font-bold text-white hover:text-primary transition-colors block mt-0.5"
                    >
                      contact@reelxpress.com
                    </a>
                    <span className="text-xs text-text-muted mt-0.5 block">
                      Fast turnaround for brand decks &amp; queries
                    </span>
                  </div>
                </li>

                {/* Operating Hours */}
                <li className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-primary-container">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider">Operating Hours</div>
                    <div className="text-sm sm:text-base font-semibold text-white mt-0.5">
                      Monday – Sunday: 8:00 AM – 10:00 PM
                    </div>
                    <span className="text-xs text-text-muted mt-0.5 block">
                      24/7 priority emergency crew dispatch available
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#110e13] border border-white/10 p-6 sm:p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
              
              {/* SUCCESS CONFIRMATION STATE */}
              {submitSuccess ? (
                <div className="py-10 text-center space-y-6 fade-in-content">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF5E1E] to-[#FF8800] text-white flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(255,94,30,0.6)]">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-container">
                      INQUIRY SENT SUCCESSFULLY
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      Thank You, {formData.fullName}!
                    </h3>
                    <p className="text-sm sm:text-base text-text-muted max-w-md mx-auto leading-relaxed">
                      We have received your message. Our Bengaluru shoot coordinator will review your request and connect with you shortly.
                    </p>
                  </div>

                  {referenceId && (
                    <div className="inline-block px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-text-muted font-mono">
                      Reference ID: <span className="text-white font-bold">{referenceId}</span>
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all"
                    >
                      Send Another Message
                    </button>
                    <Link
                      href="/"
                      className="w-full sm:w-auto btn-glow-orange px-8 py-3 rounded-full font-bold text-sm tracking-wide uppercase text-white inline-flex items-center justify-center gap-2"
                    >
                      <span>Back to Home</span>
                      <span className="material-symbols-outlined text-sm">home</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* INTERACTIVE CONTACT FORM */
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Send Us a Message</h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-1">
                      Fill out the form below and we will get back to you within 15–30 minutes.
                    </p>
                  </div>

                  {/* Server Error Notice */}
                  {serverError && (
                    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-400 text-lg shrink-0 mt-0.5">error</span>
                      <div>
                        <strong className="block font-semibold">Submission failed</strong>
                        <span>{serverError}</span>
                      </div>
                    </div>
                  )}

                  {/* Honeypot anti-spam trap */}
                  <input
                    type="text"
                    name="website_trap"
                    value={formData.website_trap}
                    onChange={handleChange}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-primary-container">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#09080b] border ${
                        formErrors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                      } text-white placeholder-text-muted/40 text-sm focus:outline-none transition-colors`}
                      required
                    />
                    {formErrors.fullName && (
                      <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email & Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-primary-container">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#09080b] border ${
                          formErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                        } text-white placeholder-text-muted/40 text-sm focus:outline-none transition-colors`}
                        required
                      />
                      {formErrors.email && (
                        <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Phone Number <span className="text-primary-container">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#09080b] border ${
                          formErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                        } text-white placeholder-text-muted/40 text-sm focus:outline-none transition-colors`}
                        required
                      />
                      {formErrors.phone && (
                        <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Subject / Shoot Type <span className="text-primary-container">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#09080b] border border-white/15 text-white text-sm focus:outline-none focus:border-primary-container transition-colors cursor-pointer"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Wedding / Reception Shoot">Wedding / Reception Reel Shoot</option>
                      <option value="Brand Launch / Corporate Event">Brand Launch / Corporate Event</option>
                      <option value="Influencer / Creator Collab">Creator Partnership / Collaboration</option>
                      <option value="Custom Instant Package">Custom Instant Video Package</option>
                      {formData.subject && ![
                        'General Inquiry',
                        'Wedding / Reception Shoot',
                        'Brand Launch / Corporate Event',
                        'Influencer / Creator Collab',
                        'Custom Instant Package'
                      ].includes(formData.subject) && (
                        <option value={formData.subject}>{formData.subject}</option>
                      )}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      Your Message <span className="text-primary-container">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your event, location, date, and specific requirements..."
                      className={`w-full px-4 py-3 rounded-xl bg-[#09080b] border ${
                        formErrors.message ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                      } text-white placeholder-text-muted/40 text-sm focus:outline-none transition-colors resize-y`}
                      required
                    />
                    {formErrors.message && (
                      <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-glow-orange btn-shine-sweep group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-bold text-white text-base tracking-wide uppercase transition-all shadow-lg min-h-[50px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none touch-manipulation"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          <span>Sending Message...</span>
                        </>
                      ) : (
                        <>
                          <span>SUBMIT MESSAGE</span>
                          <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1">
                            send
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-center text-[11px] text-text-muted/70">
                    By submitting, you agree to our{' '}
                    <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link> and{' '}
                    <Link href="/terms" className="underline hover:text-white">Terms of Service</Link>.
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}