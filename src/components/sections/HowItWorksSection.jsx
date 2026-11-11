'use client';

import { HOW_IT_WORKS_STEPS } from '@/lib/data';

// 5-step frictionless workflow from booking to instant delivery with animated energy line
export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-space-2xl px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto">
      <div className="reveal-on-scroll text-center max-w-2xl mx-auto mb-16">
        <span className="text-primary text-label-md font-label-md uppercase tracking-wider block mb-2 font-bold">
          Frictionless Workflow
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-headline-lg text-text-primary">
          <span>How </span>
          <img
            src="/brand/reelxpress-wordmark-white-hd.png"
            alt="ReelXpress"
            className="inline-block h-[0.92em] sm:h-[1.0em] w-auto object-contain align-middle mx-1.5 drop-shadow-[0_0_14px_rgba(255,109,41,0.4)]"
          />
          <span> Works</span>
        </h2>
        <p className="text-body-md font-body-md text-text-muted mt-3">
          From booking to delivery in 5 simple steps — getting scroll-stopping content has never been easier.
        </p>
      </div>

      <div className="relative">
        {/* Connecting Energy Beam for Desktop */}
        <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-[2px] bg-border-specular/30 -translate-y-1/2 z-0 overflow-hidden pointer-events-none">
          <div className="energy-beam" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
          {HOW_IT_WORKS_STEPS.map((stepItem) => (
            <div
              key={stepItem.step}
              className={`reveal-on-scroll spotlight-card p-5 sm:p-5.5 rounded-2xl ${
                stepItem.isHighlight
                  ? 'bg-surface-glass-tinted border border-border-amber shadow-[0_0_20px_rgba(255,109,41,0.15)]'
                  : 'bg-[#161217] border border-border-specular hover:border-border-amber'
              } hover:-translate-y-2 transition-all duration-300 group ${stepItem.delayClass}`}
            >
              <div
                className={`text-label-sm font-label-sm ${
                  stepItem.isHighlight ? 'text-primary-container' : 'text-primary'
                } uppercase tracking-widest font-bold mb-3 flex items-center justify-between`}
              >
                <span>{stepItem.step}</span>
                {stepItem.isHighlight ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container rec-indicator shadow-[0_0_8px_#ff6d29]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-primary-container group-hover:scale-150 transition-transform" />
                )}
              </div>
              <h4 className="text-title-md font-title-md text-text-primary mb-2 group-hover:text-primary transition-colors">
                {stepItem.title}
              </h4>
              <p className="text-body-sm font-body-sm text-text-muted leading-relaxed">
                {stepItem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
