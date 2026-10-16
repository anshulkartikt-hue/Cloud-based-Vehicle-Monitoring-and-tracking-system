import React from 'react';
import type { TelemetryState } from '../hooks/useVehicleTelemetry';
import { LocationPanel } from '../components/LocationPanel';
import { Panel } from '../components/Panel';
import { formatTime } from '../utils/telemetry';

export function TrackingPage({ telemetry, isDark }: {telemetry: TelemetryState;isDark: boolean;}) {
  const recent = telemetry.readings.slice(-10).reverse();

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <LocationPanel readings={telemetry.readings} isDark={isDark} mapHeight={460} />
      <Panel title="Recent Positions" description="Latest 10 simulated GPS fixes">
        {recent.length === 0 ?
        <p className="py-6 text-center text-sm text-muted">No positions yet.</p> :

        <ol className="divide-y divide-line">
            {recent.map((r) =>
          <li key={r.timestamp} className="flex items-center justify-between gap-3 py-2.5 font-mono text-xs tabular-nums">
                <span className="text-muted">{formatTime(r.timestamp)}</span>
                <span className="text-ink">{r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}</span>
                <span className="text-muted">{r.speed_kmh.toFixed(0)} km/h</span>
              </li>
          )}
          </ol>
        }
      </Panel>
    </div>);

}