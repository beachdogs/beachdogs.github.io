import Link from 'next/link'
import { ArrowUpRight, Waves } from 'lucide-react'

export function BlogHeader() {
  return (
    <header className="relative z-20 border-b border-[#102832]/8 bg-[#f8f6f0]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="logo" aria-label="Beach Dog Marketing home">
          <span className="logo-mark">
            <Waves aria-hidden="true" />
          </span>
          <span>
            Beach Dog
            <br />
            <i>Marketing</i>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#solutions"
            className="text-sm font-bold tracking-tight text-[#102832]/70 transition-colors hover:text-[#f76f5f]"
          >
            Solutions
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-bold tracking-tight text-[#102832]/70 transition-colors hover:text-[#1aa89a]"
          >
            How it works
          </Link>
          <Link
            href="/#results"
            className="text-sm font-bold tracking-tight text-[#102832]/70 transition-colors hover:text-[#d89a12]"
          >
            Results
          </Link>
          <Link
            href="/blog"
            className="text-sm font-bold tracking-tight text-[#f76f5f]"
          >
            Blog &amp; Playbook
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#contact"
            className="rounded-full bg-[#f76f5f] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#e95d4d] sm:text-sm"
          >
            Book a demo <ArrowUpRight className="ml-1 inline h-4 w-4" />
          </Link>
        </div>
      </nav>
    </header>
  )
}
