import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { VehicleReading } from '../types/vehicle';
import { CHART_WINDOW, formatTime } from '../utils/telemetry';

interface TelemetryChartProps {
  readings: VehicleReading[];
  isDark: boolean;
  height?: number;
}

export function TelemetryChart({ readings, isDark, height = 300 }: TelemetryChartProps) {
  // Rolling window of the most recent readings
  const data = readings.slice(-CHART_WINDOW).map((r) => ({ time: formatTime(r.timestamp), speed: r.speed_kmh, temp: r.temperature_c }));
  const c = isDark ?
  { grid: '#222f52', axis: '#94a3b8', speed: '#6e9bff', temp: '#fbbf24', tipBg: '#10182e', tipBorder: '#222f52', tipText: '#e2e8f0' } :
  { grid: '#e2e8f0', axis: '#5c6b82', speed: '#2563eb', temp: '#d97706', tipBg: '#ffffff', tipBorder: '#e2e8f0', tipText: '#0f172a' };

  if (data.length === 0) {
    return <div className="flex items-center justify-center text-sm text-muted" style={{ height }}>Waiting for readings…</div>;
  }

  return (
    <div style={{ height }} role="img" aria-label="Line chart of speed in km/h and engine temperature in °C over the latest 20 readings">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={{ stroke: c.grid }} minTickGap={24}
          label={{ value: 'Time', position: 'insideBottomRight', offset: -2, fill: c.axis, fontSize: 11 }} />
          <YAxis yAxisId="speed" domain={[0, 120]} tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false}
          label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft', offset: 18, fill: c.axis, fontSize: 11 }} />
          <YAxis yAxisId="temp" orientation="right" domain={[20, 50]} tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false}
          label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', offset: 10, fill: c.axis, fontSize: 11 }} />
          <Tooltip contentStyle={{ background: c.tipBg, border: `1px solid ${c.tipBorder}`, borderRadius: 10, color: c.tipText, fontSize: 12 }} labelStyle={{ color: c.tipText }} />
          <Legend wrapperStyle={{ fontSize: 12, color: c.axis, paddingTop: 8 }} />
          <Line yAxisId="speed" type="monotone" dataKey="speed" name="Speed (km/h)" stroke={c.speed} strokeWidth={2.25} dot={false} animationDuration={250} />
          <Line yAxisId="temp" type="monotone" dataKey="temp" name="Temperature (°C)" stroke={c.temp} strokeWidth={2.25} dot={false} animationDuration={250} />
        </LineChart>
      </ResponsiveContainer>
    </div>);

}