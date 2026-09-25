import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrder, updateOrderStatus, type Order } from '../api'
import { StatusBadge, formatDateTime, formatPrice, STATUS_TRANSITIONS, getStatusConfig } from '../components/OrderHelpers'
import {
  ArrowLeft, MapPin, Calendar, Phone, User, PawPrint,
  Stethoscope, DollarSign, Clock, CheckCircle2, XCircle,
  AlertCircle
} from 'lucide-react'
import { publicAsset } from '../utils/publicAsset'

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [cancelConfirm, setCancelConfirm] = useState(false)

  useEffect(() => {
    if (!id) return
    getOrder(Number(id))
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    setUpdating(true)
    setError('')
    try {
      const updated = await updateOrderStatus(order.id, newStatus)
      setOrder(prev => prev ? { ...prev, ...updated } : prev)
      // Refresh to get history
      const full = await getOrder(order.id)
      setOrder(full)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка обновления')
    } finally {
      setUpdating(false)
      setCancelConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin" />
       </div>
    )
  }

  if (!order) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Заказ не найден</p>
        <button onClick={() => navigate('/orders')} className="btn-primary mt-4">
          Назад к заказам
        </button>
       </div>
    )
  }

  const transition = STATUS_TRANSITIONS[order.status]

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="hero-banner min-h-[190px] mb-6 flex items-end">
        <img src={publicAsset('medical-tools.jpg')} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="relative z-10 p-5 w-full">
        <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeft size={18} className="text-gray-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Заказ #{order.id}</h1>
          <div className="mt-0.5"><StatusBadge status={order.status} /></div>
         </div>
        </div></div></div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}
        >
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Action buttons */}
      {order.status !== 'completed' && order.status !== 'cancelled' && (
        <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(10,26,10,0.8)', border: '1px solid rgba(74,222,128,0.1)' }}>
          <p className="text-gray-400 text-xs mb-3 font-medium uppercase tracking-wide">Действия</p>
          <div className="flex gap-3 flex-wrap">
            {transition && (
              <button
                onClick={() => handleStatusChange(transition.next)}
                disabled={updating}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all animate-glow-pulse"
                style={{
                  background: `${transition.color}22`,
                  color: transition.color,
                  border: `1px solid ${transition.color}44`,
                  opacity: updating ? 0.6 : 1,
                }}
              >
                {updating ? (
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {transition.label}
              </button>
            )}

            {!cancelConfirm ? (
              <button
                onClick={() => setCancelConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <XCircle size={16} />
                Отменить заказ
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Уверены?</span>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updating}
                  className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  Да, отменить
                </button>
                <button
                  onClick={() => setCancelConfirm(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  Нет
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info sections */}
      <div className="flex flex-col gap-4">

        {/* Service */}
        <InfoCard>
          <InfoRow icon={<Stethoscope size={15} className="text-green-400" />} label="Услуга">
            <span className="text-white">{order.service_icon} {order.service_name}</span>
          </InfoRow>
          <InfoRow icon={<DollarSign size={15} className="text-green-400" />} label="Стоимость">
            <span className="text-green-400 font-bold">{formatPrice(order.total_price)}</span>
            {order.price_from && order.price_to && (
              <span className="text-gray-500 text-xs ml-2">
                ({formatPrice(order.price_from)} – {formatPrice(order.price_to)})
              </span>
            )}
          </InfoRow>
          <InfoRow icon={<Calendar size={15} className="text-green-400" />} label="Дата вызова">
            <span className="text-white">{formatDateTime(order.scheduled_at)}</span>
          </InfoRow>
          {order.notes && (
            <InfoRow icon={<Clock size={15} className="text-green-400" />} label="Примечание">
              <span className="text-gray-300">{order.notes}</span>
            </InfoRow>
          )}
        </InfoCard>

        {/* Client */}
        <InfoCard title="Клиент">
          <InfoRow icon={<User size={15} className="text-blue-400" />} label="Имя">
            <span className="text-white">{order.client_name}</span>
          </InfoRow>
          <InfoRow icon={<Phone size={15} className="text-blue-400" />} label="Телефон">
            <a
              href={`tel:${order.client_phone}`}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {order.client_phone}
            </a>
          </InfoRow>
          <InfoRow icon={<MapPin size={15} className="text-blue-400" />} label="Адрес">
            <div>
              <p className="text-white">{order.address}</p>
              {order.address_lat && order.address_lng && (
                <a
                  href={`https://maps.yandex.ru/?ll=${order.address_lng},${order.address_lat}&z=16&pt=${order.address_lng},${order.address_lat}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-green-400 hover:text-green-300 mt-1 inline-block"
                >
                  Открыть на карте →
                </a>
              )}
            </div>
          </InfoRow>
        </InfoCard>

        {/* Pet */}
        {(order.pet_name || order.pet_species) && (
          <InfoCard title="Питомец">
            {order.pet_name && (
              <InfoRow icon={<PawPrint size={15} className="text-amber-400" />} label="Кличка">
                <span className="text-white">{order.pet_name}</span>
              </InfoRow>
            )}
            {order.pet_species && (
              <InfoRow icon={<PawPrint size={15} className="text-amber-400" />} label="Вид">
                <span className="text-white">{order.pet_species}</span>
              </InfoRow>
            )}
            {order.pet_breed && (
              <InfoRow icon={<PawPrint size={15} className="text-amber-400" />} label="Порода">
                <span className="text-white">{order.pet_breed}</span>
              </InfoRow>
            )}
          </InfoCard>
        )}

        {/* History */}
        {order.history && order.history.length > 0 && (
          <InfoCard title="История статусов">
            <div className="flex flex-col gap-3">
              {[...order.history].reverse().map((h, i) => {
                const cfg = getStatusConfig(h.status)
                return (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full mt-1.5" style={{ background: cfg.dot }} />
                      {i < order.history!.length - 1 && (
                        <div className="w-px flex-1 mt-1" style={{ background: 'rgba(255,255,255,0.06)', minHeight: '16px' }} />
                      )}
                    </div>
                    <div className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="text-gray-600 text-xs">{formatDateTime(h.created_at)}</span>
                      </div>
                      {h.comment && <p className="text-gray-400 text-xs mt-0.5">{h.comment}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </InfoCard>
        )}
      </div>
    </div>
  )
}

function InfoCard({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(10,26,10,0.8)', border: '1px solid rgba(74,222,128,0.08)' }}
    >
      {title && <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3">{title}</p>}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex items-center gap-1.5 min-w-[100px] flex-shrink-0 mt-0.5">
        {icon}
        <span className="text-gray-500 text-xs">{label}</span>
      </div>
      <div className="text-sm">{children}</div>
    </div>
  )
}
