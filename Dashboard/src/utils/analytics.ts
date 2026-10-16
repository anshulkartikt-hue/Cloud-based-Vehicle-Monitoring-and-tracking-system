import type { SensorKey, VehicleAlert, VehicleReading } from '../types/vehicle';

const avg = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined;

export function computeAnalytics(readings: VehicleReading[], alerts: VehicleAlert[]) {
  const speeds = readings.map((r) => r.speed_kmh);
  const temps = readings.map((r) => r.temperature_c);
  return {
    avgSpeed: avg(speeds),
    maxSpeed: speeds.length ? Math.max(...speeds) : undefined,
    avgTemp: avg(temps),
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a) => a.status === 'active').length,
    readingCount: readings.length,
    abnormalReadings: readings.filter((r) => r.alerts.length > 0).length
  };
}

export function sensorStats(readings: VehicleReading[], key: SensorKey) {
  const xs = readings.map((r) => r[key]);
  return {
    min: xs.length ? Math.min(...xs) : undefined,
    max: xs.length ? Math.max(...xs) : undefined,
    avg: avg(xs)
  };
}