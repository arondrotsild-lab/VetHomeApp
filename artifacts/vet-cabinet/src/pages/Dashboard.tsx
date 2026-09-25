import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, getVetProfile, type Order, type VetProfile } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  ClipboardList, CheckCircle2, Clock, Star, TrendingUp,
  ChevronRight, MapPin, Calendar, Zap, AlertCircle, Wallet, Award, Camera, Trash2
} from 'lucide-react'
import { StatusBadge, formatDate, formatPrice } from '../components/OrderHelpers'
import {
  getTierByOrders, getNextTier, getProgressToNext, TIERS
} from '../utils/vetLevels'
import { getStoredPhoto, setStoredPhoto, removeStoredPhoto } from '../utils/photoStorage'
import { publicAsset } from '../utils/publicAsset'


// ─────────────────────────────────────────────
// Mотивационный блок
// ─────────────────────────────────────────────
function MotivationBlock({ profile, completedCount }: { profile: VetProfile; completedCount: number }) {
  // total_completed_orders: use backend value if available, fallback to local count
  const totalCompleted = profile.total_completed_orders ?? completedCount
  const grossEarnings = profile.total_earnings ?? 0

  const tier = getTierByOrders(totalCompleted)
  const next = getNextTier(totalCompleted)
  const prog = getProgressToNext(totalCompleted)

  const myShare = Math.round(grossEarnings * (tier.commission / 100))
  const isMaxTier = !next

  return (
    <div
      className="rounded-2xl p-5 mb-6 animate-scale-in"
      style={{
        background: `linear-gradient(135deg, ${tier.gradientFrom}cc, ${tier.gradientTo}cc)`,
        border: `1px solid ${tier.borderColor}`,
      }}
    >
      {/* Top row: tier badge + rating */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${tier.borderColor}` }}
          >
            {tier.emoji}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-0.5" style={{ color: tier.color }}>
              Статус
            </p>
            <p className="text-white font-bold text-lg leading-tight">{tier.name}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="text-right">
          <p className="text-xs text-white/50 mb-0.5">Рейтинг</p>
          <div className="flex items-center gap-1.5 justify-end">
            <Star size={16} fill="#fbbf24" style={{ color: '#fbbf24' }} />
            <span className="text-white font-bold text-xl">{Number(profile.rating).toFixed(1)}</span>
          </div>
          <p className="text-xs text-white/40">{profile.reviews_count} отзывов</p>
        </div>
      </div>

      {/* Commission + earnings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={13} style={{ color: tier.color }} />
            <p className="text-xs text-white/50">Моя комиссия</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: tier.color }}>{tier.commission}%</p>
          <p className="text-xs text-white/35 mt-0.5">от стоимости заказа</p>
        </div>

        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={13} style={{ color: '#4ade80' }} />
            <p className="text-xs text-white/50">Заработано</p>
          </div>
          <p className="text-lg font-bold text-green-400 leading-tight">
            {myShare > 0
              ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(myShare)
              : '—'}
          </p>
          <p className="text-xs text-white/35 mt-0.5">с {totalCompleted} заказов</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {!isMaxTier && next && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Award size={12} style={{ color: tier.color }} />
              <p className="text-xs text-white/60">
                До уровня <span style={{ color: next.color }} className="font-semibold">{next.emoji} {next.name}</span>
              </p>
            </div>
            <p className="text-xs font-bold text-white/70">
              {prog.needed === 0 ? 'Готово!' : `ещё ${prog.needed} заказ${prog.needed === 1 ? '' : prog.needed < 5 ? 'а' : 'ов'}`}
            </p>
          </div>

          {/* Bar */}
          <div
            className="w-full h-2.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <div
               className="h-full rounded-full transition-all duration-700 animate-fade-up"
              style={{
                width: `${prog.progress}%`,
                background: `linear-gradient(90deg, ${tier.color}99, ${next.color})`,
                boxShadow: `0 0 8px ${next.color}60`,
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-white/35">{prog.tierStart} зак.</p>
            <p className="text-xs font-medium" style={{ color: tier.color }}>{totalCompleted} / {prog.tierEnd}</p>
            <p className="text-xs" style={{ color: next.color }}>{prog.tierEnd} зак.</p>
          </div>

          {/* Next commission hint */}
          <div
            className="mt-3 rounded-lg px-3 py-2 flex items-center justify-between"
            style={{ background: 'rgba(0,0,0,0.18)', border: `1px solid ${next.color}25` }}
          >
            <p className="text-xs text-white/50">
              На <span style={{ color: next.color }} className="font-semibold">{next.name}</span> — комиссия станет
            </p>
            <p className="text-sm font-bold" style={{ color: next.color }}>{next.commission}% 🚀</p>
          </div>
        </div>
      )}

      {isMaxTier && (
        <div
          className="rounded-lg px-3 py-2 text-center"
          style={{ background: 'rgba(0,0,0,0.18)', border: `1px solid ${tier.color}30` }}
        >
          <p className="text-xs" style={{ color: tier.color }}>
            👑 Вы на максимальном уровне — {tier.commission}% комиссии!
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Мини-шкала всех уровней
// ─────────────────────────────────────────────
function TierRoadmap({ totalCompleted }: { totalCompleted: number }) {
  const current = getTierByOrders(totalCompleted)
  return (
    <div
      className="rounded-xl px-4 py-3 mb-6 flex items-center gap-1 overflow-x-auto"
      style={{ background: 'rgba(10,26,10,0.7)', border: '1px solid rgba(74,222,128,0.07)' }}
    >
      {TIERS.map((tier, i) => {
        const reached = totalCompleted >= tier.minOrders
        const active = tier.name === current.name
        return (
          <div key={tier.name} className="flex items-center gap-1 flex-shrink-0">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: reached ? `${tier.color}22` : 'rgba(255,255,255,0.04)',
                  border: active ? `2px solid ${tier.color}` : reached ? `1px solid ${tier.color}50` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: active ? `0 0 10px ${tier.color}50` : 'none',
                  opacity: reached ? 1 : 0.4,
                }}
              >
                {tier.emoji}
              </div>
              <p
                className="text-xs mt-0.5 font-medium"
                style={{ color: active ? tier.color : reached ? `${tier.color}90` : 'rgba(255,255,255,0.2)', fontSize: '10px' }}
              >
                {tier.name}
              </p>
            </div>
            {i < TIERS.length - 1 && (
              <div
                className="h-0.5 w-6 rounded-full mb-4"
                style={{ background: totalCompleted >= TIERS[i + 1].minOrders ? `${TIERS[i+1].color}60` : 'rgba(255,255,255,0.06)' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
export function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [profile, setProfile] = useState<VetProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setPhotoUrl(getStoredPhoto())
    Promise.all([getOrders(), getVetProfile()])
      .then(([o, p]) => {
        setOrders(o)
        setProfile(p)
        if (!getStoredPhoto() && p.photo_url) setPhotoUrl(p.photo_url)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setStoredPhoto(dataUrl)
      setPhotoUrl(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handlePhotoDelete() {
    removeStoredPhoto()
    setPhotoUrl(null)
  }

  // Initials fallback
  const initials = (user?.name ?? '')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const newOrders = orders.filter(o => o.status === 'pending')
  const activeOrders = orders.filter(o => ['confirmed', 'in_progress'].includes(o.status))
  const doneOrders = orders.filter(o => o.status === 'completed')

  // Career total: use backend value or fallback to local visible count
  const totalCompleted = profile?.total_completed_orders ?? doneOrders.length

  const stats = [
    { label: 'Новые заказы', value: newOrders.length, icon: Zap, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
    { label: 'Активные', value: activeOrders.length, icon: Clock, color: '#60a5fa', bg: 'rgba(96,165,250,0.08)' },
    { label: 'Выполнено', value: doneOrders.length, icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
    { label: 'Всего завершено', value: totalCompleted, icon: Award, color: '#c084fc', bg: 'rgba(192,132,252,0.08)' },
  ]

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 animate-fade-in flex gap-5 items-start max-w-7xl mx-auto">
      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
      {/* ── Hero banner with dog + vet photo ── */}
      <div className="hero-banner mb-6 animate-fade-up">
        <img src={publicAsset('golden-retriever.jpg')} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(4,10,4,0.78) 50%, rgba(4,10,4,0.30) 100%)' }} />
        <div className="relative z-10 p-6 md:p-8 flex items-center gap-5 md:gap-7">

          {/* Avatar with photo controls */}
          <div className="relative flex-shrink-0 group">
            {/* Avatar circle */}
            <div
              className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-white"
              style={{
                border: '3px solid rgba(74,222,128,0.6)',
                boxShadow: '0 0 24px rgba(74,222,128,0.25)',
                background: photoUrl ? 'transparent' : 'linear-gradient(135deg, #1a3a1a, #0d1f0d)',
              }}
            >
              {photoUrl
                ? <img src={photoUrl} alt="Фото" className="w-full h-full object-cover" />
                : <span style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>{initials || '👤'}</span>
              }
            </div>

            {/* Camera overlay button — always visible on mobile, hover on desktop */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200
                         opacity-100 md:opacity-0 md:group-hover:opacity-100"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
              title="Изменить фото"
            >
              <Camera size={22} className="text-white drop-shadow-lg" />
            </button>

            {/* Delete button — bottom-right badge */}
            {photoUrl && (
              <button
                onClick={handlePhotoDelete}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center
                           transition-all hover:scale-110 active:scale-95 z-10"
                style={{ background: '#ef4444', border: '2px solid rgba(4,10,4,0.8)', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}
                title="Удалить фото"
              >
                <Trash2 size={13} className="text-white" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Name + date */}
          <div className="min-w-0">
            <p className="text-green-400/80 text-xs font-semibold uppercase tracking-widest mb-1.5">С возвращением</p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
              {user?.name || 'Доктор'} 👋
            </h1>
            <p className="text-white/55 text-sm">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            {!photoUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2.5 flex items-center gap-1.5 text-xs text-green-400/70 hover:text-green-400 transition-colors"
              >
                <Camera size={13} />
                Добавить фото профиля
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Motivation block */}
      {profile && <MotivationBlock profile={profile} completedCount={doneOrders.length} />}

      {/* Tier roadmap */}
      <TierRoadmap totalCompleted={totalCompleted} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-4 animate-fade-up glass-card-hover"
            style={{ animationDelay: `${0.1 + stats.indexOf(stats.find(s => s.label === label)!) * 0.08}s`, background: bg, border: `1px solid ${color}20` }}
          >
            <div className="flex items-center justify-between mb-3">
              <Icon size={18} style={{ color }} />
              <TrendingUp size={14} className="text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Availability toggle */}
      {profile && (
        <div
          className="flex items-center justify-between rounded-xl p-4 mb-6"
          style={{ background: 'rgba(10,26,10,0.8)', border: '1px solid rgba(74,222,128,0.1)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${profile.is_available ? 'bg-green-400' : 'bg-gray-600'}`}
              style={profile.is_available ? { boxShadow: '0 0 8px rgba(74,222,128,0.6)' } : {}}
            />
            <div>
              <p className="text-white text-sm font-semibold">
                {profile.is_available ? 'Вы доступны для вызовов' : 'Вы недоступны'}
              </p>
              <p className="text-gray-400 text-xs">
                {profile.specialization || 'Специализация не указана'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="text-xs text-green-400 font-medium hover:text-green-300"
          >
            Изменить
          </button>
        </div>
      )}

      {/* New orders alert */}
      {newOrders.length > 0 && (
        <div
          className="rounded-xl p-4 mb-6 cursor-pointer hover:opacity-90 transition-opacity"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(251,191,36,0.04))',
            border: '1px solid rgba(251,191,36,0.25)',
          }}
          onClick={() => navigate('/orders')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(251,191,36,0.15)' }}
              >
                <Zap size={20} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {newOrders.length === 1 ? '1 новый заказ' : `${newOrders.length} новых заказа`}
                </p>
                <p className="text-xs" style={{ color: '#fcd34d' }}>Ожидают принятия</p>
              </div>
            </div>
            <ChevronRight size={18} style={{ color: '#fbbf24' }} />
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <ClipboardList size={18} className="text-green-400" />
            Последние заказы
          </h2>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm text-green-400 hover:text-green-300 font-medium"
          >
            Все заказы
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: 'rgba(10,26,10,0.6)', border: '1px solid rgba(74,222,128,0.06)' }}
          >
            <ClipboardList size={32} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Заказов пока нет</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map(order => (
              <div
                key={order.id}
                className="rounded-xl p-4 cursor-pointer glass-card-hover"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{order.service_icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-white font-semibold text-sm">{order.service_name}</p>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-gray-400 text-xs truncate">{order.client_name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={11} />
                          {order.address}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={11} />
                          {formatDate(order.scheduled_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <p className="text-green-400 text-sm font-bold">{formatPrice(order.total_price)}</p>
                    <ChevronRight size={16} className="text-gray-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>{/* end main content */}
    </div>
  )
}
