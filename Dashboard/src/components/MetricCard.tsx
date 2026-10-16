import React from 'react';
import type { SensorDef } from '../types/vehicle';
import { formatValue, sensorStatus, statusTone, TONE_CLASSES } from '../utils/telemetry';
import { SensorIcon } from './SensorIcon';

interface MetricCardProps {
  sensor: SensorDef;
  value: number | undefined;
  index: number;
  onClick: () => void;
}

export function MetricCard({ sensor, value, index, onClick }: MetricCardProps) {
  const status = sensorStatus(sensor.alertType, value);
  const tone = TONE_CLASSES[statusTone(sensor.alertType, status)];
  const pct = value === undefined ? 0 : Math.min(100, Math.max(0, (value - sensor.min) / (sensor.max - sensor.min) * 100));
  const limitPct = (sensor.threshold - sensor.min) / (sensor.max - sensor.min) * 100;

  return (
    <button
      onClick={onClick}
      aria-label={`${sensor.label}: ${formatValue(value, sensor.decimals)} ${sensor.unit}, ${status}. Open vehicle monitoring`}
      className="group flex flex-col rounded-2xl border border-line bg-surface p-5 text-left shadow-card transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1 hover:border-accent/40 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
      
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted">{sensor.label}</span>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.soft} ${tone.text} animate-float`}
          style={{ animationDelay: `${index * 0.6}s` }}>
          
          <SensorIcon sensorKey={sensor.key} className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-[32px] font-semibold leading-none tracking-tight text-ink tabular-nums">{formatValue(value, sensor.decimals)}</span>
        <span className="text-sm font-medium text-muted">{sensor.unit}</span>
      </div>

      <div className="relative mt-5 h-1.5 w-full rounded-full bg-surface2">
        <div className={`h-full rounded-full ${tone.bar} transition-[width] duration-300 ease-out`} style={{ width: `${pct}%` }} />
        <div className="absolute -top-1 h-3.5 w-0.5 rounded bg-ink/40" style={{ left: `${limitPct}%` }} aria-hidden="true" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{sensor.limitLabel}</span>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ${tone.pill}`}>{status}</span>
      </div>
    </button>);

}