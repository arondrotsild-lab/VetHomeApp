import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, type Order } from '../api'
import { StatusBadge, formatDate, formatPrice } from '../components/OrderHelpers'
import { ClipboardList, MapPin, Calendar, ChevronRight, Search, Filter, AlertCircle } from 'lucide-react'
import { publicAsset } from '../utils/publicAsset'

const FILTERS = [
  { label: 'Все', value: '' },
  { label: 'Новые', value: 'pending' },
  { label: 'Принятые', value: 'confirmed' },
  { label: 'В процессе', value: 'in_progress' },
  { label: 'Выполнены', value: 'completed' },
  { label: 'Отменены', value: 'cancelled' },
]

export function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getOrders()
      .then(setOrders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders
    .filter(o => !filter || o.status === filter)
    .filter(o => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        o.client_name?.toLowerCase().includes(q) ||
        o.service_name?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="hero-banner mb-6 min-h-[150px]">
        <img src={publicAsset('orders-animals-queue.jpg')} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(4,10,4,0.82) 40%, rgba(4,10,4,0.3) 100%)' }} />
        <div className="relative z-10 p-6">
          <p className="text-green-400/80 text-xs font-semibold uppercase tracking-widest mb-1">Вызовы</p>
          <h1 className="text-2xl font-bold text-white mb-1">Заказы</h1>
          <p className="text-white/60 text-sm">Управление вызовами и маршрутом дня</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          className="input-field pl-10"
          placeholder="Поиск по клиенту, услуге, адресу..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => {
          const count = f.value ? orders.filter(o => o.status === f.value).length : orders.length
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                filter === f.value
                  ? { background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <Filter size={11} />
              {f.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-xs"
                style={{
                  background: filter === f.value ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)',
                  color: filter === f.value ? '#4ade80' : '#4b5563',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: 'rgba(10,26,10,0.6)', border: '1px solid rgba(74,222,128,0.06)' }}
        >
          <ClipboardList size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Заказы не найдены</p>
          <p className="text-gray-600 text-sm mt-1">Попробуйте изменить фильтр или поиск</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
           {filtered.map((order, index) => (
            <div
              key={order.id}
               className={`rounded-xl p-4 cursor-pointer glass-card-hover animate-fade-up delay-${Math.min(index + 1, 5)}`}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0 mt-0.5">{order.service_icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">{order.service_name}</p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">{order.client_name}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} />
                      <span className="truncate max-w-[140px]">{order.address}</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={11} />
                      {formatDate(order.scheduled_at)}
                    </span>
                    {order.client_phone && (
                      <span className="text-xs text-gray-500">{order.client_phone}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-green-400 text-sm font-bold">{formatPrice(order.total_price)}</p>
                  <ChevronRight size={16} className="text-gray-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
