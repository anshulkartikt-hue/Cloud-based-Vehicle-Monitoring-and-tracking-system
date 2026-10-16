export type AlertType = 'speed' | 'temperature' | 'battery' | 'vibration';
export type Severity = 'critical' | 'caution';
export type PageId = 'dashboard' | 'monitoring' | 'tracking' | 'analytics' | 'alerts' | 'settings';
export type SensorKey = 'speed_kmh' | 'temperature_c' | 'battery_voltage' | 'vibration';
export type SensorStatus = 'NORMAL' | 'HIGH' | 'LOW';
export type Tone = 'ok' | 'warn' | 'danger';

/** One telemetry reading — identical shape to the rows produced by simulator.py */
export interface VehicleReading {
  vehicle_id: string;
  timestamp: string; // ISO-8601
  speed_kmh: number;
  temperature_c: number;
  battery_voltage: number;
  vibration: number;
  latitude: number;
  longitude: number;
  alerts: AlertType[];
}

export interface VehicleAlert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  message: string;
  timestamp: string;
  status: 'active' | 'resolved';
  resolvedAt: string | null;
}

export interface SensorDef {
  key: SensorKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  decimals: number;
  alertType: AlertType;
  limitLabel: string;
  threshold: number;
}