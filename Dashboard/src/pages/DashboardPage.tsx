import React from 'react';
import { sensors } from '../data/sensors';
import type { TelemetryState } from '../hooks/useVehicleTelemetry';
import type { PageId } from '../types/vehicle';
import { AlertsList } from '../components/AlertsList';
import { HistoryTable } from '../components/HistoryTable';
import { LocationPanel } from '../components/LocationPanel';
import { MetricCard } from '../components/MetricCard';
import { Panel } from '../components/Panel';
import { TelemetryChart } from '../components/TelemetryChart';
import { TestScenarios } from '../components/TestScenarios';

interface PageProps {
  telemetry: TelemetryState;
  isDark: boolean;
  onNavigate: (p: PageId) => void;
}

export function DashboardPage({ telemetry, isDark, onNavigate }: PageProps) {
  const { readings, latest, alerts, triggerTest, clearAlerts } = telemetry;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {sensors.map((s, i) =>
        <MetricCard key={s.key} sensor={s} value={latest?.[s.key]} index={i} onClick={() => onNavigate('monitoring')} />
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Live Telemetry" description="Speed and engine temperature · rolling window of the latest 20 readings">
          <TelemetryChart readings={readings} isDark={isDark} height={340} />
        </Panel>
        <LocationPanel readings={readings} isDark={isDark} mapHeight={200} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <HistoryTable className="xl:col-span-2" readings={readings} limit={8} />
        <div className="space-y-6">
          <AlertsList alerts={alerts} onClear={clearAlerts} limit={4} />
          <TestScenarios onTrigger={triggerTest} />
        </div>
      </div>
    </div>);

}