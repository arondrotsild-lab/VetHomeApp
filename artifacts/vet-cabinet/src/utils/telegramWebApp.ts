interface TelegramWebApp {
  ready(): void
  expand(): void
  viewportHeight?: number
  onEvent(eventType: 'viewportChanged', callback: () => void): void
}

interface TelegramWindow extends Window {
  Telegram?: {
    WebApp?: TelegramWebApp
  }
}

export function initializeTelegramWebApp(): void {
  const webApp = (window as TelegramWindow).Telegram?.WebApp
  if (!webApp) return

  webApp.ready()
  webApp.expand()

  const updateViewportHeight = () => {
    const height = webApp.viewportHeight ?? window.innerHeight
    document.documentElement.style.setProperty('--tg-viewport-height', `${height}px`)
  }

  updateViewportHeight()
  webApp.onEvent('viewportChanged', updateViewportHeight)
}