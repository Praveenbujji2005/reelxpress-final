'use client';

import { useState, useCallback } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// Layout Components
import Navbar from '@/components/layout/Navbar';
import MobileMenu from '@/components/layout/MobileMenu';
import Footer from '@/components/layout/Footer';

// Section Components
import HeroSection from '@/components/sections/HeroSection';
import PricingSection from '@/components/sections/PricingSection';
import BrandTicker from '@/components/sections/BrandTicker';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import BlogSection from '@/components/sections/BlogSection';
import FaqSection from '@/components/sections/FaqSection';
import BookingSection from '@/components/sections/BookingSection';

// Modal & UI Feedback Components
import BookingModal from '@/components/ui/BookingModal';
import ToastNotification from '@/components/ui/ToastNotification';

export default function HomePage() {
  // Activate scroll-triggered fade and slide transitions
  useScrollReveal();

  // Navigation and Modal States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'check_circle',
  });

  // Display a temporary feedback toast with auto-hide timer
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

  // Handle successful submission from the quick booking form
  const handleBookingSuccess = useCallback((details) => {
    setConfirmedBooking(details);
    setIsBookingModalOpen(true);
  }, []);

  return (
    <>
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

      {/* Main Page Content Flow */}
      <main className="relative z-10 flex-1">
        <HeroSection
          onShowToast={showToast}
        />
        <PricingSection />
        <BrandTicker />
        <TestimonialsSection />
        <BlogSection />
        <FaqSection />
        <BookingSection onBookingSuccess={handleBookingSuccess} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Booking Confirmation Celebration Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        bookingDetails={confirmedBooking}
        onClose={() => setIsBookingModalOpen(false)}
      />

      {/* System Toast Notification */}
      <ToastNotification toast={toast} />
    </>
  );
}
