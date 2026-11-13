import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpen, Calendar, Clock, Flame, Sparkles } from 'lucide-react'
import { getAllPosts, getAllTags } from '@/lib/blog'
import { BlogHeader } from '@/components/blog-header'
import { BlogFooter } from '@/components/blog-footer'

export const metadata: Metadata = {
  title: 'Blog & Playbook — Beach Dog Marketing',
  description:
    'Field notes, conversion teardowns, and gamification strategies to turn passive scrollers into passionate regulars.',
  openGraph: {
    title: 'Beach Dog Marketing Blog & Playbook',
    description:
      'Field notes, conversion teardowns, and gamification strategies to turn passive scrollers into passionate regulars.',
    type: 'website',
  },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()
  const tags = getAllTags()
  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-[#f8f6f0] text-[#102832] selection:bg-[#f76f5f] selection:text-white">
      <BlogHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#102832]/8 pb-16 pt-12 lg:pb-24 lg:pt-16">
        <div className="absolute inset-x-0 top-0 -z-0 h-[480px] bg-[radial-gradient(circle_at_80%_15%,rgba(118,225,211,0.2),transparent_35%),radial-gradient(circle_at_20%_0%,rgba(255,196,93,0.22),transparent_30%)]" />

        <div className="relative z-10 mx-auto max-w-[1240px] px-6 lg:px-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#102832]/15 bg-white/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#f76f5f]">
            <Sparkles className="h-3.5 w-3.5" />
            Insights, Playbooks &amp; Tactics
          </div>

          <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            The Beach Dog
            <br />
            <em className="font-serif font-normal italic text-[#f76f5f]">Playbook.</em>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#102832]/75 sm:text-xl">
            Strategies, teardowns, and psychological breakdowns on using playable campaigns, rivalries, and gamified marketing to win loyal regulars.
          </p>

          {/* Tags list */}
          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#102832]/50">
                Topics:
              </span>
              {tags.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#102832]/10 bg-white/80 px-3 py-1 font-mono text-xs font-semibold text-[#102832]/75 transition-colors"
                >
                  #{tag} <span className="opacity-40">({count})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[1240px] px-6 py-12 lg:px-10 lg:py-16">
        {/* Featured Post Card */}
        {featuredPost && (
          <section className="mb-16">
            <div className="mb-6 flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#f76f5f]" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#f76f5f]">
                Featured Entry
              </span>
            </div>

            <article className="group relative overflow-hidden rounded-[28px] border border-[#102832]/12 bg-white shadow-[0_16px_40px_rgba(16,40,50,0.06)] transition-all hover:shadow-[0_24px_50px_rgba(16,40,50,0.12)]">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                {featuredPost.coverImage && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#173842] lg:col-span-7">
                    <Link href={`/blog/${featuredPost.slug}`} className="block h-full w-full">
                      <img
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                )}

                <div className={`p-6 sm:p-8 ${featuredPost.coverImage ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f76f5f]/10 px-2.5 py-0.5 font-mono text-xs font-bold text-[#f76f5f]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#102832] transition-colors group-hover:text-[#f76f5f] sm:text-3xl">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="mt-4 text-base leading-relaxed text-[#102832]/70">
                    {featuredPost.summary}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#102832]/8 pt-5 text-xs text-[#102832]/60">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {featuredPost.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {featuredPost.readTime}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 font-bold text-[#f76f5f] transition-transform group-hover:translate-x-1"
                    >
                      Read entry <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Other Posts Grid */}
        {otherPosts.length > 0 && (
          <section>
            <div className="mb-8 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#1aa89a]" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#1aa89a]">
                All Playbook Entries
              </span>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {otherPosts.map((post) => (
                <article
                  key={post.slug}
                  className="group flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#102832]/10 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    {post.coverImage && (
                      <Link href={`/blog/${post.slug}`} className="mb-5 block aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#173842]">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </Link>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#102832]/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#102832]/75"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="mt-3 font-display text-xl font-bold tracking-tight text-[#102832] transition-colors group-hover:text-[#f76f5f]">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#102832]/70">
                      {post.summary}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#102832]/8 pt-4 text-xs text-[#102832]/55">
                    <span>{post.readTime}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="font-bold text-[#f76f5f] transition-transform group-hover:translate-x-1"
                    >
                      Read entry →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Block */}
        <section className="mt-20 overflow-hidden rounded-[32px] border border-[#102832]/10 bg-[#173842] p-8 text-white shadow-xl sm:p-12 lg:p-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow text-[#76e1d3]">Ready to Play?</span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Turn your customers into your next viral campaign.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
              Get a custom interactive mini-game or rivalry leaderboard running for your brand. Built for high conversion, social sharing, and real foot traffic.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/#contact"
                className="rounded-full bg-[#f76f5f] px-7 py-3.5 text-center text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#e95d4d]"
              >
                Book a Demo <ArrowUpRight className="ml-1.5 inline h-4 w-4" />
              </Link>
              <Link
                href="/#demo"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-center text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                Explore Live Mechanics
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BlogFooter />
    </div>
  )
}
