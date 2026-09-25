const PHOTO_KEY = 'vet_photo'

export function getStoredPhoto(): string | null {
  return localStorage.getItem(PHOTO_KEY)
}

export function setStoredPhoto(dataUrl: string): void {
  localStorage.setItem(PHOTO_KEY, dataUrl)
  window.dispatchEvent(new Event('vet-photo-changed'))
}

export function removeStoredPhoto(): void {
  localStorage.removeItem(PHOTO_KEY)
  window.dispatchEvent(new Event('vet-photo-changed'))
}
