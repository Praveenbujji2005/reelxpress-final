import Link from 'next/link';
import { BLOG_POSTS } from '@/data/blogPosts';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Icon from '@/components/ui/Icon';

export const metadata = {
  title: 'Blog & Production Insights | reelXpress',
  description:
    'Curated production insights, pricing breakdowns, and trend reports on mobile vertical video, event videography, and instant reel delivery.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog & Production Insights | reelXpress',
    description:
      'Curated production insights, pricing breakdowns, and trend reports on mobile vertical video and instant reels.',
    url: '/blog',
    siteName: 'reelXpress',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'reelXpress Blog',
      },
    ],
  },
};

export default function BlogHubPage() {
  return (
    <>
      <Navbar />

      <main className="relative z-10 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-margin max-w-[1440px] mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-text-muted">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="text-white font-medium" aria-current="page">
              Blog
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="text-[#F28C3C] text-xs sm:text-sm font-bold uppercase tracking-widest block mb-2">
            INDUSTRY INSIGHTS
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Vertical Storytelling &amp; Production Insights
          </h1>
          <p className="text-base sm:text-lg text-text-muted mt-4 leading-relaxed">
            Expert breakdowns on pricing, gear, wedding trends, and on-demand mobile videography across Bengaluru.
          </p>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {BLOG_POSTS.map((post) => (
            <article
              key={post.id}
              className="rounded-2xl bg-[#130f14]/90 border border-white/10 p-6 sm:p-7 flex flex-col justify-between hover:border-[#F28C3C]/50 hover:-translate-y-1 transition-all duration-300 shadow-lg group"
            >
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-[#F28C3C] text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/10">
                  {post.tag}
                </span>
                <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#F28C3C] transition-colors leading-snug">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-sm text-text-muted leading-relaxed mb-6 font-normal">
                  {post.description}
                </p>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-[#F28C3C] font-bold text-sm hover:underline group-hover:translate-x-1 transition-transform"
              >
                <span>Read article</span>
                <Icon name="arrow_forward" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
