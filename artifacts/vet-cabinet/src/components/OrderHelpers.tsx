export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending: {
    label: 'Ожидает',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    dot: '#fbbf24',
  },
  confirmed: {
    label: 'Принят',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    dot: '#60a5fa',
  },
  in_progress: {
    label: 'В процессе',
    color: '#2dd4bf',
    bg: 'rgba(45,212,191,0.12)',
    dot: '#2dd4bf',
  },
  completed: {
    label: 'Выполнен',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.12)',
    dot: '#4ade80',
  },
  cancelled: {
    label: 'Отменён',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    dot: '#ef4444',
  },
}

export function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || { label: status, color: '#9ca3af', bg: 'rgba(156,163,175,0.12)', dot: '#9ca3af' }
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = getStatusConfig(status)
  return (
    <span
      className="status-badge"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateStr
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price)
}

// Status transitions for vets
export const STATUS_TRANSITIONS: Record<string, { next: string; label: string; color: string } | null> = {
  pending: { next: 'confirmed', label: '✓ Принять заказ', color: '#22c55e' },
  confirmed: { next: 'in_progress', label: '▶ Начать приём', color: '#2dd4bf' },
  in_progress: { next: 'completed', label: '✓ Завершить', color: '#4ade80' },
  completed: null,
  cancelled: null,
}
