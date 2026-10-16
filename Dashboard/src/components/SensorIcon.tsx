import React from 'react';
import { GaugeIcon, ThermometerIcon, BatteryChargingIcon, ActivityIcon } from 'lucide-react';
import type { SensorKey } from '../types/vehicle';

const ICONS = {
  speed_kmh: GaugeIcon,
  temperature_c: ThermometerIcon,
  battery_voltage: BatteryChargingIcon,
  vibration: ActivityIcon
};

export function SensorIcon({ sensorKey, className }: {sensorKey: SensorKey;className?: string;}) {
  const Icon = ICONS[sensorKey];
  return <Icon className={className} aria-hidden="true" />;
}