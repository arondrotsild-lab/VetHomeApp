import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  ClipboardList,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Trophy,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { getTierByOrders } from '../utils/vetLevels'
import { getStoredPhoto } from '../utils/photoStorage'
import { publicAsset } from '../utils/publicAsset'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/orders', icon: ClipboardList, label: 'Заказы' },
  { to: '/profile', icon: User, label: 'Профиль' },
  { to: '/league', icon: Trophy, label: 'Лига ветеринаров' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(getStoredPhoto)

  // Re-read photo when vet updates it in Profile
  useEffect(() => {
    const handler = () => setPhotoUrl(getStoredPhoto())
    window.addEventListener('vet-photo-changed', handler)
    return () => window.removeEventListener('vet-photo-changed', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-5'}`}
      style={{ background: 'rgba(6, 13, 6, 0.97)', borderRight: '1px solid rgba(74,222,128,0.08)' }}
    >
      {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-2 animate-slide-left">
        <div
          className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ boxShadow: '0 0 0 2px rgba(74,222,128,0.35), 0 4px 16px rgba(34,197,94,0.25)', animation: 'glowPulse 3s infinite' }}
        >
          <img src={publicAsset('logo.jpeg')} alt="Логотип" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-white text-sm leading-tight" style={{ fontWeight: 700 }}>Ветеринар на дом</p>
          <p className="text-green-400 text-xs" style={{ fontWeight: 500 }}>Личный кабинет</p>
        </div>
      </div>

      {/* User info */}
      <div
        className="flex items-center gap-3 p-3 rounded-xl mb-6"
        style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.1)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #22c55e33, #16a34a33)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}
        >
          {photoUrl
            ? <img src={photoUrl} alt="Фото" className="w-full h-full object-cover" />
            : (user?.name?.charAt(0)?.toUpperCase() || 'В')
          }
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
           <p className="text-green-400 text-xs">{getTierByOrders(0).emoji} Ветеринар</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isLeague = to === '/league'
          return (
            <div key={to}>
              {/* Divider before League */}
              {isLeague && (
                <div className="mx-2 my-2" style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.25), transparent)' }} />
              )}
              <NavLink
                to={to}
                className={({ isActive }) =>
                  isLeague
                    ? `nav-item animate-slide-left delay-${navItems.findIndex(i => i.to === to) + 1} ${isActive ? 'active' : ''}`
                    : `nav-item animate-slide-left delay-${navItems.findIndex(i => i.to === to) + 1} ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => isLeague ? {
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(251,191,36,0.1))'
                    : 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,191,36,0.04))',
                  border: `1px solid ${isActive ? 'rgba(251,191,36,0.45)' : 'rgba(251,191,36,0.2)'}`,
                  color: '#fbbf24',
                  boxShadow: isActive ? '0 0 16px rgba(251,191,36,0.2)' : '0 0 8px rgba(251,191,36,0.08)',
                  borderRadius: '0.75rem',
                  marginTop: 2,
                } : {}}
              >
                <Icon size={18} style={isLeague ? { color: '#fbbf24', filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' } : {}} />
                <span style={isLeague ? { color: '#fbbf24', fontWeight: 700 } : {}}>{label}</span>
                {isLeague && (
                  <span
                    className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '9px', letterSpacing: '0.05em' }}
                  >
                    LIVE
                  </span>
                )}
              </NavLink>
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="nav-item w-full text-left mt-4"
        style={{ border: 'none', background: 'none', cursor: 'pointer' }}
      >
        <LogOut size={18} className="text-red-400" />
        <span className="text-red-400">Выйти</span>
      </button>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#040a04' }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <Sidebar mobile />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(74,222,128,0.22)', background: 'linear-gradient(180deg,rgba(6,20,10,.98),rgba(6,13,6,.97))' }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
              <Menu size={22} />
            </button>
            <span className="text-white font-semibold">Ветеринар</span>
          </div>
          <Bell size={20} className="text-gray-400" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
