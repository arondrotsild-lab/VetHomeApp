export interface VetEntry {
  id: number
  name: string       // full name
  short: string      // Фамилия И.О.
  initials: string
  color: string      // avatar bg
  orders: number     // всего выполнено
  earnings: number   // gross ₽
  rating: number     // 0–5
  reviewCount: number
  responseMin: number  // среднее время принятия заказа, минут
  repeatRate: number   // % клиентов которые вернулись
  isMe?: boolean
}

export const LEADERBOARD_VETS: VetEntry[] = [
  {
    id: 1,
    name: 'Сомова Дарья Игоревна',
    short: 'Сомова Д.И.',
    initials: 'СД',
    color: '#7c3aed',
    orders: 158,
    earnings: 342800,
    rating: 4.97,
    reviewCount: 134,
    responseMin: 12,
    repeatRate: 81,
  },
  {
    id: 2,
    name: 'Черников Роман Павлович',
    short: 'Черников Р.П.',
    initials: 'ЧР',
    color: '#0891b2',
    orders: 124,
    earnings: 276500,
    rating: 4.88,
    reviewCount: 98,
    responseMin: 19,
    repeatRate: 74,
  },
  {
    id: 3,
    name: 'Фёдорова Татьяна Михайловна',
    short: 'Фёдорова Т.М.',
    initials: 'ФТ',
    color: '#b45309',
    orders: 97,
    earnings: 198500,
    rating: 4.96,
    reviewCount: 82,
    responseMin: 14,
    repeatRate: 79,
  },
  {
    id: 4,
    name: 'Иванов Алексей Петрович',
    short: 'Иванов А.П.',
    initials: 'ИА',
    color: '#15803d',
    orders: 62,
    earnings: 214600,
    rating: 4.90,
    reviewCount: 47,
    responseMin: 31,
    repeatRate: 62,
    isMe: true,
  },
  {
    id: 5,
    name: 'Захаров Виталий Юрьевич',
    short: 'Захаров В.Ю.',
    initials: 'ЗВ',
    color: '#be185d',
    orders: 58,
    earnings: 156200,
    rating: 4.78,
    reviewCount: 44,
    responseMin: 28,
    repeatRate: 55,
  },
  {
    id: 6,
    name: 'Белова Марина Владимировна',
    short: 'Белова М.В.',
    initials: 'БМ',
    color: '#0369a1',
    orders: 44,
    earnings: 124300,
    rating: 4.85,
    reviewCount: 36,
    responseMin: 24,
    repeatRate: 68,
  },
  {
    id: 7,
    name: 'Орлов Сергей Павлович',
    short: 'Орлов С.П.',
    initials: 'ОС',
    color: '#92400e',
    orders: 37,
    earnings: 98700,
    rating: 4.72,
    reviewCount: 29,
    responseMin: 44,
    repeatRate: 48,
  },
  {
    id: 8,
    name: 'Новикова Ирина Сергеевна',
    short: 'Новикова И.С.',
    initials: 'НИ',
    color: '#6b21a8',
    orders: 29,
    earnings: 76400,
    rating: 4.65,
    reviewCount: 21,
    responseMin: 53,
    repeatRate: 42,
  },
  {
    id: 9,
    name: 'Кузнецов Антон Борисович',
    short: 'Кузнецов А.Б.',
    initials: 'КА',
    color: '#065f46',
    orders: 21,
    earnings: 54200,
    rating: 4.60,
    reviewCount: 15,
    responseMin: 67,
    repeatRate: 35,
  },
  {
    id: 10,
    name: 'Степанова Ольга Дмитриевна',
    short: 'Степанова О.Д.',
    initials: 'СО',
    color: '#7f1d1d',
    orders: 14,
    earnings: 38500,
    rating: 4.55,
    reviewCount: 10,
    responseMin: 88,
    repeatRate: 28,
  },
]

export type LeaderCategory = 'earnings' | 'orders' | 'rating' | 'response' | 'repeat'

export interface CategoryConfig {
  key: LeaderCategory
  label: string
  shortLabel: string
  emoji: string
  color: string
  format: (v: VetEntry) => string
  value: (v: VetEntry) => number
  ascending?: boolean  // true = меньше = лучше (время ответа)
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'earnings',
    label: 'По заработку',
    shortLabel: 'Доход',
    emoji: '💰',
    color: '#fbbf24',
    value: v => v.earnings,
    format: v =>
      new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v.earnings),
  },
  {
    key: 'orders',
    label: 'По заказам',
    shortLabel: 'Заказы',
    emoji: '✅',
    color: '#4ade80',
    value: v => v.orders,
    format: v => `${v.orders} заказов`,
  },
  {
    key: 'rating',
    label: 'По рейтингу',
    shortLabel: 'Рейтинг',
    emoji: '⭐',
    color: '#f472b6',
    value: v => v.rating,
    format: v => `${v.rating.toFixed(2)} · ${v.reviewCount} отзыва`,
  },
  {
    key: 'response',
    label: 'Скорость ответа',
    shortLabel: 'Скорость',
    emoji: '⚡',
    color: '#38bdf8',
    value: v => v.responseMin,
    ascending: true,
    format: v => `~${v.responseMin} мин`,
  },
  {
    key: 'repeat',
    label: 'Возврат клиентов',
    shortLabel: 'Возврат',
    emoji: '🔁',
    color: '#a78bfa',
    value: v => v.repeatRate,
    format: v => `${v.repeatRate}% повторных`,
  },
]
