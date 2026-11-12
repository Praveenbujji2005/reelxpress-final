'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Subject / Shoot Type Dropdown Options
const SUBJECT_OPTIONS = [
  'General Inquiry',
  'Wedding / Reception Reel Shoot',
  'Brand Launch / Corporate Event',
  'Creator Partnership / Collaboration',
  'Custom Instant Video Package',
  'Quick Shoot (1 Hour - Single Reel)',
];

export default function BookingSection({ onBookingSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: SUBJECT_OPTIONS[0],
    message: '',
    website_trap: '', // Anti-spam honeypot
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [referenceId, setReferenceId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select shoot type if triggered from external CTA (e.g., pricing cards)
  useEffect(() => {
    const handleSelectType = (e) => {
      if (e.detail?.type) {
        const matching = SUBJECT_OPTIONS.find((opt) =>
          opt.toLowerCase().includes(e.detail.type.toLowerCase())
        );
        setFormData((prev) => ({
          ...prev,
          subject: matching || e.detail.type,
        }));
      }
    };
    window.addEventListener('select-shoot-type', handleSelectType);
    return () => window.removeEventListener('select-shoot-type', handleSelectType);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (submitError) setSubmitError(null);
  };

  const validate = () => {
    const errors = {};
    const nameTrimmed = formData.fullName.trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      errors.fullName = 'Please enter your full name (at least 2 characters).';
    }

    const emailTrimmed = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailRegex.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address.';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '').replace(/^91/, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }

    if (!formData.subject.trim()) {
      errors.subject = 'Please select a shoot type / subject.';
    }

    const msgTrimmed = formData.message.trim();
    if (!msgTrimmed || msgTrimmed.length < 10) {
      errors.message = 'Please provide a message with at least 10 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Check honeypot trap
    if (formData.website_trap) {
      setSubmitSuccess(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const cleanPhone = formData.phone.replace(/\D/g, '').replace(/^91/, '');
    const payload = {
      customerName: formData.fullName.trim(),
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: `+91 ${cleanPhone}`,
      companyName: formData.subject.trim(),
      selectedService: formData.subject.trim(),
      serviceType: formData.subject.trim(),
      enquiryMessage: formData.message.trim(),
      message: formData.message.trim(),
      city: 'Bengaluru',
      website_trap: formData.website_trap,
      sourcePage: 'Website Contact Section',
      source: 'enquiry_form',
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit enquiry. Please verify details and try again.');
      }

      setSubmitSuccess(true);
      const generatedId = data.enquiry?.id || 'RX-' + Math.floor(100000 + Math.random() * 900000);
      setReferenceId(generatedId);

      onBookingSuccess?.({
        name: payload.customerName,
        type: payload.selectedService,
      });

      // Reset form fields
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: SUBJECT_OPTIONS[0],
        message: '',
        website_trap: '',
      });
    } catch (err) {
      console.error('[BookingSection] Submission failed:', err);
      setSubmitError(err.message || 'Unable to store your enquiry. Please verify your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setReferenceId('');
    setFormErrors({});
  };

  return (
    <section className="py-16 md:py-space-2xl px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28" id="booking">
      {/* Express Network Banner */}
      <div className="reveal-scale-on-scroll rounded-3xl bg-[#110e13] border border-border-amber p-5 sm:p-8 md:p-14 shadow-[0_20px_80px_rgba(255,94,30,0.2)] mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Contact Details & Express Network Info */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/20 border border-border-amber text-primary text-label-sm font-label-sm uppercase tracking-widest mb-4">
              <span className="w-2 h-2 rounded-full bg-primary rec-indicator" />
              <span>JOIN THE EXPRESS NETWORK</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-headline-lg text-text-primary mb-4 leading-tight">
              The fastest creative community for modern creators.
            </h2>
            <p className="text-body-lg font-body-lg text-text-muted mb-8 leading-relaxed">
              We Shoot • Edit • Deliver Reels in Minutes. Book certified mobile videographers or reach our production desk today.
            </p>

            {/* Direct Contact Info */}
            <div className="space-y-4 pt-6 border-t border-border-specular">
              <a
                href="tel:+919988338180"
                className="flex items-center gap-3 text-body-md font-body-md text-on-surface hover:text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-border-specular flex items-center justify-center text-primary group-hover:border-primary-container transition-colors">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <span>Direct Line: +91 9988338180</span>
              </a>

              <a
                href="mailto:connect@reelxpress.com"
                className="flex items-center gap-3 text-body-md font-body-md text-on-surface hover:text-primary transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-border-specular flex items-center justify-center text-primary group-hover:border-primary-container transition-colors">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <span>Email: connect@reelxpress.com</span>
              </a>

              <div className="flex items-center gap-3 text-body-md font-body-md text-on-surface">
                <div className="w-10 h-10 rounded-xl bg-surface-container border border-border-specular flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">pin_drop</span>
                </div>
                <span>Bengaluru, Karnataka</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Original "Send Us a Message" Form */}
          <div id="booking-form" className="w-full rounded-2xl bg-[#0d0b0f] border border-white/10 p-6 sm:p-8 md:p-10 shadow-xl spotlight-card">
            
            {/* Form Title & Subtitle */}
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1.5">
                Send Us a Message
              </h3>
              <p className="text-xs sm:text-sm text-text-muted">
                Fill in the details below and our team will get in touch shortly.
              </p>
            </div>

            {/* SUCCESS STATE */}
            {submitSuccess ? (
              <div className="py-8 text-center space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF5E1E] to-[#FF8800] text-white flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,94,30,0.6)]">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Message Sent Successfully!</h4>
                  <p className="text-xs sm:text-sm text-text-muted mt-1.5 leading-relaxed">
                    Thank you! Our Bengaluru production desk will reach out via WhatsApp / Call within minutes.
                  </p>
                  {referenceId && (
                    <div className="mt-3 inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-primary font-mono">
                      Ref: {referenceId}
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-glow-dark px-6 py-2.5 rounded-full text-xs font-bold uppercase cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Error Banner */}
                {submitError && (
                  <div className="mb-5 p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn shadow-lg">
                    <span className="material-symbols-outlined text-red-400 text-lg shrink-0 mt-0.5">error</span>
                    <div className="flex-1">
                      <div className="font-bold text-red-300">Submission Notice</div>
                      <div className="text-xs text-red-200/90 mt-0.5 leading-relaxed">{submitError}</div>
                    </div>
                  </div>
                )}

                {/* Skeleton during initial client-mount to prevent SSR extension mismatches */}
                {!mounted ? (
                  <div className="space-y-4 py-2 animate-pulse" aria-hidden="true">
                    <div className="h-12 rounded-xl bg-surface-base border border-border-specular/40" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="h-12 rounded-xl bg-surface-base border border-border-specular/40" />
                      <div className="h-12 rounded-xl bg-surface-base border border-border-specular/40" />
                    </div>
                    <div className="h-12 rounded-xl bg-surface-base border border-border-specular/40" />
                    <div className="h-28 rounded-xl bg-surface-base border border-border-specular/40" />
                    <div className="h-14 rounded-full bg-primary-container/40" />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Anti-spam honeypot */}
                    <input
                      type="text"
                      name="website_trap"
                      value={formData.website_trap}
                      onChange={handleChange}
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />

                    {/* Field 1: Full Name */}
                    <div>
                      <label htmlFor="booking-fullName" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-primary-container">*</span>
                      </label>
                      <input
                        id="booking-fullName"
                        type="text"
                        name="fullName"
                        required
                        placeholder="e.g. Sravanthi Reddy"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-[#09080b] border ${
                          formErrors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                        } text-white placeholder:text-text-muted/40 text-sm focus:outline-none transition-colors`}
                      />
                      {formErrors.fullName && (
                        <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.fullName}</p>
                      )}
                    </div>

                    {/* Fields 2 & 3: Email Address & Phone Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="booking-email" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                          Email Address <span className="text-primary-container">*</span>
                        </label>
                        <input
                          id="booking-email"
                          type="email"
                          name="email"
                          required
                          placeholder="e.g. sravanthi@gmail.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl bg-[#09080b] border ${
                            formErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                          } text-white placeholder:text-text-muted/40 text-sm focus:outline-none transition-colors`}
                        />
                        {formErrors.email && (
                          <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="booking-phone" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                          Phone Number <span className="text-primary-container">*</span>
                        </label>
                        <input
                          id="booking-phone"
                          type="tel"
                          name="phone"
                          required
                          placeholder="e.g. 9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl bg-[#09080b] border ${
                            formErrors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                          } text-white placeholder:text-text-muted/40 text-sm focus:outline-none transition-colors`}
                        />
                        {formErrors.phone && (
                          <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Field 4: Subject / Shoot Type (Dropdown) */}
                    <div>
                      <label htmlFor="booking-subject" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Subject / Shoot Type <span className="text-primary-container">*</span>
                      </label>
                      <select
                        id="booking-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-[#09080b] border border-white/15 text-white text-sm focus:outline-none focus:border-primary-container transition-colors cursor-pointer"
                      >
                        {SUBJECT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#110e13] text-white py-1">
                            {opt}
                          </option>
                        ))}
                      </select>
                      {formErrors.subject && (
                        <p className="text-red-400 text-xs mt-1 font-medium">{formErrors.subject}</p>
                      )}
                    </div>

                    {/* Field 5: Your Message */}
                    <div>
                      <label htmlFor="booking-message" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                        Your Message <span className="text-primary-container">*</span>
                      </label>
                      <textarea
                        id="booking-message"
                        name="message"
                        rows={4}
                        required
                        placeholder="Tell us about your event, location, date, and specific requirements..."
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-[#09080b] border ${
                          formErrors.message ? 'border-red-500 ring-1 ring-red-500' : 'border-white/15 focus:border-primary-container'
                        } text-white placeholder:text-text-muted/40 text-sm focus:outline-none transition-colors resize-y`}
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

                    <p className="text-center text-[11px] text-text-muted/70 pt-1">
                      By submitting, you agree to our{' '}
                      <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link> and{' '}
                      <Link href="/terms" className="underline hover:text-white">Terms of Service</Link>.
                    </p>
                  </form>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
