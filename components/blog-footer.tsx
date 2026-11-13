import Link from 'next/link'
import { Waves } from 'lucide-react'

export function BlogFooter() {
  return (
    <footer className="border-t border-[#102832]/10 bg-[#f8f6f0] text-xs text-[#102832]/65">
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row lg:px-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="logo scale-90" aria-label="Beach Dog Marketing home">
            <span className="logo-mark">
              <Waves aria-hidden="true" />
            </span>
            <span>
              Beach Dog
              <br />
              <i>Marketing</i>
            </span>
          </Link>
          <span className="text-[#102832]/30">|</span>
          <span>© {new Date().getFullYear()} Beach Dog Marketing</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Link href="/" className="transition-colors hover:text-[#f76f5f]">
            Home
          </Link>
          <Link href="/blog" className="transition-colors hover:text-[#f76f5f]">
            Blog &amp; Playbook
          </Link>
          <Link href="/feed.xml" className="transition-colors hover:text-[#f76f5f]">
            RSS Feed
          </Link>
          <Link href="/#contact" className="transition-colors hover:text-[#f76f5f]">
            Contact
          </Link>
        </div>

        <div>
          <span>Rooted in Pacifica, CA. Made for local businesses with big energy.</span>
        </div>
      </div>
    </footer>
  )
}
