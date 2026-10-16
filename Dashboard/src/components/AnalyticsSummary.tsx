import React from 'react';
import type { VehicleAlert, VehicleReading } from '../types/vehicle';
import { computeAnalytics } from '../utils/analytics';
import { formatValue } from '../utils/telemetry';

export function AnalyticsSummary({ readings, alerts }: {readings: VehicleReading[];alerts: VehicleAlert[];}) {
  const a = computeAnalytics(readings, alerts);
  const secondary = [
  { label: 'Maximum speed', value: formatValue(a.maxSpeed, 1), unit: 'km/h' },
  { label: 'Average temperature', value: formatValue(a.avgTemp, 1), unit: '°C' },
  { label: 'Total alerts', value: String(a.totalAlerts), unit: `${a.activeAlerts} active` },
  { label: 'Simulated readings', value: String(a.readingCount), unit: `${a.abnormalReadings} abnormal` }];


  return (
    <section className="grid overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:grid-cols-[1.3fr_2fr]" aria-label="Session analytics">
      <div className="border-b border-line bg-accent/5 p-6 lg:border-b-0 lg:border-r">
        <p className="text-sm font-medium text-muted">Average speed</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-5xl font-semibold tracking-tight text-ink tabular-nums">{formatValue(a.avgSpeed, 1)}</span>
          <span className="text-base text-muted">km/h</span>
        </p>
        <p className="mt-3 text-xs text-muted">Calculated live from all {a.readingCount} simulated readings this session.</p>
      </div>
      <dl className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
        {secondary.map((s) =>
        <div key={s.label} className="p-5">
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="mt-2 font-mono text-2xl font-semibold tabular-nums text-ink">{s.value}</dd>
            <dd className="text-xs text-muted">{s.unit}</dd>
          </div>
        )}
      </dl>
    </section>);

}