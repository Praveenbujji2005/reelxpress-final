import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOG_POSTS, getBlogPostBySlug, getAllBlogSlugs } from '@/data/blogPosts';
import { SITE_CONFIG, SITE_URL } from '@/config/site';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Icon from '@/components/ui/Icon';

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | reelXpress',
      description: 'The requested article could not be found.',
    };
  }

  return {
    title: `${post.title} | reelXpress`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | reelXpress`,
      description: post.description,
      url: `/blog/${post.slug}`,
      siteName: SITE_CONFIG.name,
      locale: 'en_IN',
      type: 'article',
      publishedTime: post.publishedDate,
      authors: [SITE_CONFIG.name],
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | reelXpress`,
      description: post.description,
      images: ['/og-image.png'],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Article Structured Data (JSON-LD)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedDate,
    dateModified: post.publishedDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    image: [`${SITE_URL}/og-image.png`],
    author: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/brand/icon-gold.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Navbar />

      <main className="relative z-10 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-margin max-w-4xl mx-auto min-h-screen">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-text-muted flex-wrap">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li>/</li>
            <li className="text-white/80 font-medium truncate max-w-[240px] sm:max-w-md" aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="mb-10 sm:mb-12 border-b border-white/10 pb-8 sm:pb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#F28C3C] text-xs font-bold uppercase tracking-wider">
              {post.tag}
            </span>
            <time dateTime={post.publishedDate} className="text-xs text-text-muted font-medium">
              {new Date(post.publishedDate).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>

          {/* Single H1 on page */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.2] mb-6">
            {post.title}
          </h1>

          {/* Intro paragraph from verified summary */}
          <p className="text-base sm:text-xl text-white/85 leading-relaxed font-normal">
            {post.summary}
          </p>
        </header>

        {/* Key Takeaways Section */}
        {post.takeaways && post.takeaways.length > 0 && (
          <section className="p-6 sm:p-8 rounded-2xl bg-[#1E1B1F] border border-white/10 mb-12 shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Icon name="bolt" size={20} className="text-[#F28C3C]" />
              <span>Key Takeaways</span>
            </h2>
            <ul className="space-y-3 text-sm sm:text-base text-text-muted leading-relaxed">
              {post.takeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Icon name="check_circle" size={18} className="text-[#F28C3C] shrink-0 mt-1" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Editorial Body Content Area with Clearly Marked TODO Placeholder */}
        <section className="prose prose-invert max-w-none space-y-6 text-text-muted text-base sm:text-lg leading-relaxed mb-14">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 border-dashed text-center">
            <Icon name="edit" size={28} className="text-[#F28C3C] mx-auto mb-2" />
            <h3 className="text-white font-bold text-lg mb-1">
              Editorial Article Body Pending
            </h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
              {/* TODO: Add full verified editorial article body text without inventing statistics or prices. */}
              {post.todoNote}
            </p>
          </div>
        </section>

        {/* Primary CTA to Book */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1E1B1F] to-[#151215] border border-white/15 text-center shadow-2xl relative overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[rgba(242,140,60,0.12)] blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight relative z-10">
            Ready to shoot your vertical reel?
          </h2>
          <p className="text-sm sm:text-base text-text-muted max-w-md mx-auto mb-6 relative z-10">
            Book professional iPhone cinematography across Bengaluru. Delivered directly to your device within minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              href="/#booking"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#F28C3C] to-[#DC6A2C] text-white font-extrabold text-sm uppercase tracking-wider shadow-[0_4px_20px_rgba(242,140,60,0.4)] hover:brightness-110 active:scale-95 transition-all text-center"
            >
              Book Your Reel
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all text-center"
            >
              Contact Team
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
