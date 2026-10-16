import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from 'lucide-react';
import { sensors } from '../data/sensors';
import type { VehicleReading } from '../types/vehicle';
import { formatValue, sensorStatus, statusTone, TONE_CLASSES } from '../utils/telemetry';
import { SensorIcon } from './SensorIcon';

const SPREAD = 200; // horizontal distance between cards (px)
const DEPTH = 170; // how far side cards recede (px)
const ANGLE = 38; // side card rotation (deg)

/** 3D cover-flow carousel of the four sensors; side cards are angled and pushed back in depth. */
export function SensorCarousel3D({ latest }: {latest: VehicleReading | null;}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(!reduce);
  const [hovered, setHovered] = useState(false);
  const active = (index % sensors.length + sensors.length) % sensors.length;

  useEffect(() => {
    if (!auto || hovered) return;
    const id = window.setInterval(() => setIndex((i) => i + 1), 4000);
    return () => window.clearInterval(id);
  }, [auto, hovered]);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="relative mx-auto flex h-[300px] items-center justify-center overflow-hidden" style={{ perspective: 1100 }}>
        <div className="relative h-[230px] w-[250px]" style={{ transformStyle: 'preserve-3d' }}>
          {sensors.map((s, i) => {
            const value = latest?.[s.key];
            const status = sensorStatus(s.alertType, value);
            const tone = TONE_CLASSES[statusTone(s.alertType, status)];
            const isActive = i === active;
            // Cover-flow offset in [-2, 1]: 0 = front, ±1 = angled neighbours, -2 = hidden behind
            const n = sensors.length;
            const offset = (i - active + n + n / 2) % n - n / 2;
            const visible = Math.abs(offset) < 2;
            return (
              <motion.div
                key={s.key}
                aria-hidden={!isActive}
                onClick={() => !isActive && visible && setIndex(index + offset)}
                className={`absolute inset-0 flex flex-col rounded-2xl border bg-surface p-6 shadow-lift ${isActive ? 'border-accent/50' : 'cursor-pointer border-line'}`}
                initial={false}
                animate={{
                  x: offset * SPREAD,
                  z: -Math.abs(offset) * DEPTH,
                  rotateY: -offset * ANGLE,
                  opacity: visible ? isActive ? 1 : 0.55 : 0
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                style={{ zIndex: 10 - Math.abs(offset), pointerEvents: visible ? 'auto' : 'none' }}>
                
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone.soft} ${tone.text} animate-float`}>
                  <SensorIcon sensorKey={s.key} className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-medium text-muted">{s.label}</p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-mono text-4xl font-semibold tabular-nums text-ink">{formatValue(value, s.decimals)}</span>
                  <span className="text-sm text-muted">{s.unit}</span>
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-muted">{s.limitLabel}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${tone.pill}`}>{status}</span>
                </div>
              </motion.div>);

          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <button onClick={() => setIndex((i) => i - 1)} className="rounded-full border border-line p-2 text-ink transition-[background-color,transform] duration-150 hover:bg-surface2 active:scale-95" aria-label="Previous sensor">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Sensors">
          {sensors.map((s, i) =>
          <button
            key={s.key}
            role="tab"
            aria-selected={i === active}
            aria-label={s.label}
            onClick={() => setIndex(index + (i - active))}
            className={`h-2 rounded-full transition-[width,background-color] duration-200 ${i === active ? 'w-6 bg-accent' : 'w-2 bg-line hover:bg-muted'}`} />

          )}
        </div>
        <button onClick={() => setIndex((i) => i + 1)} className="rounded-full border border-line p-2 text-ink transition-[background-color,transform] duration-150 hover:bg-surface2 active:scale-95" aria-label="Next sensor">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <button onClick={() => setAuto((v) => !v)} className="ml-2 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition-colors duration-150 hover:bg-surface2 hover:text-ink">
          {auto ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
          {auto ? 'Pause rotation' : 'Auto-rotate'}
        </button>
      </div>
    </div>);

}