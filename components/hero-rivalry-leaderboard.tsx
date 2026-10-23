'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

type Player = {
  id: string
  name: string
  points: number
}

type ChatLine = {
  fromId: string
  text: string
}

type Beat = {
  /** ms from start of loop */
  at: number
  board: Player[]
  /** If set, a new #1 just claimed the crown — fire chat */
  chats?: ChatLine[]
}

type BubbleAnchor = {
  left: number
  top: number
}

const medals = ['gold', 'silver', 'bronze'] as const

const beats: Beat[] = [
  {
    at: 0,
    board: [
      { id: 'maya', name: 'Maya R.', points: 12480 },
      { id: 'coffee', name: 'The Coffee Club', points: 11920 },
      { id: 'jake', name: "Jake’s Bikes", points: 9840 },
    ],
  },
  {
    at: 5000,
    board: [
      { id: 'coffee', name: 'The Coffee Club', points: 13110 },
      { id: 'maya', name: 'Maya R.', points: 12480 },
      { id: 'jake', name: "Jake’s Bikes", points: 9840 },
    ],
    chats: [
      { fromId: 'coffee', text: 'Too slow, Maya. Crown’s ours.' },
      { fromId: 'maya', text: 'Keep it warm. Lunch rush is coming.' },
      { fromId: 'coffee', text: 'We’ll leave the stool free.' },
    ],
  },
  {
    at: 16000,
    board: [
      { id: 'jake', name: "Jake’s Bikes", points: 13840 },
      { id: 'coffee', name: 'The Coffee Club', points: 13110 },
      { id: 'maya', name: 'Maya R.', points: 12480 },
    ],
    chats: [
      { fromId: 'jake', text: 'New high score. Bikes > beans.' },
      { fromId: 'coffee', text: 'Cute wheels. Rematch after the pour-over.' },
      { fromId: 'jake', text: 'Bring a helmet. You’ll need it.' },
    ],
  },
  {
    at: 27000,
    board: [
      { id: 'maya', name: 'Maya R.', points: 14620 },
      { id: 'jake', name: "Jake’s Bikes", points: 13840 },
      { id: 'coffee', name: 'The Coffee Club', points: 13110 },
    ],
    chats: [
      { fromId: 'maya', text: 'Told you. Crown’s back.' },
      { fromId: 'jake', text: 'For now. Pedals don’t sleep.' },
      { fromId: 'maya', text: 'Neither does a barista with something to prove.' },
    ],
  },
]

const LOOP_MS = 38000
const CHAT_STAGGER_MS = 1800

function playerLabel(id: string, board: Player[]) {
  return board.find((p) => p.id === id)?.name ?? id
}

export function HeroRivalryLeaderboard({ demand }: { demand: number }) {
  const [board, setBoard] = useState(beats[0].board)
  const [chat, setChat] = useState<ChatLine[]>([])
  const [visibleChatCount, setVisibleChatCount] = useState(0)
  const [crownId, setCrownId] = useState<string | null>(null)
  const [flash, setFlash] = useState(false)
  const [anchors, setAnchors] = useState<Record<string, BubbleAnchor>>({})
  const timers = useRef<number[]>([])
  const boardRef = useRef<HTMLDivElement>(null)
  const nameRefs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const last = beats[beats.length - 1]
      setBoard(last.board)
      setChat(last.chats?.slice(0, 2) ?? [])
      setVisibleChatCount(last.chats ? Math.min(2, last.chats.length) : 0)
      setCrownId(last.board[0]?.id ?? null)
      return
    }

    let cancelled = false
    const clearTimers = () => {
      for (const id of timers.current) window.clearTimeout(id)
      timers.current = []
    }
    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms))
    }

    const runLoop = () => {
      if (cancelled) return
      clearTimers()
      setChat([])
      setVisibleChatCount(0)
      setCrownId(null)
      setFlash(false)

      for (const beat of beats) {
        schedule(() => {
          if (cancelled) return
          setBoard(beat.board)
          if (beat.chats?.length) {
            const newLead = beat.board[0]?.id ?? null
            setCrownId(newLead)
            setFlash(true)
            schedule(() => {
              if (!cancelled) setFlash(false)
            }, 1200)
            setChat(beat.chats)
            setVisibleChatCount(0)
            beat.chats.forEach((_, i) => {
              schedule(() => {
                if (!cancelled) setVisibleChatCount(i + 1)
              }, 700 + i * CHAT_STAGGER_MS)
            })
          }
        }, beat.at)
      }

      schedule(runLoop, LOOP_MS)
    }

    runLoop()
    return () => {
      cancelled = true
      clearTimers()
    }
  }, [])

  useLayoutEffect(() => {
    const boardEl = boardRef.current
    if (!boardEl) return

    const measure = () => {
      const boardBox = boardEl.getBoundingClientRect()
      const next: Record<string, BubbleAnchor> = {}
      for (const player of board) {
        const nameEl = nameRefs.current.get(player.id)
        if (!nameEl) continue
        const box = nameEl.getBoundingClientRect()
        next[player.id] = {
          left: box.left - boardBox.left,
          top: box.top - boardBox.top,
        }
      }
      setAnchors(next)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [board, crownId, flash])

  const factor = 0.75 + Math.min(1, Math.max(0, demand)) * 0.5

  const visibleChat = chat.slice(0, visibleChatCount)
  // Keep a short pile so new lines land on top of the previous ones.
  const overlayChat = visibleChat.slice(-3)

  return (
    <div className="rivalry">
      <div className="mt-4 flex items-center justify-between px-1 text-xs text-white/45">
        <span>Top players today</span>
        <span className={`rivalry-status${flash ? ' is-hot' : ''}`}>
          {flash ? 'New #1' : 'View all →'}
        </span>
      </div>

      <div className="rivalry-board" ref={boardRef} aria-live="polite">
        <div className="rivalry-rows space-y-2">
          {board.map((player, index) => {
            const points = Math.round(player.points * factor)
            const isCrown = crownId === player.id && index === 0

            return (
              <div
                key={player.id}
                className={`rivalry-row flex items-center justify-between rounded-xl bg-white/[0.07] px-3 py-2.5 text-sm text-white${isCrown ? ' is-crown' : ''}${flash && index === 0 ? ' is-claiming' : ''}`}
              >
                <span className="rivalry-name flex min-w-0 items-center gap-3">
                  <span className={`rank ${medals[index] ?? 'plain'}`}>{String(index + 1).padStart(2, '0')}</span>
                  <span
                    className="truncate"
                    ref={(node) => {
                      if (node) nameRefs.current.set(player.id, node)
                      else nameRefs.current.delete(player.id)
                    }}
                  >
                    {player.name}
                  </span>
                  {isCrown ? <span className="rivalry-crown-tag">Lead</span> : null}
                </span>
                <span className="shrink-0 font-mono text-xs text-[#f4c55e] tabular-nums">
                  {points.toLocaleString()} pts
                </span>
              </div>
            )
          })}
        </div>

        {overlayChat.length > 0 ? (
          <div className="rivalry-chat-layer">
            {overlayChat.map((line, index) => {
              const isLeader = line.fromId === board[0]?.id
              const stack = overlayChat.length - 1 - index
              const anchor = anchors[line.fromId]
              if (!anchor) return null
              return (
                <div
                  key={`${line.fromId}-${line.text}-${index}`}
                  className={`rivalry-bubble${isLeader ? ' is-leader' : ' is-rival'}`}
                  style={{
                    left: anchor.left,
                    top: anchor.top,
                    zIndex: 10 + index,
                    ['--rivalry-stack' as string]: stack,
                  }}
                >
                  <span className="rivalry-bubble-from">{playerLabel(line.fromId, board)}</span>
                  <span className="rivalry-bubble-text">{line.text}</span>
                </div>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
