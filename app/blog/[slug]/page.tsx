import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock,
  Share2,
  Sparkles,
  Tag,
} from 'lucide-react'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { BlogHeader } from '@/components/blog-header'
import { BlogFooter } from '@/components/blog-footer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article Not Found — Beach Dog Marketing',
    }
  }

  return {
    title: `${post.title} — Beach Dog Playbook`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllPosts()
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#102832] selection:bg-[#f76f5f] selection:text-white">
      <BlogHeader />

      <main className="mx-auto max-w-[860px] px-6 py-10 lg:px-8 lg:py-16">
        {/* Back navigation & breadcrumbs */}
        <nav className="mb-8 flex items-center justify-between text-xs text-[#102832]/60">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 font-bold text-[#102832] transition-colors hover:text-[#f76f5f]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to all entries
          </Link>
          <div className="hidden sm:flex sm:items-center sm:gap-2 font-mono">
            <span>Playbook</span>
            <span>/</span>
            <span className="text-[#f76f5f] truncate max-w-[240px]">{post.title}</span>
          </div>
        </nav>

        {/* Article Header */}
        <header className="border-b border-[#102832]/10 pb-10">
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-[#f76f5f]/10 px-3 py-1 font-mono text-xs font-bold text-[#f76f5f]"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-[#102832] sm:text-5xl lg:text-[54px]">
            {post.title}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-[#102832]/75 sm:text-xl">
            {post.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#102832]/8 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#173842] font-mono text-sm font-bold text-[#76e1d3] shadow-sm">
                BD
              </div>
              <div>
                <p className="text-sm font-bold text-[#102832]">{post.author}</p>
                <p className="font-mono text-xs text-[#102832]/55">{post.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs text-[#102832]/60">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
            </div>
          </div>
        </header>

        {/* Hero image */}
        {post.coverImage && (
          <div className="my-10 aspect-[16/9] w-full overflow-hidden rounded-[24px] border border-[#102832]/10 bg-[#173842] shadow-[0_16px_40px_rgba(16,40,50,0.08)]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Article Body Content */}
        <article
          className="prose-blog mt-10"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Share & Feedback Row */}
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#102832]/10 bg-white/70 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#f76f5f]" />
            <div>
              <p className="text-sm font-bold text-[#102832]">Enjoyed this strategy breakdown?</p>
              <p className="text-xs text-[#102832]/60">
                Share it with fellow business owners and marketers.
              </p>
            </div>
          </div>
          <Link
            href="/blog"
            className="rounded-full border border-[#102832]/20 bg-white px-4 py-2 text-xs font-bold transition-all hover:bg-[#102832] hover:text-white"
          >
            Explore More Tactics →
          </Link>
        </div>

        {/* Next / Previous Post Navigation */}
        <div className="mt-12 grid gap-4 border-t border-[#102832]/10 pt-10 sm:grid-cols-2">
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-[#102832]/10 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#102832]/50 group-hover:text-[#f76f5f]">
                <ArrowLeft className="h-3 w-3" /> Previous Entry
              </span>
              <p className="mt-2 line-clamp-2 font-display text-base font-bold text-[#102832] group-hover:text-[#f76f5f]">
                {prevPost.title}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-[#102832]/10 bg-white p-5 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex items-center justify-end gap-1 text-xs font-bold text-[#102832]/50 group-hover:text-[#f76f5f]">
                Next Entry <ArrowRight className="h-3 w-3" />
              </span>
              <p className="mt-2 line-clamp-2 font-display text-base font-bold text-[#102832] group-hover:text-[#f76f5f]">
                {nextPost.title}
              </p>
            </Link>
          )}
        </div>

        {/* Bottom CTA Card */}
        <section className="mt-16 overflow-hidden rounded-[28px] border border-[#102832]/10 bg-[#173842] p-8 text-white shadow-xl sm:p-10">
          <div className="mx-auto max-w-xl text-center">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#76e1d3]">
              Level Up Your Marketing
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Want a playable campaign tailored to your business?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              We design and manage high-converting viral playables and leaderboards for brands looking to stand out.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/#contact"
                className="rounded-full bg-[#f76f5f] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#e95d4d]"
              >
                Book a Strategy Call <ArrowUpRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BlogFooter />
    </div>
  )
}
