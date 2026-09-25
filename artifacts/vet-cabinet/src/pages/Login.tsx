import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api'
import { enableDemoMode, disableDemoMode } from '../demo/demoMode'
import { DEMO_USER, DEMO_TOKEN } from '../demo/mockData'
import { Eye, EyeOff, Phone, Lock, User, Zap } from 'lucide-react'
import { publicAsset } from '../utils/publicAsset'

export function Login() {
  const { setAuth, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    disableDemoMode()
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    await new Promise(r => setTimeout(r, 600))
    enableDemoMode()
    setAuth(DEMO_TOKEN, DEMO_USER)
    navigate('/dashboard', { replace: true })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let res
      if (mode === 'login') {
        res = await login(phone, password)
      } else {
        if (!name.trim()) { setError('Введите имя'); setLoading(false); return }
        res = await register(name.trim(), phone, password)
      }
      disableDemoMode()
      setAuth(res.token, res.user)
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-0"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.08) 0%, #040a04 60%)',
      }}
    >
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)' }} />
      </div>

      <div className="w-full max-w-6xl min-h-screen md:min-h-0 md:grid md:grid-cols-[1.05fr_.95fr] relative z-10 md:rounded-3xl overflow-hidden md:border md:border-green-400/10 md:shadow-2xl">
        <div className="hero-banner min-h-[270px] md:min-h-[650px] rounded-none flex items-end p-7 md:p-12">
          <img src={publicAsset('vet-hands-cat.jpg')} alt="Ветеринар осматривает питомца" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative z-10 max-w-md animate-fade-up">
            <div className="text-amber-300 text-xs uppercase tracking-[.25em] mb-4">Ветеринар на дом</div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">Точность в каждом прикосновении.</h2>
            <p className="text-white/65 mt-4 text-sm md:text-base">Ваш рабочий кабинет для спокойных решений и заботы о тех, кто не может рассказать, что болит.</p>
          </div>
        </div>
        <div className="px-5 py-10 md:p-12 bg-[#071108]/95">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-fade-up delay-1">
          <div className="relative mb-4">
            <div
              className="w-24 h-24 rounded-full overflow-hidden"
              style={{ boxShadow: '0 0 0 3px rgba(74,222,128,0.3), 0 0 40px rgba(34,197,94,0.25), 0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <img src={publicAsset('logo.jpeg')} alt="Ветеринар на дом" className="w-full h-full object-cover" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: '2px solid #040a04', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}
            >
              <span className="text-white text-xs">✓</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Ветеринар на дом</h1>
          <p className="text-gray-400 text-sm">Личный кабинет ветеринара</p>
        </div>

        {/* Demo button */}
        <button
          onClick={handleDemoLogin}
          disabled={demoLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl mb-4 font-bold text-sm transition-all shimmer animate-fade-up delay-2"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.08))',
            border: '1px solid rgba(251,191,36,0.4)',
            color: '#fbbf24',
            boxShadow: '0 4px 20px rgba(251,191,36,0.1)',
          }}
        >
          {demoLoading ? (
            <span className="w-5 h-5 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          ) : (
            <Zap size={18} fill="currentColor" />
          )}
          {demoLoading ? 'Входим...' : '⚡ Демо-вход — без регистрации'}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-gray-600 text-xs">или войдите со своим аккаунтом</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Card */}
        <div className="rounded-2xl p-6 animate-scale-in delay-3"
          style={{
            background: 'rgba(10, 26, 10, 0.85)',
            border: '1px solid rgba(74,222,128,0.12)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          }}>
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={
                  mode === m
                    ? { background: 'rgba(34,197,94,0.2)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }
                    : { background: 'transparent', color: '#6b7280', border: '1px solid transparent' }
                }
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input className="input-field pl-10" type="text" placeholder="Ваше имя"
                  value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}

            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="input-field pl-10" type="text" placeholder="+7 999 000 00 00"
                value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input className="input-field pl-10 pr-10" type={showPass ? 'text' : 'password'}
                placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                onClick={() => setShowPass(v => !v)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary mt-1" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Входим...' : 'Регистрируем...'}
                </span>
              ) : (
                mode === 'login' ? 'Войти' : 'Зарегистрироваться'
              )}
            </button>
          </form>
        </div></div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Ветеринар на дом — профессиональная помощь питомцам
        </p>
      </div>
    </div>
  )
}
