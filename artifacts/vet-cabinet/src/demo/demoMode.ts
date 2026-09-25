export const DEMO_STORAGE_KEY = 'vet_demo_mode'

export function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_STORAGE_KEY) === 'true'
}

export function enableDemoMode(): void {
  localStorage.setItem(DEMO_STORAGE_KEY, 'true')
}

export function disableDemoMode(): void {
  localStorage.removeItem(DEMO_STORAGE_KEY)
}
