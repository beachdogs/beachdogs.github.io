'use client'

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'

const MIN_ANGLE = -135
const MAX_ANGLE = 135

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function demandToAngle(demand: number) {
  return MIN_ANGLE + clamp(demand, 0, 1) * (MAX_ANGLE - MIN_ANGLE)
}

function angleToDemand(angle: number) {
  return clamp((angle - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE), 0, 1)
}

function pointerToAngle(clientX: number, clientY: number, rect: DOMRect) {
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const deg = (Math.atan2(clientX - cx, cy - clientY) * 180) / Math.PI
  return clamp(deg, MIN_ANGLE, MAX_ANGLE)
}

function demandLabel(demand: number) {
  if (demand < 0.33) return 'Low'
  if (demand < 0.66) return 'Medium'
  return 'High'
}

/** Ease demand through a looping demo path: 0.25 → 0.85 → 0.45 → repeat */
function demoDemandAt(elapsedMs: number) {
  const cycle = 7500
  const t = (elapsedMs % cycle) / cycle
  if (t < 0.4) {
    const p = t / 0.4
    const e = 1 - (1 - p) ** 3
    return 0.25 + e * 0.6
  }
  if (t < 0.7) {
    const p = (t - 0.4) / 0.3
    const e = 1 - (1 - p) ** 3
    return 0.85 - e * 0.4
  }
  const p = (t - 0.7) / 0.3
  const e = 1 - (1 - p) ** 3
  return 0.45 - e * 0.2
}

export function DemandKnob({
  demand,
  onDemandChange,
  userControlled,
  onTakeControl,
}: {
  demand: number
  onDemandChange: (value: number) => void
  userControlled: boolean
  onTakeControl: () => void
}) {
  const dialRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const onDemandChangeRef = useRef(onDemandChange)
  onDemandChangeRef.current = onDemandChange

  useEffect(() => {
    if (userControlled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDemandChangeRef.current(0.5)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      onDemandChangeRef.current(demoDemandAt(now - start))
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [userControlled])

  const takeOver = (nextDemand: number) => {
    if (!userControlled) onTakeControl()
    onDemandChange(nextDemand)
  }

  const applyPointer = (clientX: number, clientY: number) => {
    const node = dialRef.current
    if (!node) return
    const angle = pointerToAngle(clientX, clientY, node.getBoundingClientRect())
    takeOver(angleToDemand(angle))
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    applyPointer(event.clientX, event.clientY)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    applyPointer(event.clientX, event.clientY)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.04
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      takeOver(clamp(demand + step, 0, 1))
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      takeOver(clamp(demand - step, 0, 1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      takeOver(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      takeOver(1)
    }
  }

  const angle = demandToAngle(demand)
  const percent = Math.round(demand * 100)

  return (
    <div className={`demand-knob${userControlled ? ' is-user' : ' is-demo'}`}>
      <div className="demand-knob-copy">
        <p className="demand-knob-label">Customer demand</p>
        <p className="demand-knob-readout">
          <span>{demandLabel(demand)}</span>
          <span className="demand-knob-percent">{percent}%</span>
        </p>
        {!userControlled ? (
          <p className="demand-knob-hint">Turn the knob to scale demand</p>
        ) : (
          <p className="demand-knob-hint is-solid">You’re in control</p>
        )}
      </div>

      <div
        ref={dialRef}
        className="demand-knob-dial"
        role="slider"
        tabIndex={0}
        aria-label="Customer demand"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${demandLabel(demand)}, ${percent} percent`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
      >
        <span className="demand-knob-ring" aria-hidden="true" />
        <span className="demand-knob-ticks" aria-hidden="true">
          {Array.from({ length: 11 }, (_, index) => (
            <span
              key={index}
              className="demand-knob-tick"
              style={{ ['--tick' as string]: index } as CSSProperties}
            />
          ))}
        </span>
        <span
          className="demand-knob-needle"
          aria-hidden="true"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <span className="demand-knob-pointer" />
        </span>
        <span className="demand-knob-cap" aria-hidden="true" />
      </div>
    </div>
  )
}

export function scalePlayersToday(demand: number) {
  return Math.round(1200 + clamp(demand, 0, 1) * 3600)
}

export function scaleGrowthPercent(demand: number) {
  return Math.round(8 + clamp(demand, 0, 1) * 24)
}

export function scaleLeaderboardPoints(base: number, demand: number) {
  const factor = 0.75 + clamp(demand, 0, 1) * 0.5
  return Math.round(base * factor)
}
