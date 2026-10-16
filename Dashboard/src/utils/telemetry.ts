import type { AlertType, SensorStatus, Severity, Tone, VehicleAlert, VehicleReading } from '../types/vehicle';

export const VEHICLE_ID = 'VEHICLE_001';
export const UPDATE_INTERVAL_MS = 3000;
export const CHART_WINDOW = 20;
/** Simulated starting point near Pune, Maharashtra. NOT a real vehicle position. */
export const PUNE_ORIGIN = { lat: 18.5204, lng: 73.8567 };

interface AlertRule {
  severity: Severity;
  title: string;
  isTriggered: (r: VehicleReading) => boolean;
  message: (r: VehicleReading) => string;
}

/** Alert rules — single source of truth for thresholds used by cards, alerts and table. */
export const ALERT_RULES: Record<AlertType, AlertRule> = {
  speed: {
    severity: 'caution',
    title: 'Overspeed',
    isTriggered: (r) => r.speed_kmh > 80,
    message: (r) => `Speed ${r.speed_kmh.toFixed(1)} km/h exceeds the 80 km/h limit`
  },
  temperature: {
    severity: 'critical',
    title: 'Engine overheating',
    isTriggered: (r) => r.temperature_c > 40,
    message: (r) => `Engine temperature ${r.temperature_c.toFixed(1)} °C exceeds 40 °C`
  },
  battery: {
    severity: 'caution',
    title: 'Low battery voltage',
    isTriggered: (r) => r.battery_voltage < 12,
    message: (r) => `Battery voltage ${r.battery_voltage.toFixed(2)} V is below 12 V`
  },
  vibration: {
    severity: 'critical',
    title: 'High vibration',
    isTriggered: (r) => r.vibration > 4,
    message: (r) => `Vibration level ${r.vibration.toFixed(2)} exceeds 4.0`
  }
};

export const ALERT_TYPES = Object.keys(ALERT_RULES) as AlertType[];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const round = (v: number, d: number) => Number(v.toFixed(d));

/** Probability per sensor per reading of a random abnormal value (so alerts appear naturally). */
const ANOMALY_CHANCE = 0.05;
let heading = Math.random() * Math.PI * 2;

/**
 * Generate the next simulated reading.
 * Values random-walk inside a safe band, with occasional spikes.
 * `forced` deterministically produces an abnormal value for one sensor (test scenarios).
 */
export function generateReading(prev: VehicleReading | null, forced?: AlertType): VehicleReading {
  const base = prev ?? {
    speed_kmh: 42, temperature_c: 29, battery_voltage: 13.3, vibration: 1.2,
    latitude: PUNE_ORIGIN.lat, longitude: PUNE_ORIGIN.lng
  };
  const anomaly = (t: AlertType) => forced === t || !forced && Math.random() < ANOMALY_CHANCE;

  let speed = clamp(base.speed_kmh + rand(-9, 9), 5, 78);
  let temperature = clamp(base.temperature_c + rand(-1.2, 1.4), 22, 38.5);
  let battery = clamp(base.battery_voltage + rand(-0.15, 0.15), 12.2, 14.4);
  let vibration = clamp(base.vibration + rand(-0.5, 0.5), 0.3, 3.4);

  if (anomaly('speed')) speed = rand(84, 118);
  if (anomaly('temperature')) temperature = rand(41, 49.5);
  if (anomaly('battery')) battery = rand(11.05, 11.85);
  if (anomaly('vibration')) vibration = rand(4.2, 6.5);

  // Move the vehicle along a wandering heading; steer back if it drifts ~4 km from origin.
  heading += rand(-0.35, 0.35);
  const dLat = base.latitude - PUNE_ORIGIN.lat;
  const dLng = base.longitude - PUNE_ORIGIN.lng;
  if (Math.hypot(dLat, dLng) > 0.035) heading = Math.atan2(-dLat, -dLng) + rand(-0.3, 0.3);
  const km = speed * UPDATE_INTERVAL_MS / 3_600_000;
  const deg = km / 111;
  const latitude = base.latitude + Math.sin(heading) * deg;
  const longitude = base.longitude + Math.cos(heading) * deg / Math.cos(base.latitude * Math.PI / 180);

  const reading: VehicleReading = {
    vehicle_id: VEHICLE_ID,
    timestamp: new Date().toISOString(),
    speed_kmh: round(speed, 1),
    temperature_c: round(temperature, 1),
    battery_voltage: round(battery, 2),
    vibration: round(vibration, 2),
    latitude: round(latitude, 6),
    longitude: round(longitude, 6),
    alerts: []
  };
  reading.alerts = evaluateAlerts(reading);
  return reading;
}

export function evaluateAlerts(r: VehicleReading): AlertType[] {
  return ALERT_TYPES.filter((t) => ALERT_RULES[t].isTriggered(r));
}

/**
 * Merge a new reading into the alert log:
 * - opens a new "active" alert when a condition starts,
 * - marks it "resolved" when the condition clears.
 */
export function reconcileAlerts(prev: VehicleAlert[], r: VehicleReading): VehicleAlert[] {
  let next = [...prev];
  for (const type of ALERT_TYPES) {
    const active = next.find((a) => a.type === type && a.status === 'active');
    const triggered = r.alerts.includes(type);
    if (triggered && !active) {
      const rule = ALERT_RULES[type];
      next.unshift({
        id: `${type}-${r.timestamp}`,
        type,
        severity: rule.severity,
        title: rule.title,
        message: rule.message(r),
        timestamp: r.timestamp,
        status: 'active',
        resolvedAt: null
      });
    } else if (!triggered && active) {
      next = next.map((a) => a.id === active.id ? { ...a, status: 'resolved', resolvedAt: r.timestamp } : a);
    }
  }
  return next.slice(0, 200);
}

export function sensorStatus(type: AlertType, value: number | undefined): SensorStatus {
  if (value === undefined || Number.isNaN(value)) return 'NORMAL';
  if (type === 'battery') return value < 12 ? 'LOW' : 'NORMAL';
  const limit = type === 'speed' ? 80 : type === 'temperature' ? 40 : 4;
  return value > limit ? 'HIGH' : 'NORMAL';
}

export function statusTone(type: AlertType, status: SensorStatus): Tone {
  if (status === 'NORMAL') return 'ok';
  return ALERT_RULES[type].severity === 'critical' ? 'danger' : 'warn';
}

export const severityTone = (s: Severity): Tone => s === 'critical' ? 'danger' : 'warn';

export const TONE_CLASSES: Record<Tone, {pill: string;text: string;bar: string;soft: string;}> = {
  ok: { pill: 'bg-ok/10 text-ok', text: 'text-ok', bar: 'bg-ok', soft: 'bg-ok/10' },
  warn: { pill: 'bg-warn/10 text-warn', text: 'text-warn', bar: 'bg-warn', soft: 'bg-warn/10' },
  danger: { pill: 'bg-danger/10 text-danger', text: 'text-danger', bar: 'bg-danger', soft: 'bg-danger/10' }
};

export function formatValue(v: number | undefined, decimals: number): string {
  return v === undefined || Number.isNaN(v) ? '—' : v.toFixed(decimals);
}

export function formatTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export const googleMapsUrl = (lat: number, lng: number) => `https://www.google.com/maps?q=${lat},${lng}`;