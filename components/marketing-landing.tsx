'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, BarChart3, ChevronDown, Flame, MousePointer2, Play, Share2, Sparkles, Trophy, Zap } from 'lucide-react'

const mechanics = [
  {
    number: '01',
    title: 'Viral acquisition loops',
    description: 'Turn discounts into earned status. Every move gives customers a reason to share, return, and bring a friend.',
    tag: 'Dynamic leaderboard',
    icon: Share2,
    color: 'coral',
  },
  {
    number: '02',
    title: 'High-LTV retention engines',
    description: 'Keep your best customers engaged and buying daily to protect their perks and their place at the top.',
    tag: 'King of the hill',
    icon: Trophy,
    color: 'aqua',
  },
  {
    number: '03',
    title: 'Flash conversion boosters',
    description: 'Turn abandoned carts into instant purchases with high-urgency, skill-based discounts.',
    tag: 'Speed runs',
    icon: Zap,
    color: 'yellow',
  },
  {
    number: '04',
    title: 'Community amplifiers',
    description: 'Leverage your customers’ networks to bring in thousands of new leads without extra ad spend.',
    tag: 'Bracket tournaments',
    icon: Flame,
    color: 'lavender',
  },
]

const navItems = [
  { href: '#solutions', label: 'Solutions', color: '#f76f5f' },
  { href: '#how-it-works', label: 'How it works', color: '#1aa89a' },
  { href: '#results', label: 'Results', color: '#d89a12' },
]

const initialPlayers = [
  ['01', 'Maya R.', '12,480 pts', 'gold'],
  ['02', 'The Coffee Club', '11,920 pts', 'silver'],
  ['03', 'Jake’s Bikes', '9,840 pts', 'bronze'],
  ['04', 'Rosa’s Kitchen', '8,210 pts', 'plain'],
]

export function MarketingLanding() {
  const [activeMechanic, setActiveMechanic] = useState(0)
  const [played, setPlayed] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [activeNav, setActiveNav] = useState(0)
  const [playbookInView, setPlaybookInView] = useState(false)
  const playbookRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setNavOpen(true), 350)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const node = playbookRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setPlaybookInView(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35, 0.6] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playbookInView) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      setActiveMechanic((current) => (current + 1) % mechanics.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [playbookInView])

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f6f0] text-[#102832] selection:bg-[#f76f5f] selection:text-white">
      <div className="absolute inset-x-0 top-0 -z-0 h-[720px] bg-[radial-gradient(circle_at_75%_10%,rgba(118,225,211,0.2),transparent_24%),radial-gradient(circle_at_15%_0%,rgba(255,196,93,0.22),transparent_22%)]" />
      <nav className="relative z-10 mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="Beach Dog Marketing home">
          <img src="/wave_logo.jpg" alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.12em]">Beach Dog<br /><span className="text-[#f76f5f]">Marketing</span></span>
        </a>
        <div className={`nav-3d hidden md:block ${navOpen ? 'is-open' : ''}`}>
          <div className="nav-3d-stage">
            <ul className="nav-3d-list">
              {navItems.map((item, index) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="nav-3d-link"
                    style={activeNav === index ? { color: item.color } : undefined}
                    onMouseEnter={() => setActiveNav(index)}
                    onFocus={() => setActiveNav(index)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <a href="#contact" className="rounded-full border border-[#102832]/20 bg-white/50 px-5 py-2.5 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:bg-[#102832] hover:text-white">Book a demo <ArrowUpRight className="ml-1 inline h-4 w-4" /></a>
      </nav>

      <section id="top" className="relative z-10 mx-auto grid max-w-[1240px] items-center gap-12 px-6 pb-24 pt-14 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#102832]/15 bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em]"><span className="h-2 w-2 rounded-full bg-[#f76f5f]" /> Marketing that plays to win</div>
          <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-6xl lg:text-[78px]">Make your<br /><em className="font-serif font-normal text-[#f76f5f]">customers</em><br />the campaign.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-[#102832]/70">We help local businesses turn passive scrollers into loyal regulars with playful, high-converting marketing experiences.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#contact" className="rounded-full bg-[#f76f5f] px-7 py-4 text-center text-sm font-bold text-white shadow-[0_8px_20px_rgba(247,111,95,0.24)] transition-all hover:-translate-y-1 hover:bg-[#e95d4d]">Launch a campaign <ArrowUpRight className="ml-2 inline h-4 w-4" /></a>
            <a href="#demo" className="rounded-full border border-[#102832]/20 bg-white/40 px-7 py-4 text-center text-sm font-bold transition-all hover:-translate-y-1 hover:border-[#102832]">See it in action <Play className="ml-2 inline h-4 w-4 fill-current" /></a>
          </div>
          <div className="mt-12 flex items-center gap-4 text-sm text-[#102832]/55"><div className="flex -space-x-2"><span className="avatar bg-[#e4a48f]">JR</span><span className="avatar bg-[#9bd8d3]">MK</span><span className="avatar bg-[#f4c55e]">AL</span></div><span>Built for the businesses<br />people root for.</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[500px]" id="demo">
          <div className="absolute -right-4 -top-7 z-20 rotate-6 rounded-2xl bg-[#f4c55e] px-4 py-3 font-mono text-xs font-bold shadow-lg">YOUR NEXT<br />REGULAR IS HERE ↘</div>
          <div className="rounded-[28px] border border-[#102832]/10 bg-[#173842] p-4 shadow-[0_24px_60px_rgba(16,40,50,0.2)] sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 text-white"><div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#76e1d3]">Live campaign</p><h2 className="mt-1 text-xl font-bold">Sunset Sips Showdown</h2></div><span className="rounded-full bg-[#f76f5f] px-3 py-1 text-[10px] font-bold uppercase">Live</span></div>
            <div className="mt-5 rounded-2xl bg-[#224c56] p-5 text-white"><div className="flex items-center justify-between text-xs text-white/60"><span>Daily speed run</span><span className="font-mono text-[#f4c55e]">00:14:22</span></div><div className="mt-5 flex items-center justify-center"><button aria-label="Play campaign demo" onClick={() => setPlayed(!played)} className={`relative flex h-36 w-36 items-center justify-center rounded-full border-2 border-dashed border-[#76e1d3] transition-transform ${played ? 'scale-105 bg-[#f76f5f]' : 'bg-[#173842] hover:scale-105'}`}><span className="absolute inset-3 rounded-full border border-white/10" /><span className="font-display text-4xl font-bold">{played ? '42' : 'GO'}</span></button></div><p className="mt-4 text-center text-xs text-white/55">{played ? 'Nice! You just earned 840 points.' : 'Tap to see how fast your customers play.'}</p></div>
            <div className="mt-4 flex items-center justify-between px-1 text-xs text-white/45"><span>Top players today</span><span className="text-[#76e1d3]">View all →</span></div>
            <div className="mt-2 space-y-2">{initialPlayers.slice(0, 3).map(([rank, name, points, medal]) => <div key={rank} className="flex items-center justify-between rounded-xl bg-white/[0.07] px-3 py-2.5 text-sm text-white"><span className="flex items-center gap-3"><span className={`rank ${medal}`}>{rank}</span><span>{name}</span></span><span className="font-mono text-xs text-[#f4c55e]">{points}</span></div>)}</div>
          </div>
          <div className="absolute -bottom-8 -left-8 hidden rotate-[-8deg] rounded-2xl border border-[#102832]/10 bg-white px-4 py-3 shadow-xl sm:block"><p className="font-mono text-[10px] uppercase tracking-wider text-[#102832]/50">Players today</p><p className="mt-1 text-2xl font-bold">2,841 <span className="text-sm text-[#f76f5f]">+18%</span></p></div>
        </div>
      </section>

      <Results />

      <section id="solutions" className="relative mx-auto max-w-[1240px] px-6 py-24 lg:px-10 lg:py-32"><div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow">The playbook</p><h2 className="section-title mt-5">Your best<br /><em>marketing</em><br />should feel<br />like a game.</h2><p className="mt-7 max-w-sm leading-7 text-[#102832]/65">Static promotions get ignored. We build interactive campaigns that give people a reason to come back, bring friends, and buy now.</p><a href="#contact" className="mt-8 inline-block text-sm font-bold underline decoration-[#f76f5f] decoration-2 underline-offset-4">Find your growth engine <ArrowUpRight className="ml-1 inline h-4 w-4" /></a></div><div ref={playbookRef} className={`playbook grid gap-3 ${playbookInView ? 'is-live' : ''}`}>{mechanics.map((item, index) => { const Icon = item.icon; const open = activeMechanic === index; return <button key={item.number} onClick={() => setActiveMechanic(index)} aria-expanded={open} className={`playbook-item group text-left ${open ? 'is-open rounded-3xl bg-[#eaf3ee] p-5 sm:p-6' : 'border-b border-[#102832]/10 px-1 py-5'}`}><div className="flex items-start gap-4"><span className="pt-1 font-mono text-xs text-[#102832]/40">{item.number}</span><div className="flex-1"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-bold">{item.title}</h3><span className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-wider ${open ? 'bg-[#f76f5f] text-white' : 'bg-[#102832]/[0.06] text-[#102832]/55'}`}>{item.tag}</span></div><div className="playbook-copy"><div className="playbook-copy-inner"><p className="mt-3 max-w-lg leading-7 text-[#102832]/65">{item.description}</p></div></div></div><Icon className={`playbook-icon mt-1 h-5 w-5 shrink-0 ${open ? 'text-[#f76f5f]' : 'text-[#102832]/25 group-hover:text-[#f76f5f]'}`} /></div></button> })}</div></div></section>

      <section id="how-it-works" className="bg-[#dff2eb] px-6 py-24 lg:px-10"><div className="mx-auto max-w-[1240px]"><div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-end"><div><p className="eyebrow">The ripple effect</p><h2 className="section-title mt-5 max-w-xl">Small plays.<br /><em>Big waves.</em></h2></div><p className="max-w-sm leading-7 text-[#102832]/65">A 30-second daily challenge can create a week of social momentum for your business.</p></div><div className="mt-16 grid gap-5 md:grid-cols-3"><Step num="01" title="Capture attention" text="Give people something fun to do, not another discount to ignore." /><Step num="02" title="Reward the return" text="Turn every visit into progress, status, and a reason to come back tomorrow." /><Step num="03" title="Let it travel" text="Players share their score. Their friends join. Your reach compounds." /></div></div></section>

      <section id="contact" className="relative overflow-hidden bg-[#f76f5f] px-6 py-24 text-white lg:px-10 lg:py-28"><div className="absolute -right-12 -top-24 h-80 w-80 rounded-full border-[40px] border-white/10" /><div className="absolute -bottom-36 left-1/3 h-72 w-72 rounded-full border-[50px] border-white/10" /><div className="relative mx-auto flex max-w-[1240px] flex-col justify-between gap-12 lg:flex-row lg:items-end"><div><p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-white/70">Ready when you are</p><h2 className="mt-5 max-w-2xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl">Let’s make<br /><em className="font-serif font-normal">some waves.</em></h2></div><div className="w-full max-w-md"><p className="mb-5 text-white/80">Tell us where you want to grow and we’ll send over a few campaign ideas made for your business.</p>{submitted ? <div className="rounded-2xl bg-white px-5 py-4 font-semibold text-[#102832]">You’re on the list. We’ll be in touch soon.</div> : <form onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSubmitted(true) }} className="flex gap-2 rounded-full bg-white p-2"><label className="sr-only" htmlFor="email">Your email address</label><input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#102832] outline-none placeholder:text-[#102832]/45" /><button className="shrink-0 rounded-full bg-[#102832] px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-105" type="submit">Get ideas <ArrowUpRight className="ml-1 inline h-4 w-4" /></button></form>}</div></div></section>
      <footer className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-6 py-7 text-xs text-[#102832]/55 sm:flex-row lg:px-10"><span>© 2026 Beach Dog Marketing</span><span>Made for local businesses with big energy.</span></footer>
    </main>
  )
}

function parseMetric(value: string) {
  const match = value.match(/^([+−-]?)(\d+(?:\.\d+)?)(.*)$/)
  const digits = match?.[2] ?? '0'
  return {
    prefix: match?.[1] ?? '',
    target: Number(digits),
    suffix: match?.[3] ?? '',
    decimals: digits.includes('.') ? digits.split('.')[1].length : 0,
  }
}

function formatMetric(value: string, progress: number) {
  const metric = parseMetric(value)
  const current = metric.target * progress
  const shown = metric.decimals ? current.toFixed(metric.decimals) : String(Math.round(current))
  return `${metric.prefix}${shown}${metric.suffix}`
}

function Results() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setActive(true)
        observer.disconnect()
      },
      { threshold: 0.45 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="results" ref={ref} className="border-y border-[#102832]/10 bg-[#102832] text-white">
      <div className="mx-auto grid max-w-[1240px] gap-8 px-6 py-9 sm:grid-cols-3 lg:px-10">
        <Metric value="+300%" label="engagement rate" delay={0} active={active} />
        <Metric value="−40%" label="customer acquisition cost" delay={1100} active={active} />
        <Metric value="4.2×" label="more social shares" delay={2200} active={active} />
      </div>
    </section>
  )
}

function Metric({ value, label, delay, active }: { value: string; label: string; delay: number; active: boolean }) {
  const [text, setText] = useState(() => formatMetric(value, 0))

  useEffect(() => {
    if (!active) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(value)
      return
    }

    let frame = 0
    const timeout = window.setTimeout(() => {
      const begin = performance.now()
      const duration = 980
      const tick = (now: number) => {
        const progress = Math.min(1, (now - begin) / duration)
        setText(progress === 1 ? value : formatMetric(value, 1 - (1 - progress) ** 3))
        if (progress < 1) frame = window.requestAnimationFrame(tick)
      }
      frame = window.requestAnimationFrame(tick)
    }, delay)

    return () => {
      window.clearTimeout(timeout)
      window.cancelAnimationFrame(frame)
    }
  }, [active, delay, value])

  return (
    <div className="text-center">
      <p aria-label={value} className="font-display text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{text}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-white/50">{label}</p>
    </div>
  )
}
function Step({ num, title, text }: { num: string; title: string; text: string }) { return <div className="rounded-3xl border border-[#102832]/10 bg-white/40 p-7"><span className="font-mono text-xs font-bold text-[#f76f5f]">{num}</span><h3 className="mt-12 text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-[#102832]/65">{text}</p></div> }

