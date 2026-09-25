import { isDemoMode } from '../demo/demoMode'
import { DEMO_ORDERS, DEMO_PROFILE } from '../demo/mockData'

const BASE_URL = ''  // Vite proxy — /api/* → бэкенд
const APP_BASE_URL = import.meta.env.BASE_URL

function getToken(): string | null {
  return localStorage.getItem('vet_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    throw new Error('Нет соединения с сервером. Убедитесь, что основной проект запущен.')
  }

  if (res.status === 401) {
    localStorage.removeItem('vet_token')
    localStorage.removeItem('vet_user')
    window.location.href = `${APP_BASE_URL}login`
    throw new Error('Не авторизован')
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('Сервер недоступен. Запустите основной проект и попробуйте снова.')
  }

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Ошибка сервера')
  }
  return data as T
}

// Auth
export interface User {
  id: number
  name: string
  phone: string
  email: string | null
  role: string
}

export interface AuthResponse {
  token: string
  user: User
}

export async function login(phone: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  })
}

export async function register(name: string, phone: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, password, role: 'vet' }),
  })
}

// Orders
export interface OrderHistory {
  id: number
  order_id: number
  status: string
  comment: string
  created_at: string
}

export interface Order {
  id: number
  client_id: number
  vet_id: number | null
  pet_id: number | null
  service_id: number
  address: string
  address_lat: number | null
  address_lng: number | null
  scheduled_at: string
  status: string
  notes: string | null
  total_price: number
  created_at: string
  updated_at: string
  client_name: string
  client_phone: string
  pet_name: string | null
  pet_species: string | null
  pet_breed: string | null
  service_name: string
  service_icon: string
  price_from: number
  price_to: number
  vet_name: string | null
  history?: OrderHistory[]
}

export async function getOrders(status?: string): Promise<Order[]> {
  if (isDemoMode()) {
    await delay(300)
    return status ? DEMO_ORDERS.filter(o => o.status === status) : DEMO_ORDERS
  }
  const qs = status ? `?status=${status}` : ''
  return request<Order[]>(`/api/orders${qs}`)
}

export async function getOrder(id: number): Promise<Order> {
  if (isDemoMode()) {
    await delay(200)
    const order = DEMO_ORDERS.find(o => o.id === id)
    if (!order) throw new Error('Заказ не найден')
    return order
  }
  return request<Order>(`/api/orders/${id}`)
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  if (isDemoMode()) {
    await delay(400)
    const order = DEMO_ORDERS.find(o => o.id === id)
    if (!order) throw new Error('Заказ не найден')
    order.status = status
    order.updated_at = new Date().toISOString()
    order.history = order.history || []
    const labels: Record<string, string> = {
      confirmed: 'Ветеринар принял заказ',
      in_progress: 'Начат приём',
      completed: 'Завершён успешно',
      cancelled: 'Отменён',
    }
    order.history.push({
      id: Date.now(),
      order_id: id,
      status,
      comment: labels[status] || status,
      created_at: new Date().toISOString(),
    })
    return order
  }
  return request<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// Vet Profile
export interface VetProfile {
  id: number
  user_id: number
  specialization: string | null
  experience_years: number
  rating: string
  reviews_count: number
  bio: string | null
  photo_url: string | null
  is_available: boolean
  is_verified: boolean
  lat: number | null
  lng: number | null
  created_at: string
  name?: string
  phone?: string
  email?: string | null
  // Career stats (may not be in API yet — computed client-side for demo)
  total_completed_orders?: number
  total_earnings?: number   // gross (before commission split)
}

export async function getVetProfile(): Promise<VetProfile> {
  if (isDemoMode()) {
    await delay(200)
    return DEMO_PROFILE
  }
  return request<VetProfile>('/api/vets/profile')
}

export async function updateVetProfile(data: Partial<VetProfile>): Promise<VetProfile> {
  if (isDemoMode()) {
    await delay(400)
    Object.assign(DEMO_PROFILE, data)
    return DEMO_PROFILE
  }
  return request<VetProfile>('/api/vets/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
