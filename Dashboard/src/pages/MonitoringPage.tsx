import React from 'react';
import { sensors } from '../data/sensors';
import type { TelemetryState } from '../hooks/useVehicleTelemetry';
import { Panel } from '../components/Panel';
import { SensorCarousel3D } from '../components/SensorCarousel3D';
import { SensorIcon } from '../components/SensorIcon';
import { TestScenarios } from '../components/TestScenarios';
import { sensorStats } from '../utils/analytics';
import { formatValue, sensorStatus, statusTone, TONE_CLASSES } from '../utils/telemetry';

export function MonitoringPage({ telemetry }: {telemetry: TelemetryState;}) {
  const { readings, latest, triggerTest } = telemetry;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Panel title="Sensor Readings" description="Live simulated sensor readings">
        <SensorCarousel3D latest={latest} />
      </Panel>

      <div className="space-y-6">
        <Panel title="Session Statistics" description={`Across ${readings.length} simulated readings`}>
          <ul className="divide-y divide-line">
            {sensors.map((s) => {
              const st = sensorStats(readings, s.key);
              const status = sensorStatus(s.alertType, latest?.[s.key]);
              const tone = TONE_CLASSES[statusTone(s.alertType, status)];
              return (
                <li key={s.key} className="flex items-center gap-3 py-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.soft} ${tone.text}`}>
                    <SensorIcon sensorKey={s.key} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{s.label}</p>
                    <p className="font-mono text-[11px] text-muted">
                      min {formatValue(st.min, s.decimals)} · avg {formatValue(st.avg, s.decimals)} · max {formatValue(st.max, s.decimals)}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-semibold tabular-nums text-ink">
                    {formatValue(latest?.[s.key], s.decimals)} <span className="font-sans text-xs font-normal text-muted">{s.unit}</span>
                  </span>
                </li>);

            })}
          </ul>
        </Panel>
        <TestScenarios onTrigger={triggerTest} />
      </div>
    </div>);

}