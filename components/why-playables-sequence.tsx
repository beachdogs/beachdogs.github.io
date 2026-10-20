'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

const steps = [
  {
    id: 'intro',
    headline: 'Which conversion metric do you want to drive?',
    dwell: 0,
  },
  {
    id: 'solution',
    headline: 'This is where playable ads for non-gaming companies can make a big impact.',
    dwell: 4400,
  },
  {
    id: 'peak',
    headline: 'Playable ads outperform traditional ads',
    dwell: 10500,
  },
  {
    id: 'side-by-side',
    headline: 'Over 3× conversion lift',
    dwell: 5600,
  },
  {
    id: 'takeaway',
    headline: 'Engagement drives conversion. Invest in interactivity.',
    dwell: 6400,
  },
] as const

type MetricId = 'Purchase' | 'Sign-up' | 'Lead form' | 'Download'

const metricPlurals: Record<MetricId, string> = {
  Purchase: 'purchases',
  'Sign-up': 'sign-ups',
  'Lead form': 'lead forms',
  Download: 'downloads',
}

const introNodes: { id: MetricId; label: string; svg: ReactNode }[] = [
  {
    id: 'Purchase',
    label: 'Purchase',
    svg: (
      <svg viewBox="0 0 72 40" className="why-node-svg">
        <circle cx="10" cy="20" r="5" />
        <circle cx="22" cy="14" r="3.5" opacity="0.55" />
        <circle cx="22" cy="26" r="3.5" opacity="0.55" />
        <path d="M30 20h10" />
        <path d="M37 16l5 4-5 4" />
        <rect x="46" y="12" width="16" height="16" rx="3" />
        <path d="M50 22h8M54 18v8" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'Sign-up',
    label: 'Sign-up',
    svg: (
      <svg viewBox="0 0 72 40" className="why-node-svg">
        <circle cx="14" cy="14" r="5" />
        <path d="M6 30c2-6 6-9 8-9s6 3 8 9" />
        <path d="M30 20h10" />
        <path d="M37 16l5 4-5 4" />
        <rect x="48" y="10" width="14" height="18" rx="2" />
        <path d="M51 16h8M51 21h8M51 26h5" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    id: 'Lead form',
    label: 'Lead form',
    svg: (
      <svg viewBox="0 0 72 40" className="why-node-svg">
        <rect x="6" y="10" width="18" height="20" rx="2" />
        <path d="M10 16h10M10 21h10M10 26h6" strokeWidth="1.3" />
        <path d="M30 20h10" />
        <path d="M37 16l5 4-5 4" />
        <circle cx="56" cy="20" r="9" />
        <path d="M56 15v7M52.5 20.5 56 24l3.5-3.5" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: 'Download',
    label: 'Download',
    svg: (
      <svg viewBox="0 0 72 40" className="why-node-svg">
        <circle cx="12" cy="14" r="3.5" opacity="0.7" />
        <circle cx="22" cy="14" r="3.5" opacity="0.7" />
        <circle cx="17" cy="24" r="3.5" opacity="0.7" />
        <path d="M30 20h10" />
        <path d="M37 16l5 4-5 4" />
        <rect x="48" y="11" width="14" height="18" rx="2" />
        <path d="M55 15v8M51.5 20.5 55 24l3.5-3.5" strokeWidth="1.6" />
      </svg>
    ),
  },
]

function MetricCard({
  item,
  index,
  mode,
  settled = false,
  spotlight = false,
  dimmed = false,
  onSelect,
}: {
  item: (typeof introNodes)[number]
  index: number
  mode: 'choice' | 'selected' | 'leaving' | 'carry'
  settled?: boolean
  spotlight?: boolean
  dimmed?: boolean
  onSelect?: (id: MetricId) => void
}) {
  const interactive = mode === 'choice' && onSelect

  const className = [
    'why-node',
    mode === 'selected' || mode === 'carry' ? 'is-selected' : '',
    mode === 'leaving' ? 'is-leaving' : '',
    mode === 'carry' ? 'is-carry' : '',
    interactive ? 'is-interactive' : '',
    settled ? 'is-settled' : '',
    spotlight ? 'is-spotlight' : '',
    dimmed ? 'is-dimmed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {mode !== 'carry' ? (
        <>
          <span className="why-node-burst" />
          <span className="why-node-sizzle" />
          <span className="why-node-sizzle why-node-sizzle-b" />
        </>
      ) : null}
      <div className="why-node-bob">
        {item.svg}
        <span className="why-node-label">{item.label}</span>
      </div>
    </>
  )

  // Keep a stable element type across choice → leave so exit animations aren't remounted.
  if (mode === 'carry') {
    return (
      <div
        className={className}
        style={{ ['--n' as string]: index, ['--leave' as string]: index }}
      >
        {content}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={className}
      style={{ ['--n' as string]: index, ['--leave' as string]: index }}
      onClick={interactive ? () => onSelect?.(item.id) : undefined}
      disabled={!interactive}
      aria-label={`Select ${item.label}`}
      aria-hidden={mode === 'leaving' || undefined}
      tabIndex={interactive ? 0 : -1}
    >
      {content}
    </button>
  )
}

function Sparkles({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`why-sparkles ${className}`}>
      {Array.from({ length: 10 }, (_, index) => (
        <span key={index} className="why-sparkle" style={{ ['--i' as string]: index }} />
      ))}
    </div>
  )
}

function IntroStep({
  selectedMetric,
  onSelect,
}: {
  selectedMetric: MetricId | null
  onSelect: (id: MetricId, options?: { afterExit?: boolean }) => void
}) {
  const [showExamples, setShowExamples] = useState(false)
  const [ctaText, setCtaText] = useState<'metrics' | 'choose'>('metrics')
  const [ctaLeaving, setCtaLeaving] = useState(false)
  const [showBoxes, setShowBoxes] = useState(false)
  const [boxesSettled, setBoxesSettled] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null)
  const chosenRef = useRef(false)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    chosenRef.current = Boolean(selectedMetric)
    if (selectedMetric) {
      setShowExamples(true)
      setShowBoxes(true)
      setBoxesSettled(true)
      setSpotlightIndex(null)
    }
  }, [selectedMetric])

  useEffect(() => {
    if (selectedMetric) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const examplesDelay = reduced ? 200 : 1100
    const boxesDelay = reduced ? 400 : 2800
    const settleAfterBoxes = reduced ? 100 : 3200
    const idleBeforeTour = reduced ? 600 : 7500
    const highlightMs = reduced ? 350 : 1600
    const ctaSwipeMs = reduced ? 150 : 900
    const riseMs = reduced ? 400 : 7800
    const restAfterRise = reduced ? 400 : 2400
    const choosePhase = ctaSwipeMs + riseMs + restAfterRise
    const exitMs = reduced ? 200 : 1100

    const timers: number[] = []
    timers.push(window.setTimeout(() => setShowExamples(true), examplesDelay))
    timers.push(
      window.setTimeout(() => {
        setShowBoxes(true)

        timers.push(
          window.setTimeout(() => {
            if (chosenRef.current) return
            setBoxesSettled(true)
          }, settleAfterBoxes),
        )

        timers.push(
          window.setTimeout(() => {
            if (chosenRef.current) return

            introNodes.forEach((_, index) => {
              timers.push(
                window.setTimeout(() => {
                  if (chosenRef.current) return
                  setSpotlightIndex(index)
                }, index * highlightMs),
              )
            })

            const tourEnd = introNodes.length * highlightMs

            timers.push(
              window.setTimeout(() => {
                if (chosenRef.current) return
                setSpotlightIndex(null)
                setCtaLeaving(true)
              }, tourEnd),
            )

            timers.push(
              window.setTimeout(() => {
                if (chosenRef.current) return
                setCtaLeaving(false)
                setCtaText('choose')
              }, tourEnd + ctaSwipeMs),
            )

            timers.push(
              window.setTimeout(() => {
                if (chosenRef.current) return
                chosenRef.current = true
                setSpotlightIndex(null)
                setExiting(true)
              }, tourEnd + choosePhase),
            )

            timers.push(
              window.setTimeout(() => {
                onSelectRef.current('Purchase', { afterExit: true })
              }, tourEnd + choosePhase + exitMs),
            )
          }, idleBeforeTour),
        )
      }, boxesDelay),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [selectedMetric])

  return (
    <div className="why-panel why-panel-dark why-step-intro">
      <div>
        <p className="why-kicker">Metric focus</p>
        <h3 className="why-title">
          Which conversion metric do you want to <em className="why-pulse-word">drive?</em>
        </h3>
        {showExamples ? (
          <p
            key={ctaLeaving ? 'metrics-leave' : ctaText}
            className={`why-examples mt-4${ctaLeaving ? ' is-leaving' : ''}${
              ctaText === 'choose' ? ' is-choose' : ''
            }`}
          >
            {ctaText === 'choose'
              ? 'Choose one'
              : 'Choose the type of metrics that are important to your business'}
            <span className="why-examples-cursor" aria-hidden="true" />
          </p>
        ) : null}
      </div>
      {showBoxes ? (
        <div
          className={[
            'why-node-diagram',
            selectedMetric || exiting ? 'has-selection' : '',
            ctaText === 'choose' ? 'is-rising' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {introNodes.map((item, index) => {
            let mode: 'choice' | 'selected' | 'leaving' = 'choice'
            if (exiting) {
              mode = 'leaving'
            } else if (selectedMetric) {
              mode = selectedMetric === item.id ? 'selected' : 'leaving'
            }
            return (
              <MetricCard
                key={item.id}
                item={item}
                index={index}
                mode={mode}
                settled={boxesSettled}
                spotlight={!selectedMetric && !exiting && spotlightIndex === index}
                dimmed={
                  !selectedMetric &&
                  !exiting &&
                  spotlightIndex !== null &&
                  spotlightIndex !== index
                }
                onSelect={selectedMetric || exiting ? undefined : onSelect}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function SolutionStep({ selectedMetric }: { selectedMetric: MetricId | null }) {
  const selected = introNodes.find((item) => item.id === selectedMetric) ?? introNodes[0]

  return (
    <div className="why-panel why-panel-light why-step-solution">
      <div className="why-solution-layout">
        <MetricCard item={selected} index={0} mode="carry" />
        <div className="why-solution-copy">
          <p className="why-title-sm">
            This is where playable ads for non-gaming companies can make a{' '}
            <span className="why-burst-anchor">
              <em className="why-burst-words">
                big impact.
                <span className="why-burst-ring" aria-hidden="true" />
                <span className="why-burst-ring why-burst-ring-b" aria-hidden="true" />
                <span className="why-burst-spark" aria-hidden="true" />
                <span className="why-burst-spark why-burst-spark-b" aria-hidden="true" />
                <span className="why-burst-spark why-burst-spark-c" aria-hidden="true" />
              </em>
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

function ShopperFigure({ hasBag = true }: { hasBag?: boolean }) {
  return (
    <g className="why-shopper-figure" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <g className="why-shopper-bob">
        <circle cx="0" cy="-22" r="4.2" fill="currentColor" stroke="none" />
        <path d="M0 -17v9" strokeWidth="2.3" />
        <path className="why-shopper-arm-free" d="M0 -14l-5.5 5" strokeWidth="2" />
        {hasBag ? (
          <g className="why-shopper-bag-arm">
            <path d="M0 -14l5.2 4.5" strokeWidth="2" />
            <g className="why-shopper-bag">
              <path d="M5.8 -10.2v2.2" strokeWidth="1.5" />
              <path
                d="M3.2 -8h5.2l0.65 7.6H2.55z"
                fill="currentColor"
                fillOpacity="0.22"
                strokeWidth="1.5"
              />
              <path d="M4.4 -8c0-1.5 0.85-2.35 1.4-2.35S7.2 -9.5 7.2 -8" strokeWidth="1.35" />
            </g>
          </g>
        ) : (
          <path className="why-shopper-arm-alt" d="M0 -14l5.2 4.5" strokeWidth="2" />
        )}
        <path className="why-shopper-leg-a" d="M0 -7v14" strokeWidth="2.3" />
        <path className="why-shopper-leg-b" d="M0 -7v14" strokeWidth="2.3" />
      </g>
    </g>
  )
}

function CyclistFigure({ hasBag = true }: { hasBag?: boolean }) {
  return (
    <g className="why-cyclist-figure" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <g className="why-cyclist-bike">
        <g className="why-cyclist-wheel why-cyclist-wheel-r">
          <circle cx="11" cy="-7" r="6.2" strokeWidth="1.6" />
          <path d="M11 -12.5v11M5.5 -7h11" strokeWidth="1.1" opacity="0.55" />
        </g>
        <g className="why-cyclist-wheel why-cyclist-wheel-f">
          <circle cx="-11" cy="-7" r="6.2" strokeWidth="1.6" />
          <path d="M-11 -12.5v11M-16.5 -7h11" strokeWidth="1.1" opacity="0.55" />
        </g>
        <path d="M-11 -7l8 -9h7l7 9M-3 -16l4 6M4 -16v5" strokeWidth="1.7" />
        <path d="M-1 -10h8" strokeWidth="1.5" />
      </g>
      <g className="why-cyclist-rider">
        <circle cx="1" cy="-28" r="3.6" fill="currentColor" stroke="none" />
        <path d="M1 -24l2 8h-5z" fill="currentColor" fillOpacity="0.2" strokeWidth="1.6" />
        <path d="M1 -23l-4 6M1 -20l5 3" strokeWidth="1.7" />
        <path className="why-cyclist-pedal-a" d="M1 -15l-4 6" strokeWidth="1.7" />
        <path className="why-cyclist-pedal-b" d="M1 -15l4 5" strokeWidth="1.7" />
        {hasBag ? (
          <g className="why-cyclist-bag">
            <path d="M8 -18v2" strokeWidth="1.3" />
            <path
              d="M5.8 -16h4.4l0.5 5.8H5.3z"
              fill="currentColor"
              fillOpacity="0.22"
              strokeWidth="1.3"
            />
          </g>
        ) : null}
      </g>
    </g>
  )
}

const walkerClasses = [
  'why-shopper-cafe-in',
  'why-shopper-cafe-out',
  'why-shopper-bistro-in',
  'why-shopper-bistro-out',
  'why-shopper-shop-in',
  'why-shopper-shop-out',
  'why-shopper-market-in',
  'why-shopper-market-out',
  'why-shopper-stroll',
] as const

const cyclistClasses = ['why-cyclist-cafe', 'why-cyclist-shop', 'why-cyclist-pass'] as const

function LocalShoppers() {
  const [bagFlags] = useState(() => ({
    walkers: walkerClasses.map(() => Math.random() > 0.38),
    cyclists: cyclistClasses.map(() => Math.random() > 0.45),
  }))

  return (
    <svg
      className="why-local-shoppers"
      viewBox="0 0 960 280"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      {walkerClasses.map((className, index) => (
        <g key={className} className={`why-shopper ${className}`}>
          <ShopperFigure hasBag={bagFlags.walkers[index]} />
        </g>
      ))}
      {cyclistClasses.map((className, index) => (
        <g key={className} className={`why-shopper why-cyclist ${className}`}>
          <CyclistFigure hasBag={bagFlags.cyclists[index]} />
        </g>
      ))}
    </svg>
  )
}

function LocalBusinessBackdrop() {
  return (
    <svg
      className="why-local-backdrop"
      viewBox="0 0 960 280"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      {/* sidewalk */}
      <path d="M0 248h960v32H0z" fill="currentColor" opacity="0.08" />
      <path d="M0 248h960" stroke="currentColor" strokeWidth="2" opacity="0.18" fill="none" />

      {/* cafe */}
      <g transform="translate(40 70)" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <rect x="0" y="48" width="150" height="130" rx="4" fill="currentColor" fillOpacity="0.05" />
        <path d="M-8 48h166l-12-28H4z" fill="currentColor" fillOpacity="0.08" />
        <rect x="18" y="78" width="48" height="58" rx="2" />
        <rect x="84" y="78" width="48" height="58" rx="2" />
        <rect x="58" y="128" width="34" height="50" rx="2" />
        <circle cx="84" cy="154" r="2.5" fill="currentColor" stroke="none" />
        <path d="M28 168h28M94 168h28" />
        <path d="M12 40c18-22 48-22 66 0M72 40c18-22 48-22 66 0" opacity="0.55" />
        <text x="75" y="38" textAnchor="middle" fill="currentColor" stroke="none" fontSize="14" fontFamily="system-ui,sans-serif" fontWeight="700" opacity="0.55">
          CAFE
        </text>
      </g>

      {/* restaurant */}
      <g transform="translate(240 40)" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <rect x="0" y="58" width="190" height="150" rx="4" fill="currentColor" fillOpacity="0.06" />
        <rect x="-10" y="42" width="210" height="22" rx="3" fill="currentColor" fillOpacity="0.1" />
        <rect x="22" y="88" width="56" height="70" rx="2" />
        <rect x="112" y="88" width="56" height="70" rx="2" />
        <path d="M22 123h56M112 123h56" />
        <rect x="78" y="138" width="34" height="70" rx="2" />
        <circle cx="102" cy="174" r="2.5" fill="currentColor" stroke="none" />
        <path d="M48 28c0 14 12 26 12 26s12-12 12-26a12 12 0 10-24 0z" fill="currentColor" fillOpacity="0.12" />
        <text x="95" y="58" textAnchor="middle" fill="currentColor" stroke="none" fontSize="13" fontFamily="system-ui,sans-serif" fontWeight="700" opacity="0.55">
          BISTRO
        </text>
      </g>

      {/* retail boutique */}
      <g transform="translate(480 55)" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <rect x="0" y="55" width="160" height="138" rx="4" fill="currentColor" fillOpacity="0.05" />
        <path d="M0 55h160v-18H0z" fill="currentColor" fillOpacity="0.09" />
        <rect x="18" y="78" width="124" height="72" rx="2" />
        <path d="M80 78v72" />
        <path d="M18 114h124" />
        <rect x="64" y="150" width="32" height="43" rx="2" />
        <circle cx="88" cy="172" r="2.2" fill="currentColor" stroke="none" />
        <path d="M36 48h20M104 48h20" opacity="0.45" />
        <text x="80" y="48" textAnchor="middle" fill="currentColor" stroke="none" fontSize="13" fontFamily="system-ui,sans-serif" fontWeight="700" opacity="0.55">
          SHOP
        </text>
      </g>

      {/* market / grocery */}
      <g transform="translate(700 48)" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
        <rect x="0" y="60" width="200" height="140" rx="4" fill="currentColor" fillOpacity="0.05" />
        <path d="M-6 60h212L180 28H26z" fill="currentColor" fillOpacity="0.08" />
        <rect x="18" y="88" width="50" height="48" rx="2" />
        <rect x="78" y="88" width="50" height="48" rx="2" />
        <rect x="138" y="88" width="44" height="48" rx="2" />
        <rect x="86" y="148" width="36" height="52" rx="2" />
        <circle cx="112" cy="176" r="2.5" fill="currentColor" stroke="none" />
        <path d="M28 78h160" opacity="0.4" />
        <text x="100" y="52" textAnchor="middle" fill="currentColor" stroke="none" fontSize="13" fontFamily="system-ui,sans-serif" fontWeight="700" opacity="0.55">
          MARKET
        </text>
      </g>

      {/* awnings / outdoor tables hint */}
      <g fill="currentColor" opacity="0.12" stroke="none">
        <ellipse cx="115" cy="236" rx="18" ry="5" />
        <ellipse cx="330" cy="236" rx="18" ry="5" />
        <ellipse cx="560" cy="236" rx="16" ry="5" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.35">
        <path d="M115 236v-16M106 220h18" />
        <path d="M330 236v-16M321 220h18" />
        <path d="M560 236v-14M552 222h16" />
      </g>
    </svg>
  )
}

function TakeawayStep({ selectedMetric }: { selectedMetric: MetricId | null }) {
  const selected = introNodes.find((item) => item.id === selectedMetric) ?? introNodes[0]
  const plural = metricPlurals[selected.id]
  const showShoppers = selected.id === 'Purchase'
  const [shoppersLive, setShoppersLive] = useState(false)

  useEffect(() => {
    if (!showShoppers) {
      setShoppersLive(false)
      return
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setShoppersLive(true), reduced ? 200 : 2200)
    return () => window.clearTimeout(timer)
  }, [showShoppers])

  return (
    <div className="why-panel why-panel-mint why-step-takeaway">
      <LocalBusinessBackdrop />
      {showShoppers && shoppersLive ? <LocalShoppers /> : null}
      <div className="why-takeaway-layout">
        <div>
          <p className="why-kicker">Key insight</p>
          <h3 className="why-title">
            Engagement drives <em className="why-pulse-word">{plural}.</em>
          </h3>
          <p className="why-body mt-3">Modern ads must capture attention.</p>
          <p className="why-cta mt-6">Invest in interactivity.</p>
        </div>
      </div>
    </div>
  )
}

const peakStats = [
  {
    figure: '32%',
    before: '',
    highlight: 'more memorable',
    after: ' compared to video and static ads',
  },
  {
    figure: '47%',
    before: '',
    highlight: 'longer attention',
    after: ' compared to video ads',
  },
  {
    figure: '3×',
    before: 'higher ',
    highlight: 'conversion rates',
    after: ' than traditional video ads for non-gaming companies',
  },
] as const

function PeakStep() {
  const [statIndex, setStatIndex] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setStatIndex(peakStats.length - 1)
      return
    }

    const dwellPerStat = 3200
    const timers = peakStats.slice(0, -1).map((_, index) =>
      window.setTimeout(() => setStatIndex(index + 1), (index + 1) * dwellPerStat),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const stat = peakStats[statIndex]

  return (
    <div className="why-panel why-panel-dark why-step-peak">
      <Sparkles />
      <div key={stat.figure} className="why-peak-stat why-pop">
        <p className="why-peak-lead">Playable ads have…</p>
        <p className="why-metric-3d-wrap">
          <span className="why-metric-range why-glow why-metric-3d">{stat.figure}</span>
        </p>
        <p className="why-lift why-peak-stat-text">
          {stat.before}
          <span className="why-peak-flash">
            {stat.highlight}
            <span className="why-peak-flash-sparks" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </span>
          </span>
          {stat.after}
        </p>
      </div>
      <p className="why-peak-source">
        Source:{' '}
        <a
          href="https://playablefactory.com/blog/importance-of-playable-ads-for-non-gaming-companies"
          target="_blank"
          rel="noopener noreferrer"
        >
          Playable Factory
        </a>
      </p>
    </div>
  )
}

function StepPanel({
  step,
  selectedMetric,
  onSelectMetric,
}: {
  step: number
  selectedMetric: MetricId | null
  onSelectMetric: (id: MetricId, options?: { afterExit?: boolean }) => void
}) {
  switch (step) {
    case 0:
      return <IntroStep selectedMetric={selectedMetric} onSelect={onSelectMetric} />
    case 1:
      return <SolutionStep selectedMetric={selectedMetric} />
    case 2:
      return <PeakStep />
    case 3:
      return (
        <div className="why-panel why-panel-light why-step-side">
          <div className="why-winner-grid">
            <div className="why-card why-card-win">
              <p className="why-card-label">Playable ads</p>
              <p className="why-metric-range why-glow why-metric-compact">5.0% – 7.8%</p>
              <span className="why-winner-badge">Winner</span>
            </div>
            <p className="why-lift why-lift-inline">Over 3× conversion lift</p>
            <div className="why-card why-card-lose">
              <p className="why-card-label">Traditional ads</p>
              <p className="why-dull-inline">~2.0% – 2.5%</p>
            </div>
          </div>
        </div>
      )
    default:
      return <TakeawayStep selectedMetric={selectedMetric} />
  }
}

export function WhyPlayablesSequence() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<MetricId | null>(null)
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const node = stageRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        if (reducedMotion.current) {
          setSelectedMetric('Purchase')
          setStep(steps.length - 1)
        }
        setPlaying(true)
        observer.disconnect()
      },
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || reducedMotion.current) return
    if (step === 0) return
    if (step >= steps.length - 1) return
    const timer = window.setTimeout(() => setStep((current) => current + 1), steps[step].dwell)
    return () => window.clearTimeout(timer)
  }, [playing, step])

  const handleSelectMetric = (id: MetricId, options?: { afterExit?: boolean }) => {
    if (selectedMetric) return
    setSelectedMetric(id)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // After the auto swipe-out, advance immediately so cards cannot remount/reappear.
    const delay = options?.afterExit ? (reduced ? 80 : 120) : reduced ? 200 : 900
    window.setTimeout(() => {
      setPlaying(true)
      setStep(1)
    }, delay)
  }

  const goToStep = (index: number) => {
    setPlaying(true)
    if (index === 0) setSelectedMetric(null)
    if (index > 0 && !selectedMetric) setSelectedMetric('Purchase')
    setStep(index)
  }

  const current = steps[step]
  const selectedPlural = metricPlurals[selectedMetric ?? 'Purchase']
  const liveHeadline =
    current.id === 'takeaway'
      ? `Engagement drives ${selectedPlural}. Invest in interactivity.`
      : current.headline

  return (
    <div ref={stageRef} className="why-sequence overflow-hidden rounded-[2rem] shadow-xl">
      <div className="why-stage">
        <StepPanel
          step={step}
          selectedMetric={selectedMetric}
          onSelectMetric={handleSelectMetric}
        />
      </div>
      <div className="why-progress" role="group" aria-label="Animation steps">
        {steps.map((item, index) => {
          const label =
            item.id === 'takeaway'
              ? `Engagement drives ${selectedPlural}. Invest in interactivity.`
              : item.headline
          return (
            <button
              key={item.id}
              type="button"
              className={index <= step ? 'is-on' : ''}
              aria-label={`Step ${index + 1}: ${label}`}
              aria-current={index === step ? 'step' : undefined}
              onClick={() => goToStep(index)}
            />
          )
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {liveHeadline}
      </p>
    </div>
  )
}
