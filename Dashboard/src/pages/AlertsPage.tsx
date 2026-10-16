import React from 'react';
import type { TelemetryState } from '../hooks/useVehicleTelemetry';
import { AlertsList } from '../components/AlertsList';
import { Panel } from '../components/Panel';
import { TestScenarios } from '../components/TestScenarios';
import { ALERT_RULES, ALERT_TYPES, severityTone, TONE_CLASSES } from '../utils/telemetry';

const CONDITION: Record<string, string> = {
  speed: 'speed_kmh > 80',
  temperature: 'temperature_c > 40',
  battery: 'battery_voltage < 12',
  vibration: 'vibration > 4.0'
};

export function AlertsPage({ telemetry }: {telemetry: TelemetryState;}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <AlertsList alerts={telemetry.alerts} onClear={telemetry.clearAlerts} />
      <div className="space-y-6">
        <TestScenarios onTrigger={telemetry.triggerTest} />
        <Panel title="Alert Rules" description="Evaluated on every reading">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted">
                <th scope="col" className="pb-2 font-medium">Alert</th>
                <th scope="col" className="pb-2 font-medium">Condition</th>
                <th scope="col" className="pb-2 text-right font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ALERT_TYPES.map((t) =>
              <tr key={t}>
                  <td className="py-2.5 font-medium text-ink">{ALERT_RULES[t].title}</td>
                  <td className="py-2.5 font-mono text-muted">{CONDITION[t]}</td>
                  <td className="py-2.5 text-right">
                    <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize ${TONE_CLASSES[severityTone(ALERT_RULES[t].severity)].pill}`}>
                      {ALERT_RULES[t].severity}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>);

}