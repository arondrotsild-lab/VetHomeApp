import { useState, useEffect, useRef } from 'react'
import { LEADERBOARD_VETS, CATEGORIES, type LeaderCategory, type VetEntry, type CategoryConfig } from '../data/leaderboard'

const MEDALS = ['🥇', '🥈', '🥉']

function getSorted(cat: CategoryConfig): VetEntry[] {
  return [...LEADERBOARD_VETS].sort((a, b) =>
    cat.ascending ? cat.value(a) - cat.value(b) : cat.value(b) - cat.value(a)
  )
}

function MyRankBadge({ rank, total, color }: { rank: number; total: number; color: string }) {
  const pct = Math.round(((total - rank) / (total - 1)) * 100)
  return (
    <span
      className="text-xs font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: `${color}22`, color, border: `1px solid ${color}40` }}
    >
      Топ {100 - pct}%
    </span>
  )
}

function RankRow({
  rank, vet, cat, delay,
}: {
  rank: number
  vet: VetEntry
  cat: CategoryConfig
  delay: number
}) {
  const isTop3 = rank <= 3
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-300"
      style={{
        animationDelay: `${delay}ms`,
        background: vet.isMe
          ? 'linear-gradient(135deg, rgba(74,222,128,0.13), rgba(74,222,128,0.06))'
          : 'transparent',
        border: vet.isMe ? '1px solid rgba(74,222,128,0.25)' : '1px solid transparent',
      }}
    >
      {/* Position */}
      <div
        className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold rounded-lg"
        style={{
          background: isTop3 ? `${cat.color}18` : 'rgba(255,255,255,0.04)',
          color: isTop3 ? cat.color : 'rgba(255,255,255,0.35)',
        }}
      >
        {isTop3 ? MEDALS[rank - 1] : rank}
      </div>

      {/* Avatar */}
      <div
        className="w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: `${vet.color}33`,
          color: vet.color,
          border: `1px solid ${vet.color}55`,
          boxShadow: vet.isMe ? `0 0 8px ${vet.color}40` : 'none',
        }}
      >
        {vet.initials}
      </div>

      {/* Name + value */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold truncate leading-tight"
          style={{ color: vet.isMe ? '#4ade80' : 'rgba(255,255,255,0.85)' }}
        >
          {vet.isMe ? '👤 ' : ''}{vet.short}
        </p>
        <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.38)', fontSize: '10px' }}>
          {cat.format(vet)}
        </p>
      </div>
    </div>
  )
}

export function Leaderboard() {
  const [active, setActive] = useState<LeaderCategory>('earnings')
  const [tick, setTick] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isLive, setIsLive] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Simulate "live" updates every 30s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTick(t => t + 1)
      setLastUpdated(new Date())
    }, 30_000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const cat = CATEGORIES.find(c => c.key === active)!
  const sorted = getSorted(cat)
  const myRank = sorted.findIndex(v => v.isMe) + 1
  const myEntry = sorted.find(v => v.isMe)!

  // Compute summary rank across all categories
  const avgRank = Math.round(
    CATEGORIES.reduce((sum, c) => {
      const s = getSorted(c)
      return sum + (s.findIndex(v => v.isMe) + 1)
    }, 0) / CATEGORIES.length
  )

  const now = lastUpdated
  const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden"
      style={{ background: 'rgba(6,13,6,0.97)', border: '1px solid rgba(74,222,128,0.1)' }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(74,222,128,0.07)' }}
      >
        <div className="flex items-center justify-between mb-1">
          <div>
          <p className="text-white font-bold text-sm">🏆 Рейтинг ветеринаров</p>
          <p className="text-xs font-semibold uppercase tracking-widest mt-0.5" style={{ color: '#fbbf24', letterSpacing: '0.12em' }}>Лига ветеринаров</p>
        </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isLive ? '#4ade80' : '#6b7280',
                boxShadow: isLive ? '0 0 6px #4ade80' : 'none',
                animation: isLive ? 'glowPulse 2s infinite' : 'none',
              }}
            />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {isLive ? `обновлено ${timeStr}` : 'оффлайн'}
            </span>
          </div>
        </div>

        {/* My summary card */}
        <div
          className="rounded-xl px-3 py-2 mt-2 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(74,222,128,0.04))',
            border: '1px solid rgba(74,222,128,0.2)',
          }}
        >
          <div>
            <p className="text-xs text-white/40 mb-0.5">Ваша средняя позиция</p>
            <p className="text-white font-bold text-lg leading-tight">
              #{avgRank}
              <span className="text-xs font-normal text-white/40 ml-1">из {LEADERBOARD_VETS.length}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 mb-0.5">Топ</p>
            <p className="font-bold text-lg leading-tight" style={{ color: '#4ade80' }}>
              {Math.round(((LEADERBOARD_VETS.length - avgRank) / (LEADERBOARD_VETS.length - 1)) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Category tabs — 5-col compact grid */}
      <div
        className="grid grid-cols-5 gap-1 px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(74,222,128,0.07)' }}
      >
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-all duration-200"
            style={
              active === c.key
                ? { background: `${c.color}22`, border: `1px solid ${c.color}45` }
                : { background: 'transparent', border: '1px solid transparent' }
            }
            title={c.label}
          >
            <span className="text-base leading-none">{c.emoji}</span>
            <span
              className="text-center leading-tight font-medium"
              style={{
                fontSize: '9px',
                color: active === c.key ? c.color : 'rgba(255,255,255,0.35)',
                maxWidth: 48,
              }}
            >
              {c.shortLabel}
            </span>
          </button>
        ))}
      </div>

      {/* Active category header */}
      <div className="px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base">{cat.emoji}</span>
          <p className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</p>
        </div>
        <MyRankBadge rank={myRank} total={LEADERBOARD_VETS.length} color={cat.color} />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 flex flex-col gap-0.5" key={`${active}-${tick}`}>
        {sorted.map((vet, i) => (
          <RankRow key={vet.id} rank={i + 1} vet={vet} cat={cat} delay={i * 40} />
        ))}
      </div>

      {/* My position sticky footer */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(74,222,128,0.1)', background: 'rgba(4,10,4,0.8)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: '#15803d33', color: '#4ade80', border: '1px solid #4ade8055' }}
            >
              ИА
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#4ade80' }}>Ваше место</p>
              <p className="text-xs text-white/35">{cat.format(myEntry)}</p>
            </div>
          </div>
          <div
            className="text-lg font-extrabold"
            style={{ color: myRank <= 3 ? cat.color : 'rgba(255,255,255,0.7)' }}
          >
            #{myRank}
          </div>
        </div>
      </div>
    </div>
  )
}
