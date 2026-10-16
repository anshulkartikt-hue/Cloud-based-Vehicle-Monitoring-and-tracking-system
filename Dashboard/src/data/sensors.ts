import type { SensorDef } from '../types/vehicle';

export const sensors: SensorDef[] = [
{ key: 'speed_kmh', label: 'Vehicle Speed', unit: 'km/h', min: 0, max: 120, decimals: 1, alertType: 'speed', limitLabel: 'Limit 80 km/h', threshold: 80 },
{ key: 'temperature_c', label: 'Engine Temperature', unit: '°C', min: 20, max: 50, decimals: 1, alertType: 'temperature', limitLabel: 'Limit 40 °C', threshold: 40 },
{ key: 'battery_voltage', label: 'Battery Voltage', unit: 'V', min: 11, max: 14.5, decimals: 2, alertType: 'battery', limitLabel: 'Minimum 12 V', threshold: 12 },
{ key: 'vibration', label: 'Vibration Level', unit: 'g', min: 0, max: 7, decimals: 2, alertType: 'vibration', limitLabel: 'Limit 4.0', threshold: 4 }];