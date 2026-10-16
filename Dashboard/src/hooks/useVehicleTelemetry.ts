import { useCallback, useEffect, useRef, useState } from 'react';
import type { AlertType, VehicleAlert, VehicleReading } from '../types/vehicle';
import {
  generateReading,
  reconcileAlerts,
} from '../utils/telemetry';
import {
  subscribeToReadings,
  normalizeReading,
} from '../utils/dataSource';
import { areNotificationsEnabled } from '../utils/notificationPreferences';

const MAX_HISTORY = 500;

const HISTORY_API_URL =
  'https://yt32cw7u3a.execute-api.eu-north-1.amazonaws.com/prod/telemetry';

export interface TelemetryState {
  readings: VehicleReading[];
  latest: VehicleReading | null;
  alerts: VehicleAlert[];
  running: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
  triggerTest: (type: AlertType) => void;
  clearAlerts: () => void;
}

/**
 * AWS returns an object containing readings, newest first.
 * This helper also accepts an array in case the API format changes.
 */
function extractHistory(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload !== null &&
    typeof payload === 'object' &&
    'readings' in payload &&
    Array.isArray(payload.readings)
  ) {
    // Copy before reversing so the original response is not mutated.
    return [...payload.readings].reverse();
  }

  throw new Error('AWS History API returned an unexpected response.');
}

function getAlertNames(reading: VehicleReading): Set<string> {
  return new Set(
    (Array.isArray(reading.alerts) ? reading.alerts : [])
      .map((alert) => String(alert).toLowerCase())
  );
}

function notifyAbnormalConditions(reading: VehicleReading) {
  if (
    typeof window === 'undefined' ||
    !areNotificationsEnabled() ||
    !('Notification' in window) ||
    Notification.permission !== 'granted'
  ) {
    return;
  }

  const activeAlerts = Array.isArray(reading.alerts)
    ? reading.alerts
    : [];

  for (const alert of activeAlerts) {
    const alertName = String(alert).toLowerCase();

    let title = '';
    let message = '';

    if (alertName.includes('speed')) {
      title = 'High Speed Alert';
      message = `Vehicle ${reading.vehicle_id} is travelling at ${reading.speed_kmh} km/h.`;
    } else if (alertName.includes('temperature')) {
      title = 'High Temperature Alert';
      message = `Vehicle ${reading.vehicle_id} temperature is ${reading.temperature_c}°C.`;
    } else if (alertName.includes('battery')) {
      title = 'Low Battery Alert';
      message = `Vehicle ${reading.vehicle_id} battery is ${reading.battery_voltage} V.`;
    } else if (alertName.includes('vibration')) {
      title = 'High Vibration Alert';
      message = `Vehicle ${reading.vehicle_id} vibration is ${reading.vibration}.`;
    }

    if (title && message) {
      new Notification(title, {
        body: message,
        tag: `${reading.vehicle_id}-${alertName}`,
      });
    }
  }
}

export function useVehicleTelemetry(): TelemetryState {
  const [readings, setReadings] = useState<VehicleReading[]>([]);
  const [alerts, setAlerts] = useState<VehicleAlert[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastRef = useRef<VehicleReading | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const activeNotificationAlertsRef = useRef<Set<string>>(new Set());

  /**
   * Add a reading, update dashboard alerts, and notify only when
   * a new abnormal condition appears.
   */
  const ingest = useCallback((reading: VehicleReading) => {
    const currentAlerts = getAlertNames(reading);
    const previousAlerts = activeNotificationAlertsRef.current;

    for (const alert of currentAlerts) {
      if (!previousAlerts.has(alert)) {
        notifyAbnormalConditions({
          ...reading,
          alerts: [alert as AlertType],
        });
      }
    }

    activeNotificationAlertsRef.current = currentAlerts;
    lastRef.current = reading;

    setReadings((previous) =>
      [...previous, reading].slice(-MAX_HISTORY)
    );

    setAlerts((previous) => reconcileAlerts(previous, reading));
  }, []);

  /** Load saved vehicle readings from AWS. */
  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(HISTORY_API_URL);

      if (!response.ok) {
        throw new Error(`AWS History API returned status ${response.status}`);
      }

      const payload: unknown = await response.json();

      const history: VehicleReading[] = extractHistory(payload)
        .map((item) => normalizeReading(item))
        .filter((item): item is VehicleReading => item !== null)
        .slice(-MAX_HISTORY);

      if (history.length > 0) {
  setReadings(history);

  // Rebuild alert history from all saved AWS readings.
  let restoredAlerts: VehicleAlert[] = [];

  for (const reading of history) {
    restoredAlerts = reconcileAlerts(restoredAlerts, reading);
  }

  const latest = history[history.length - 1];

  lastRef.current = latest;
  setAlerts(restoredAlerts);

  activeNotificationAlertsRef.current = getAlertNames(latest);
} else {
  const initial = generateReading(null);

  lastRef.current = initial;
  setReadings([initial]);
  setAlerts(reconcileAlerts([], initial));

  activeNotificationAlertsRef.current = getAlertNames(initial);
}

      setError(null);
    } catch (err) {
      console.error('Failed to load vehicle history from AWS:', err);
      setError(
        'Could not load vehicle history from AWS. Check the API endpoint and CORS configuration.'
      );
    }
  }, []);

  const start = useCallback(() => {
    if (unsubscribeRef.current) return;

    setError(null);

    unsubscribeRef.current = subscribeToReadings(
      () => lastRef.current,
      ingest,
      setError
    );

    setRunning(true);
  }, [ingest]);

  const stop = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    setRunning(false);
  }, []);

  /** Inject a test abnormal reading. */
  const triggerTest = useCallback(
    (type: AlertType) => {
      ingest(generateReading(lastRef.current, type));
    },
    [ingest]
  );

  const clearAlerts = useCallback(() => setAlerts([]), []);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const response = await fetch(HISTORY_API_URL);

        if (!response.ok) {
          throw new Error(`AWS History API returned status ${response.status}`);
        }

        const payload: unknown = await response.json();

        const history: VehicleReading[] = extractHistory(payload)
          .map((item) => normalizeReading(item))
          .filter((item): item is VehicleReading => item !== null)
          .slice(-MAX_HISTORY);

        if (cancelled) return;

        if (history.length > 0) {
          setReadings(history);

          const latest = history[history.length - 1];
          lastRef.current = latest;

          setAlerts((previous) => reconcileAlerts(previous, latest));

          // Historical abnormalities should not trigger notifications
          // just because the dashboard was opened.
          activeNotificationAlertsRef.current = getAlertNames(latest);
        } else {
          const initial = generateReading(null);

          lastRef.current = initial;
          setReadings([initial]);
          setAlerts((previous) => reconcileAlerts(previous, initial));
          activeNotificationAlertsRef.current = getAlertNames(initial);
        }

        setError(null);
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to initialize telemetry history from AWS:', err);

        setError(
          'Could not load history from AWS. Check the API endpoint and CORS configuration.'
        );

        const initial = generateReading(null);
        lastRef.current = initial;
        setReadings([initial]);
        activeNotificationAlertsRef.current = getAlertNames(initial);
      }

      if (!cancelled) {
        start();
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    };
  }, [start]);

  return {
    readings,
    latest: readings[readings.length - 1] ?? null,
    alerts,
    running,
    error,
    start,
    stop,
    triggerTest,
    clearAlerts,
  };
}