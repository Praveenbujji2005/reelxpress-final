'use client';

import { useState, useEffect } from 'react';
import { BLOG_POSTS } from '@/lib/data';

// Blog preview section with in-app reading experience
export default function BlogSection() {
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    if (selectedPost) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setSelectedPost(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = prevOverflow || '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedPost]);

  return (
    <section className="py-16 md:py-space-2xl px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto scroll-mt-20 md:scroll-mt-28" id="blog">
      <div className="reveal-on-scroll flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <span className="text-primary text-label-md font-label-md uppercase tracking-wider block mb-2 font-bold">
            Industry Insights
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-headline-lg text-text-primary">
            From the Blog
          </h2>
        </div>

        <a
          href="#blog"
          className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-semibold transition-colors group cursor-pointer text-title-md"
        >
          <span>Curated Reels &amp; Production Insights</span>
          <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
            arrow_downward
          </span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.id}
            className="reveal-on-scroll spotlight-card rounded-2xl bg-[#110e13] border border-white/10 p-5 md:p-7 flex flex-col justify-between hover:border-border-amber transition-all duration-300 hover:-translate-y-2 group"
          >
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-surface-container text-primary text-label-sm font-bold uppercase tracking-wider mb-4 border border-border-specular/40">
                {post.tag}
              </span>
              <h3 className="text-title-lg font-title-lg text-text-primary font-bold mb-3 group-hover:text-primary transition-colors leading-snug">
                {post.title}
              </h3>
              <p className="text-body-md text-text-muted leading-relaxed mb-6">
                {post.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPost(post)}
              className="inline-flex items-center gap-1 text-primary-container font-semibold text-title-md hover:underline cursor-pointer group-hover:translate-x-1 transition-transform"
            >
              <span>Read Summary</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </article>
        ))}
      </div>

      {/* In-App Blog Reader Lightbox Modal */}
      {selectedPost && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[100030] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity"
          role="dialog"
          aria-modal="true"
          aria-labelledby="blog-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPost(null);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface-base border border-border-amber p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-border-specular pb-4">
              <span className="px-3 py-1 rounded-full bg-surface-container text-primary text-xs font-bold uppercase tracking-wider">
                {selectedPost.tag}
              </span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high border border-border-specular flex items-center justify-center text-text-muted hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div>
              <h3 id="blog-modal-title" className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                {selectedPost.title}
              </h3>
              <p className="text-base text-text-muted leading-relaxed mb-6">
                {selectedPost.summary || selectedPost.description}
              </p>

              {selectedPost.takeaways && selectedPost.takeaways.length > 0 && (
                <div className="p-5 rounded-2xl bg-surface-container/60 border border-border-specular text-sm text-text-primary leading-relaxed space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">lightbulb</span>
                    <span>Key Takeaways</span>
                  </div>
                  <ul className="space-y-2">
                    {selectedPost.takeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-text-muted">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-specular">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-muted hover:text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <a
                href="#booking"
                onClick={() => setSelectedPost(null)}
                className="btn-shine-sweep btn-ripple inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-container text-white font-bold text-sm shadow-[0_0_20px_rgba(255,109,41,0.5)] cursor-pointer"
              >
                <span>Book This Format</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
