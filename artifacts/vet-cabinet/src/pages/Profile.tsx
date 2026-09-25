import { useEffect, useRef, useState } from 'react'
import { getVetProfile, updateVetProfile, type VetProfile } from '../api'
import { useAuth } from '../context/AuthContext'
import {
  Star, Phone, Mail, Briefcase, Clock, Shield,
  ToggleLeft, ToggleRight, CheckCircle2, AlertCircle,
  Edit2, Save, X, Camera, Trash2, User, Wallet, Award,
} from 'lucide-react'
import { getStoredPhoto, setStoredPhoto, removeStoredPhoto } from '../utils/photoStorage'
import { getTierByOrders } from '../utils/vetLevels'

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<VetProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    specialization: '',
    experience_years: 0,
    bio: '',
    is_available: false,
  })

  useEffect(() => {
    setPhotoUrl(getStoredPhoto())
    getVetProfile()
      .then(p => {
        setProfile(p)
        setForm({
          specialization: p.specialization || '',
          experience_years: p.experience_years || 0,
          bio: p.bio || '',
          is_available: p.is_available,
        })
        if (!getStoredPhoto() && p.photo_url) setPhotoUrl(p.photo_url)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string
      setStoredPhoto(dataUrl)
      setPhotoUrl(dataUrl)
      flash('success', 'Фото обновлено')
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handlePhotoDelete = () => {
    removeStoredPhoto()
    setPhotoUrl(null)
    flash('success', 'Фото удалено')
  }

  const handleToggleAvailable = async () => {
    if (!profile) return
    try {
      const updated = await updateVetProfile({ is_available: !profile.is_available })
      setProfile(updated)
      setForm(f => ({ ...f, is_available: updated.is_available }))
      flash('success', updated.is_available ? 'Вы доступны для вызовов' : 'Вы отключили доступность')
    } catch (e: unknown) {
      flash('error', e instanceof Error ? e.message : 'Ошибка')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const updated = await updateVetProfile(form)
      setProfile(updated)
      setEditing(false)
      flash('success', 'Профиль обновлён')
    } catch (e: unknown) {
      flash('error', e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!profile) return
    setForm({
      specialization: profile.specialization || '',
      experience_years: profile.experience_years || 0,
      bio: profile.bio || '',
      is_available: profile.is_available,
    })
    setEditing(false)
    setError('')
  }

  function flash(type: 'success' | 'error', msg: string) {
    if (type === 'success') { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
    else { setError(msg); setTimeout(() => setError(''), 4000) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-green-500/30 border-t-green-400 animate-spin" />
      </div>
    )
  }

  const initials = (user?.name ?? '')
    .split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase() || 'ВТ'

  const totalOrders = profile?.total_completed_orders ?? 0
  const tier = getTierByOrders(totalOrders)
  const grossEarnings = profile?.total_earnings ?? 0
  const myEarnings = Math.round(grossEarnings * (tier.commission / 100))

  const stats = [
    { icon: Star, label: 'Рейтинг', value: Number(profile?.rating ?? 0).toFixed(1), sub: `${profile?.reviews_count ?? 0} отзывов`, color: '#fbbf24' },
    { icon: Award, label: 'Статус', value: tier.emoji, sub: tier.name, color: tier.color },
    { icon: CheckCircle2, label: 'Заказов', value: String(totalOrders), sub: 'завершено', color: '#4ade80' },
    { icon: Wallet, label: 'Заработано', value: myEarnings > 0 ? new Intl.NumberFormat('ru-RU').format(myEarnings * 2) : '—', sub: '₽', color: '#a78bfa' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="flex-1 min-w-0">

      {/* ─── Hero ─── */}
      <div
        className="relative overflow-hidden"
        style={{ minHeight: 280 }}
      >
        {/* Layered background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #0a1f0a 0%, #040a04 40%, #0d1a0d 100%)',
          }}
        />
        {/* Decorative radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(74,222,128,0.09) 0%, transparent 70%)',
          }}
        />
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(74,222,128,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center pt-10 pb-6 px-6">

          {/* Avatar */}
          <div className="relative group mb-4">
            <div
              className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold"
              style={{
                background: photoUrl ? 'transparent' : `linear-gradient(135deg, ${tier.gradientFrom}55, ${tier.gradientTo}33)`,
                border: `3px solid ${tier.color}80`,
                boxShadow: `0 0 0 6px ${tier.color}12, 0 0 40px ${tier.color}25`,
                color: tier.color,
              }}
            >
              {photoUrl
                ? <img src={photoUrl} alt="Фото" className="w-full h-full object-cover" />
                : <span style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>{initials}</span>
              }
            </div>

            {/* Camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}
            >
              <Camera size={22} className="text-white" />
            </button>

            {/* Delete badge */}
            {photoUrl && (
              <button
                onClick={handlePhotoDelete}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all hover:scale-110"
                style={{ background: '#ef4444', border: '2px solid #040a04', boxShadow: '0 2px 8px rgba(239,68,68,0.5)' }}
              >
                <Trash2 size={12} className="text-white" />
              </button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white text-center leading-tight mb-1">
            {user?.name || 'Доктор'}
          </h1>

          {/* Specialization */}
          <p className="text-sm mb-3" style={{ color: tier.color }}>
            {form.specialization || 'Специализация не указана'}
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Tier badge */}
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
              style={{ background: `${tier.color}18`, color: tier.color, border: `1px solid ${tier.color}40` }}
            >
              {tier.emoji} {tier.name}
            </span>

            {/* Verified */}
            {profile?.is_verified && (
              <span className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                <Shield size={11} /> Верифицирован
              </span>
            )}

            {/* Availability */}
            <span
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition-all hover:opacity-80"
              style={profile?.is_available
                ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }
                : { background: 'rgba(107,114,128,0.12)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.25)' }
              }
              onClick={handleToggleAvailable}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: profile?.is_available ? '#4ade80' : '#6b7280',
                  boxShadow: profile?.is_available ? '0 0 6px #4ade80' : 'none',
                }}
              />
              {profile?.is_available ? 'Принимаю вызовы' : 'Недоступен'}
            </span>

            {/* Add photo if missing */}
            {!photoUrl && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full transition-all hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Camera size={11} /> Добавить фото
              </button>
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #040a04)' }}
        />
      </div>

      {/* ─── Stats strip ─── */}
      <div className="px-4 md:px-6 -mt-2 mb-5">
        <div
          className="grid grid-cols-4 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(74,222,128,0.1)', background: 'rgba(8,18,8,0.9)' }}
        >
          {stats.map(({ icon: Icon, label, value, sub, color }, i) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center py-4 px-2 text-center"
              style={{
                borderRight: i < 3 ? '1px solid rgba(74,222,128,0.07)' : 'none',
              }}
            >
              <Icon size={15} className="mb-1.5" style={{ color }} />
              <p className="font-bold text-white text-lg leading-tight">{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Page body ─── */}
      <div className="px-4 md:px-6 max-w-2xl mx-auto pb-8 flex flex-col gap-3">

        {/* Alerts */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm animate-fade-up"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            <AlertCircle size={15} className="flex-shrink-0" />{error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm animate-fade-up"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
            <CheckCircle2 size={15} className="flex-shrink-0" />{success}
          </div>
        )}

        {/* ── Availability big toggle ── */}
        <button
          onClick={handleToggleAvailable}
          className="w-full rounded-2xl p-5 flex items-center justify-between transition-all duration-300 text-left"
          style={profile?.is_available
            ? { background: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.05))', border: '1px solid rgba(74,222,128,0.25)' }
            : { background: 'rgba(10,20,10,0.8)', border: '1px solid rgba(255,255,255,0.06)' }
          }
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={profile?.is_available
                ? { background: 'rgba(74,222,128,0.15)', boxShadow: '0 0 20px rgba(74,222,128,0.2)' }
                : { background: 'rgba(107,114,128,0.1)' }
              }
            >
              <span className="text-2xl">{profile?.is_available ? '🟢' : '⚫'}</span>
            </div>
            <div>
              <p className="font-bold text-white">
                {profile?.is_available ? 'Принимаю вызовы' : 'Недоступен для вызовов'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {profile?.is_available
                  ? 'Клиенты могут вас найти и записаться'
                  : 'Нажмите, чтобы стать доступным'}
              </p>
            </div>
          </div>
          {profile?.is_available
            ? <ToggleRight size={36} style={{ color: '#4ade80', filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.4))' }} />
            : <ToggleLeft size={36} className="text-gray-600" />
          }
        </button>

        {/* ── Professional info ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,18,8,0.9)', border: '1px solid rgba(74,222,128,0.08)' }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(74,222,128,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <Briefcase size={15} style={{ color: '#4ade80' }} />
              <p className="text-white font-semibold text-sm">Профессиональная информация</p>
            </div>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.15)' }}
              >
                <Edit2 size={12} /> Изменить
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
                >
                  <Save size={12} />
                  {saving ? 'Сохраняем…' : 'Сохранить'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <X size={12} /> Отмена
                </button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="p-5 flex flex-col gap-5">

            {/* Specialization */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Briefcase size={11} /> СПЕЦИАЛИЗАЦИЯ
              </label>
              {editing ? (
                <input
                  className="input-field"
                  value={form.specialization}
                  onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                  placeholder="Например: Хирург, Терапевт…"
                />
              ) : (
                <p className="text-white text-sm font-medium">
                  {form.specialization || <span className="text-gray-600 font-normal">Не указана</span>}
                </p>
              )}
            </div>

            {/* Experience */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Clock size={11} /> ОПЫТ РАБОТЫ
              </label>
              {editing ? (
                <input
                  className="input-field"
                  type="number"
                  min={0} max={60}
                  value={form.experience_years}
                  onChange={e => setForm(f => ({ ...f, experience_years: Number(e.target.value) }))}
                />
              ) : (
                <p className="text-white text-sm font-medium">
                  {form.experience_years
                    ? `${form.experience_years} ${form.experience_years === 1 ? 'год' : form.experience_years < 5 ? 'года' : 'лет'}`
                    : <span className="text-gray-600 font-normal">Не указан</span>
                  }
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <User size={11} /> О СЕБЕ
              </label>
              {editing ? (
                <textarea
                  className="input-field"
                  rows={4}
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Расскажите о своём опыте, подходе к работе, специализации…"
                  style={{ resize: 'vertical' }}
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: form.bio ? 'rgba(255,255,255,0.8)' : '#4b5563' }}>
                  {form.bio || 'Не заполнено'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Contacts ── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(8,18,8,0.9)', border: '1px solid rgba(74,222,128,0.08)' }}
        >
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: '1px solid rgba(74,222,128,0.07)' }}
          >
            <Phone size={15} style={{ color: '#4ade80' }} />
            <p className="text-white font-semibold text-sm">Контакты</p>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {user?.phone && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.12)' }}>
                  <Phone size={15} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Телефон</p>
                  <p className="text-white text-sm font-medium">{user.phone}</p>
                </div>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.12)' }}>
                  <Mail size={15} style={{ color: '#4ade80' }} />
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Email</p>
                  <p className="text-white text-sm font-medium">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      </div>
    </div>
  )
}
