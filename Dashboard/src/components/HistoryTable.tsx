import React from 'react';
import { DownloadIcon } from 'lucide-react';
import type { VehicleReading } from '../types/vehicle';
import { downloadReadingsCsv } from '../utils/csv';
import { ALERT_RULES, formatTime, severityTone, TONE_CLASSES } from '../utils/telemetry';
import { Panel } from './Panel';

interface HistoryTableProps {
  readings: VehicleReading[];
  limit: number;
  className?: string;
}

const COLS = ['Timestamp', 'Vehicle ID', 'Speed (km/h)', 'Temp (°C)', 'Battery (V)', 'Vibration', 'Latitude', 'Longitude', 'Alert status'];

export function HistoryTable({ readings, limit, className = '' }: HistoryTableProps) {
  const rows = readings.slice(-limit).reverse();

  return (
    <Panel
      className={className}
      title="Vehicle Data History"
      description={`Latest ${rows.length} of ${readings.length} recorded readings`}
      action={
      <button
        onClick={() => downloadReadingsCsv(readings)}
        disabled={readings.length === 0}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-50">
        
          <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" /> Export CSV
        </button>
      }>
      
      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-xs">
          <thead>
            <tr className="border-y border-line bg-surface2 text-muted">
              {COLS.map((c) =>
              <th key={c} scope="col" className="whitespace-nowrap px-5 py-2.5 font-medium">{c}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-mono tabular-nums text-ink">
            {rows.length === 0 ?
            <tr><td colSpan={COLS.length} className="px-5 py-8 text-center font-sans text-muted">No readings yet — start the simulation.</td></tr> :

            rows.map((r) =>
            <tr key={r.timestamp} className="transition-colors duration-150 hover:bg-surface2">
                  <td className="whitespace-nowrap px-5 py-2.5">{formatTime(r.timestamp)}</td>
                  <td className="whitespace-nowrap px-5 py-2.5">{r.vehicle_id}</td>
                  <td className="px-5 py-2.5">{r.speed_kmh.toFixed(1)}</td>
                  <td className="px-5 py-2.5">{r.temperature_c.toFixed(1)}</td>
                  <td className="px-5 py-2.5">{r.battery_voltage.toFixed(2)}</td>
                  <td className="px-5 py-2.5">{r.vibration.toFixed(2)}</td>
                  <td className="px-5 py-2.5">{r.latitude.toFixed(5)}</td>
                  <td className="px-5 py-2.5">{r.longitude.toFixed(5)}</td>
                  <td className="px-5 py-2.5 font-sans">
                    {r.alerts.length === 0 ?
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${TONE_CLASSES.ok.pill}`}>NORMAL</span> :

                <span className="flex flex-wrap gap-1">
                        {r.alerts.map((a) =>
                  <span key={a} className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold ${TONE_CLASSES[severityTone(ALERT_RULES[a].severity)].pill}`}>
                            {ALERT_RULES[a].title}
                          </span>
                  )}
                      </span>
                }
                  </td>
                </tr>
            )
            }
          </tbody>
        </table>
      </div>
    </Panel>);

}