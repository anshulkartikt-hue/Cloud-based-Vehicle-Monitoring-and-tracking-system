
/**
 * ===================== DATA SOURCE INTEGRATION POINT =====================
 * The dashboard receives readings through `subscribeToReadings`.
 *
 * mode 'simulation' — readings generated in the browser.
 * mode 'websocket'  — readings received from a WebSocket backend.
 * mode 'polling'    — readings fetched from the AWS REST API.
 *
 * AWS endpoint:
 * https://yt32cw7u3a.execute-api.eu-north-1.amazonaws.com/prod/telemetry
 * ==========================================================================
 */

import type { VehicleReading } from '../types/vehicle';
import {
  UPDATE_INTERVAL_MS,
  VEHICLE_ID,
  evaluateAlerts,
  generateReading
} from './telemetry';

export type DataSourceMode = 'simulation' | 'websocket' | 'polling';

export const DATA_SOURCE_CONFIG: {
  mode: DataSourceMode;
  websocketUrl: string;
  apiUrl: string;
} = {
  mode: 'polling',
  websocketUrl: '',
  apiUrl:
    'https://yt32cw7u3a.execute-api.eu-north-1.amazonaws.com/prod/telemetry'
};

export const DATA_SOURCE_LABEL: Record<DataSourceMode, string> = {
  simulation: 'SIMULATION MODE',
  websocket: 'LIVE · WEBSOCKET',
  polling: 'LIVE · AWS API'
};

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

/**
 * Validate an incoming vehicle reading.
 * Returns null if required sensor fields are missing or invalid.
 */
export function normalizeReading(raw: unknown): VehicleReading | null {
  if (!raw || typeof raw !== 'object') return null;

  const o = raw as Record<string, unknown>;

  const fields = [
    'speed_kmh',
    'temperature_c',
    'battery_voltage',
    'vibration',
    'latitude',
    'longitude'
  ] as const;

  const values = fields.map((field) => num(o[field]));

  if (values.some((value) => value === null)) return null;

  const [
    speed_kmh,
    temperature_c,
    battery_voltage,
    vibration,
    latitude,
    longitude
  ] = values as number[];

  const reading: VehicleReading = {
    vehicle_id:
      typeof o.vehicle_id === 'string' ? o.vehicle_id : VEHICLE_ID,
    timestamp:
      typeof o.timestamp === 'string'
        ? o.timestamp
        : new Date().toISOString(),
    speed_kmh,
    temperature_c,
    battery_voltage,
    vibration,
    latitude,
    longitude,
    alerts: []
  };

  // Use the dashboard's existing alert rules.
  reading.alerts = evaluateAlerts(reading);

  return reading;
}

/**
 * Subscribe to readings from the configured source.
 * Returns a function that stops polling or closes the WebSocket.
 */
export function subscribeToReadings(
  getLast: () => VehicleReading | null,
  onReading: (reading: VehicleReading) => void,
  onError: (message: string) => void
): () => void {
  const { mode, websocketUrl, apiUrl } = DATA_SOURCE_CONFIG;

  // WebSocket mode
  if (mode === 'websocket' && websocketUrl) {
    const ws = new WebSocket(websocketUrl);

    ws.onmessage = (event) => {
      try {
        const reading = normalizeReading(JSON.parse(String(event.data)));

        if (reading) {
          onReading(reading);
        } else {
          onError('Skipped an incomplete reading from the backend.');
        }
      } catch {
        onError('Received a malformed message from the backend.');
      }
    };

    ws.onerror = () => {
      onError('WebSocket connection failed.');
    };

    return () => ws.close();
  }

  // AWS REST API polling mode
  if (mode === 'polling' && apiUrl) {
    let stopped = false;
    let requestInProgress = false;

    const fetchLatestReading = async () => {
      if (stopped || requestInProgress) return;

      requestInProgress = true;

      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const payload: unknown = await response.json();

        let reading: VehicleReading | null = null;

        if (
          payload &&
          typeof payload === 'object' &&
          'readings' in payload
        ) {
          const data = payload as { readings?: unknown };
          const readings = data.readings;

          if (Array.isArray(readings) && readings.length > 0) {
            reading = normalizeReading(readings[0]);
          }
        } else {
          // Support APIs that return a single reading.
          reading = normalizeReading(payload);
        }

        if (reading) {
          onReading(reading);
        } else {
          onError('The AWS API returned no valid vehicle reading.');
        }
      } catch (error) {
        console.error('AWS vehicle telemetry fetch failed:', error);
        onError(
          'Could not fetch vehicle data from AWS. Check the API Gateway endpoint, CORS configuration, and Lambda logs.'
        );
      } finally {
        requestInProgress = false;
      }
    };

    // Fetch immediately, then poll at the configured interval.
    void fetchLatestReading();

    const id = window.setInterval(() => {
      void fetchLatestReading();
    }, UPDATE_INTERVAL_MS);

    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }

  // Default: in-browser simulation mode
  const id = window.setInterval(() => {
    onReading(generateReading(getLast()));
  }, UPDATE_INTERVAL_MS);

  return () => window.clearInterval(id);
}
