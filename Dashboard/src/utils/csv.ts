import type { VehicleReading } from '../types/vehicle';

const HEADERS = ['timestamp', 'vehicle_id', 'speed_kmh', 'temperature_c', 'battery_voltage', 'vibration', 'latitude', 'longitude', 'alert_status'];

/** Convert readings to CSV using the same columns as simulator.py's vehicle_data.csv. */
export function readingsToCsv(readings: VehicleReading[]): string {
  const rows = readings.map((r) =>
  [
  r.timestamp, r.vehicle_id, r.speed_kmh, r.temperature_c, r.battery_voltage,
  r.vibration, r.latitude, r.longitude, r.alerts.length ? r.alerts.join(';') : 'NORMAL'].
  join(',')
  );
  return [HEADERS.join(','), ...rows].join('\n');
}

export function downloadReadingsCsv(readings: VehicleReading[]): void {
  const blob = new Blob([readingsToCsv(readings)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vehicle_data_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}