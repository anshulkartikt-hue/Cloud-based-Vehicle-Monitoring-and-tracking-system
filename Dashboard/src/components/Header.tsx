
import React from 'react';
import { format } from 'date-fns';
import { MenuIcon, PlayIcon, SquareIcon, SunIcon, MoonIcon, CalendarClockIcon } from 'lucide-react';
import { useClock } from '../hooks/useClock';
import { DATA_SOURCE_CONFIG, DATA_SOURCE_LABEL } from '../utils/dataSource';
import { VEHICLE_ID } from '../utils/telemetry';

interface HeaderProps {
  pageLabel: string;
  running: boolean;
  onStart: () => void;
  onStop: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onMenu: () => void;
}

export function Header({ pageLabel, running, onStart, onStop, isDark, onToggleTheme, onMenu }: HeaderProps) {
  const now = useClock();
  const isSim = DATA_SOURCE_CONFIG.mode === 'simulation';

  return (
    <header className="border-b border-line bg-surface/90 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <button onClick={onMenu} className="rounded-lg p-2 text-muted hover:bg-surface2 hover:text-ink lg:hidden" aria-label="Open navigation">
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold tracking-tight text-ink sm:text-xl">Vehicle Monitoring Dashboard</h1>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <CalendarClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{pageLabel}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={now.toISOString()} className="font-mono tabular-nums">{format(now, 'EEE, d MMM yyyy · HH:mm:ss')}</time>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="vehicle-select">Vehicle</label>
          <select
            id="vehicle-select"
            defaultValue={VEHICLE_ID}
            className="h-9 rounded-lg border border-line bg-surface px-3 font-mono text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-accent/40">
            <option value={VEHICLE_ID}>{VEHICLE_ID}</option>
          </select>

          <span
            className={`inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-[11px] font-semibold tracking-wide ${isSim ? 'bg-warn/10 text-warn' : 'bg-ok/10 text-ok'}`}>
            <span className={`h-2 w-2 rounded-full ${isSim ? 'bg-warn' : 'bg-ok'} ${running ? 'animate-pulse-dot' : ''}`} aria-hidden="true" />
            {DATA_SOURCE_LABEL[DATA_SOURCE_CONFIG.mode]}
          </span>

          <div className="flex overflow-hidden rounded-lg border border-line">
            <button
              onClick={onStart}
              disabled={running}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap bg-accent px-3 text-xs font-semibold text-accent-ink transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-surface2 disabled:text-muted">
              <PlayIcon className="h-3.5 w-3.5" aria-hidden="true" /> Start Simulation
            </button>
            <button
              onClick={onStop}
              disabled={!running}
              className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap border-l border-line bg-surface px-3 text-xs font-semibold text-danger transition-[background-color,transform] duration-150 hover:bg-danger/10 active:scale-[0.97] disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-surface">
              <SquareIcon className="h-3.5 w-3.5" aria-hidden="true" /> Stop Simulation
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink transition-[background-color,transform] duration-150 hover:bg-surface2 active:scale-95"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
            {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
