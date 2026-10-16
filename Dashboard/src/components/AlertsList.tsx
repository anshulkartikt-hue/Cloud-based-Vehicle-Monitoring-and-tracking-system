import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagonIcon, AlertTriangleIcon, CheckCircle2Icon, Trash2Icon } from 'lucide-react';
import type { VehicleAlert } from '../types/vehicle';
import { formatTime, severityTone, TONE_CLASSES } from '../utils/telemetry';
import { Panel } from './Panel';

interface AlertsListProps {
  alerts: VehicleAlert[];
  onClear: () => void;
  limit?: number;
  className?: string;
}

export function AlertsList({ alerts, onClear, limit, className = '' }: AlertsListProps) {
  const active = alerts.filter((a) => a.status === 'active').length;
  const shown = limit ? alerts.slice(0, limit) : alerts;

  return (
    <Panel
      className={className}
      title="Alerts & Notifications"
      description={`${active} active · ${alerts.length} total`}
      action={
      <button
        onClick={onClear}
        disabled={alerts.length === 0}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">
        
          <Trash2Icon className="h-3.5 w-3.5" aria-hidden="true" /> Clear history
        </button>
      }>
      
      {active === 0 &&
      <div className="mb-3 flex items-center gap-2 rounded-lg bg-ok/10 px-3 py-2 text-sm font-medium text-ok">
          <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" /> All systems normal
        </div>
      }

      {shown.length === 0 ?
      <p className="py-6 text-center text-sm text-muted">No alerts recorded yet. Use the test scenarios to demonstrate each alert.</p> :

      <ul className="divide-y divide-line" aria-live="polite">
          <AnimatePresence initial={false}>
            {shown.map((a) => {
            const tone = a.status === 'resolved' ? TONE_CLASSES.ok : TONE_CLASSES[severityTone(a.severity)];
            const Icon = a.severity === 'critical' ? AlertOctagonIcon : AlertTriangleIcon;
            return (
              <motion.li
                key={a.id}
                layout="position"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="flex items-start gap-3 py-3">
                
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.soft} ${tone.text}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm font-semibold text-ink">{a.title}</p>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TONE_CLASSES[severityTone(a.severity)].pill}`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{a.message}</p>
                    <p className="mt-1 font-mono text-[11px] text-muted">
                      {formatTime(a.timestamp)}
                      {a.resolvedAt && ` → resolved ${formatTime(a.resolvedAt)}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${tone.pill}`}>
                    {a.status === 'active' ? 'Active' : 'Resolved'}
                  </span>
                </motion.li>);

          })}
          </AnimatePresence>
        </ul>
      }
    </Panel>);

}