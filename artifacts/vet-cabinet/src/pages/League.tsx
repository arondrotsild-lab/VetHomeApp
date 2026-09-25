import { Leaderboard } from '../components/Leaderboard'

export function League() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">🏆 Лига ветеринаров</h1>
        <p className="text-gray-400 text-sm">Рейтинг ветеринаров сервиса в реальном времени</p>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ minHeight: 600 }}>
        <Leaderboard />
      </div>
    </div>
  )
}
