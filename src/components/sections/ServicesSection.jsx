'use client';

import { WHY_REELXPRESS_DATA } from '@/lib/data';

// "Why ReelXpress?" Section: The high-speed edge for your vertical storytelling
export default function ServicesSection() {
  return (
    <section className="py-16 md:py-space-2xl px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28" id="services">
      <div className="reveal-on-scroll text-center max-w-2xl mx-auto mb-16">
        <span className="text-primary text-label-md font-label-md uppercase tracking-wider block mb-2 font-bold">
          The Advantage
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-headline-lg text-text-primary">
          <span>Why </span>
          <span className="inline-flex items-center align-middle whitespace-nowrap">
            <img
              src="/brand/reelxpress-wordmark-white-hd.png"
              alt="ReelXpress"
              className="inline-block h-[0.92em] sm:h-[1.0em] w-auto object-contain drop-shadow-[0_0_14px_rgba(255,109,41,0.4)]"
            />
            <span>?</span>
          </span>
        </h2>
        <p className="text-body-md font-body-md text-text-muted mt-3">
          The high-speed edge for your vertical storytelling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WHY_REELXPRESS_DATA.map((item) => (
          <div
            key={item.title}
            className={`reveal-on-scroll spotlight-card p-6 sm:p-7 rounded-2xl bg-[#161217] border border-border-specular hover:border-border-amber transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] ${item.delayClass}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-surface-glass-tinted border border-border-amber flex items-center justify-center text-primary-container group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,109,41,0.5)] transition-all duration-300">
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-bold tracking-widest uppercase">
                {item.badge}
              </span>
            </div>

            <h3 className="text-title-lg font-title-lg text-text-primary mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-body-md font-body-md text-text-muted leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
