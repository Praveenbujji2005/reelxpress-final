'use client';

import React from 'react';

// Star path for crisp SVG rendering matching the project's accent color
const STAR_PATH =
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

/**
 * TestimonialCard Component
 *
 * Glassmorphic testimonial review card matching ReelXpress design system:
 * - Fixed width (~340px, responsive on mobile)
 * - Semi-transparent background with subtle border & backdrop blur
 * - 5-star rating in the brand accent color (#ff6d29)
 * - Quote text in bold white
 * - Name in bold, role in smaller accent-colored text beneath
 * - Subtle hover lift & amber glow
 */
export default function TestimonialCard({ name, role, quote, review, rating = 5 }) {
  const displayText = (quote || review || '').trim();

  return (
    <article
      className="w-full max-w-[380px] md:w-[323px] min-h-[200px] shrink-0 rounded-2xl bg-[#110e13] border border-white/10 p-4 sm:p-5 md:p-6 flex flex-col justify-between cursor-default select-none mx-auto"
    >
      <div>
        {/* 5-Star Rating in Brand Accent Color */}
        <div
          className="flex items-center gap-1 text-primary-container mb-3.5 origin-left"
          aria-label={`${rating} out of 5 stars`}
        >
          {[...Array(Math.max(1, Math.min(5, Number(rating) || 5)))].map((_, i) => (
            <svg
              key={i}
              className="w-4 h-4 fill-[#ff6d29] text-[#ff6d29] drop-shadow-[0_0_6px_rgba(255,109,41,0.35)]"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d={STAR_PATH} />
            </svg>
          ))}
        </div>

        {/* Quote in Bold White Text */}
        <p className="text-text-primary font-bold text-[13.5px] xs:text-sm sm:text-[15px] md:text-base leading-relaxed mb-4 sm:mb-6">
          &ldquo;{displayText}&rdquo;
        </p>
      </div>

      {/* Author Details: Name in bold, Role in smaller accent color */}
      <div className="pt-3.5 sm:pt-4 border-t border-border-specular/40 flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-text-primary font-bold text-xs sm:text-sm md:text-base leading-snug truncate">
            {name}
          </div>
          <div className="text-primary text-[11px] sm:text-xs md:text-sm font-medium leading-snug mt-0.5 truncate">
            {role}
          </div>
        </div>

        {/* Quote mark glyph pill */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container flex items-center justify-center text-primary-container border border-border-specular/40 shrink-0">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#ff6d29]" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </div>
      </div>
    </article>
  );
}
