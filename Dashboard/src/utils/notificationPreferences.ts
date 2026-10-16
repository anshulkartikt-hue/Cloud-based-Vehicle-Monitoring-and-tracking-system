const STORAGE_KEY = 'vehicle-monitoring-notifications-enabled';

export function areNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

export function saveNotificationsEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(STORAGE_KEY, String(enabled));
}
