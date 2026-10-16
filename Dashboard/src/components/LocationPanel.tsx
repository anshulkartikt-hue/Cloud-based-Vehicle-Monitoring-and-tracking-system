import React from 'react';
import { ExternalLinkIcon, InfoIcon } from 'lucide-react';
import type { VehicleReading } from '../types/vehicle';
import { formatTime, googleMapsUrl } from '../utils/telemetry';
import { LocationMap } from './LocationMap';
import { Panel } from './Panel';

interface LocationPanelProps {
  readings: VehicleReading[];
  isDark: boolean;
  mapHeight?: number;
  className?: string;
}

export function LocationPanel({ readings, isDark, mapHeight = 220, className = '' }: LocationPanelProps) {
  const latest = readings[readings.length - 1];

  return (
    <Panel title="Vehicle Location" description={`Last update ${formatTime(latest?.timestamp)}`} className={`flex flex-col ${className}`}>
      <LocationMap readings={readings} isDark={isDark} height={mapHeight} />

      <dl className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-xs text-muted">Latitude</dt>
          <dd className="font-mono text-lg font-semibold tabular-nums text-ink">{latest ? latest.latitude.toFixed(6) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Longitude</dt>
          <dd className="font-mono text-lg font-semibold tabular-nums text-ink">{latest ? latest.longitude.toFixed(6) : '—'}</dd>
        </div>
      </dl>

      <p className="mt-3 flex items-start gap-2 rounded-lg bg-warn/10 px-3 py-2 text-xs text-warn">
        <InfoIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Simulated coordinates near Pune, Maharashtra
      </p>

      {latest ?
      <a
        href={googleMapsUrl(latest.latitude, latest.longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-line px-3 py-2 text-sm font-medium text-accent transition-colors duration-150 hover:bg-accent/10">
        
          Open in Google Maps <ExternalLinkIcon className="h-4 w-4" aria-hidden="true" />
        </a> :
      null}
    </Panel>);

}