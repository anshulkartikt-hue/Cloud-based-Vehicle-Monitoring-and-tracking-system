import React, { useEffect, useState } from 'react';
import { MoonIcon, SunIcon, BellIcon } from 'lucide-react';
import { Panel } from '../components/Panel';
import {
  areNotificationsEnabled,
  saveNotificationsEnabled,
} from '../utils/notificationPreferences';

export function SettingsPage({
  isDark,
  onToggleTheme,
}: {
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => areNotificationsEnabled()
  );

  const [permission, setPermission] = useState<
    NotificationPermission | 'unsupported'
  >(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);

    // If browser permission was revoked, turn notifications off.
    if (Notification.permission !== 'granted') {
      setNotificationsEnabled(false);
      saveNotificationsEnabled(false);
    }
  }, []);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      setNotificationsEnabled(false);
      saveNotificationsEnabled(false);
      return;
    }

    // Turn notifications off.
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      saveNotificationsEnabled(false);
      return;
    }

    // Request permission if the browser has not asked before.
    let currentPermission = Notification.permission;

    if (currentPermission === 'default') {
      currentPermission = await Notification.requestPermission();
    }

    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      setNotificationsEnabled(true);
      saveNotificationsEnabled(true);

      new Notification('Vehicle Monitoring System', {
        body: 'Browser notifications are enabled successfully.',
        icon: '/favicon.ico',
      });
    } else {
      setNotificationsEnabled(false);
      saveNotificationsEnabled(false);
    }
  };

  const notificationDescription =
    permission === 'unsupported'
      ? 'Your browser does not support notifications.'
      : permission === 'denied'
        ? 'Notifications are blocked by your browser. Allow them in your browser site settings.'
        : notificationsEnabled
          ? 'You will receive browser notifications for abnormal vehicle conditions.'
          : 'Enable notifications to receive alerts about abnormal vehicle conditions.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Customize your dashboard preferences.
        </p>
      </div>

      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-surface2 p-3">
              {isDark ? (
                <MoonIcon className="h-5 w-5 text-ink" />
              ) : (
                <SunIcon className="h-5 w-5 text-ink" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-ink">Appearance</h2>
              <p className="text-sm text-muted">
                Switch between light and dark mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface2"
          >
            {isDark ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </Panel>

      <Panel>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-surface2 p-3">
              <BellIcon className="h-5 w-5 text-ink" />
            </div>

            <div>
              <h2 className="font-semibold text-ink">
                Browser Notifications
              </h2>
              <p className="mt-1 text-sm text-muted">
                {notificationDescription}
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={notificationsEnabled}
            aria-label="Enable browser notifications"
            disabled={permission === 'unsupported'}
            onClick={toggleNotifications}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              notificationsEnabled ? 'bg-accent' : 'bg-line'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                notificationsEnabled
                  ? 'translate-x-6'
                  : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {permission === 'denied' && (
          <p className="mt-4 text-sm text-danger">
            Notifications are blocked in your browser. Change the site
            notification permission in your browser settings, then return here.
          </p>
        )}
      </Panel>
    </div>
  );
}