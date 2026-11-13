'use client';

import React from 'react';
import Link from 'next/link';
import { BLOG_POSTS } from '@/data/blogPosts';
import Icon from '@/components/ui/Icon';

// Blog preview section with direct links to real article pages
export default function BlogSection() {
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

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-primary hover:text-primary-container font-semibold transition-colors group cursor-pointer text-title-md"
        >
          <span>Curated Reels &amp; Production Insights</span>
          <Icon name="arrow_forward" size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
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
                <Link href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h3>
              <p className="text-body-md text-text-muted leading-relaxed mb-6 font-normal">
                {post.description}
              </p>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 text-[#F28C3C] font-semibold text-title-md hover:underline cursor-pointer group-hover:translate-x-1 transition-transform"
            >
              <span>Read article</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
