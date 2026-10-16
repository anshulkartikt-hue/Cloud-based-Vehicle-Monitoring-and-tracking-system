import React from 'react';
import { FlaskConicalIcon } from 'lucide-react';
import type { AlertType } from '../types/vehicle';
import { ALERT_RULES, ALERT_TYPES, severityTone, TONE_CLASSES } from '../utils/telemetry';
import { Panel } from './Panel';

const SCENARIO_HINT: Record<AlertType, string> = {
  speed: 'Speed > 80 km/h',
  temperature: 'Temp > 40 °C',
  battery: 'Battery < 12 V',
  vibration: 'Vibration > 4.0'
};

export function TestScenarios({ onTrigger, className = '' }: {onTrigger: (t: AlertType) => void;className?: string;}) {
  return (
    <Panel className={className} title="Trigger Test Alert" description="Injects one abnormal simulated reading immediately. It resolves on the next normal reading.">
      <div className="grid grid-cols-2 gap-2">
        {ALERT_TYPES.map((t) => {
          const tone = TONE_CLASSES[severityTone(ALERT_RULES[t].severity)];
          return (
            <button
              key={t}
              onClick={() => onTrigger(t)}
              className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface2 px-3 py-2.5 text-left transition-[transform,border-color,background-color] duration-150 hover:-translate-y-0.5 hover:border-accent/40 active:scale-[0.98]">
              
              <FlaskConicalIcon className={`h-4 w-4 shrink-0 ${tone.text}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-ink">{ALERT_RULES[t].title}</span>
                <span className="block truncate text-[11px] text-muted">{SCENARIO_HINT[t]}</span>
              </span>
            </button>);

        })}
      </div>
    </Panel>);

}