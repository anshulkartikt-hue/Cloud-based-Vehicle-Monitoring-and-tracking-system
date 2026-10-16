import React from 'react';
import type { TelemetryState } from '../hooks/useVehicleTelemetry';
import { AnalyticsSummary } from '../components/AnalyticsSummary';
import { HistoryTable } from '../components/HistoryTable';
import { Panel } from '../components/Panel';
import { TelemetryChart } from '../components/TelemetryChart';

export function AnalyticsPage({ telemetry, isDark }: {telemetry: TelemetryState;isDark: boolean;}) {
  return (
    <div className="space-y-6">
      <AnalyticsSummary readings={telemetry.readings} alerts={telemetry.alerts} />
      <Panel title="Speed & Temperature Trend" description="Latest 20 readings">
        <TelemetryChart readings={telemetry.readings} isDark={isDark} height={300} />
      </Panel>
      <HistoryTable readings={telemetry.readings} limit={50} />
    </div>);

}