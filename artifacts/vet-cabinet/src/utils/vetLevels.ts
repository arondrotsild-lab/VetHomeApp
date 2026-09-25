export interface Tier {
  name: string
  emoji: string
  color: string
  gradientFrom: string
  gradientTo: string
  borderColor: string
  minOrders: number
  maxOrders: number | null
  commission: number
}

export const TIERS: Tier[] = [
  {
    name: 'Бронза',
    emoji: '🥉',
    color: '#cd7f32',
    gradientFrom: '#7c3a0e',
    gradientTo: '#b45309',
    borderColor: 'rgba(205,127,50,0.4)',
    minOrders: 0,
    maxOrders: 30,
    commission: 50,
  },
  {
    name: 'Серебро',
    emoji: '🥈',
    color: '#94a3b8',
    gradientFrom: '#334155',
    gradientTo: '#475569',
    borderColor: 'rgba(148,163,184,0.4)',
    minOrders: 30,
    maxOrders: 65,
    commission: 55,
  },
  {
    name: 'Золото',
    emoji: '🥇',
    color: '#fbbf24',
    gradientFrom: '#78350f',
    gradientTo: '#92400e',
    borderColor: 'rgba(251,191,36,0.45)',
    minOrders: 65,
    maxOrders: 95,
    commission: 60,
  },
  {
    name: 'Платина',
    emoji: '💎',
    color: '#67e8f9',
    gradientFrom: '#164e63',
    gradientTo: '#155e75',
    borderColor: 'rgba(103,232,249,0.4)',
    minOrders: 95,
    maxOrders: 150,
    commission: 65,
  },
  {
    name: 'Элита',
    emoji: '👑',
    color: '#c084fc',
    gradientFrom: '#4c1d95',
    gradientTo: '#5b21b6',
    borderColor: 'rgba(192,132,252,0.45)',
    minOrders: 150,
    maxOrders: 200,
    commission: 70,
  },
]

export function getTierByOrders(completedOrders: number): Tier {
  let current = TIERS[0]
  for (const tier of TIERS) {
    if (completedOrders >= tier.minOrders) current = tier
  }
  return current
}

export function getNextTier(completedOrders: number): Tier | null {
  const idx = TIERS.findIndex(t => t.minOrders > completedOrders)
  if (idx === -1) return null
  return TIERS[idx]
}

export function getProgressToNext(completedOrders: number): {
  progress: number   // 0-100
  current: number
  needed: number
  tierStart: number
  tierEnd: number
} {
  const tier = getTierByOrders(completedOrders)
  const next = getNextTier(completedOrders)

  if (!next || tier.maxOrders === null) {
    return { progress: 100, current: completedOrders, needed: 0, tierStart: tier.minOrders, tierEnd: completedOrders }
  }

  const tierStart = tier.minOrders
  const tierEnd = tier.maxOrders
  const range = tierEnd - tierStart
  const done = completedOrders - tierStart
  const progress = Math.min(100, Math.round((done / range) * 100))
  const needed = tierEnd - completedOrders

  return { progress, current: completedOrders, needed, tierStart, tierEnd }
}
