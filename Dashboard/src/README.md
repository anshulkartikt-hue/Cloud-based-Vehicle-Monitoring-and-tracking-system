# Cloud-Based Vehicle Monitoring and Tracking System

College Cloud Computing project. **All sensor data is simulated in software** — no ESP32, Arduino, GPS module, or AWS account is required for the demo. The dashboard shows **SIMULATION MODE** until a real backend is configured.

## Project structure

| Path | Purpose |
|---|---|
| `simulator.py` | Python generator — one reading every 3 s, appended to `vehicle_data.csv` |
| `vehicle_data.csv` | Sample/recorded readings (same columns as the dashboard's CSV export) |
| `App.tsx`, `pages/`, `components/` | Dashboard UI (React + Tailwind CSS) |
| `utils/telemetry.ts` | JavaScript simulator + alert rules (thresholds) |
| `utils/dataSource.ts` | **Integration point** — switch from simulation to WebSocket / REST |
| `hooks/useVehicleTelemetry.ts` | Start/stop logic (guards against duplicate timers), alert log |

> Note: the dashboard is built with React (instead of plain `index.html` / `style.css` / `script.js`) and uses Recharts for charts and Leaflet + OpenStreetMap for the map. No API keys are needed.

## Run locally on Windows

**Dashboard**
1. Install Node.js 18+ from nodejs.org.
2. Export/download the project and open the folder in VS Code.
3. In the VS Code terminal: `npm install`, then `npm run dev`.
4. Open the local URL printed in the terminal (e.g. `http://localhost:5173`).
   No extension (Live Server) is required.

**Python simulator** (independent of the dashboard)
```
python simulator.py --count 20
```
Appends readings to `vehicle_data.csv` and prints JSON for each reading.

## Demo checklist
- Metric cards update every 3 s; **Stop Simulation** freezes them and **Start Simulation** resumes them.
- **Trigger Test Alert** buttons demonstrate overspeed (>80 km/h), overheating (>40 °C), low battery (<12 V), and high vibration (>4.0).
- **Export CSV** (Dashboard / Analytics) downloads all recorded readings.
- **Open in Google Maps** opens the current simulated coordinates.
- Theme toggle (sun/moon) switches between light and dark.

## Reading format
```json
{ "vehicle_id": "VEHICLE_001", "timestamp": "2026-10-10T09:00:00Z", "speed_kmh": 65.5,
  "temperature_c": 32.4, "battery_voltage": 13.2, "vibration": 1.7,
  "latitude": 18.5204, "longitude": 73.8567, "alerts": [] }
```

## Future cloud architecture (not implemented)
```
simulator.py ──MQTT──▶ AWS IoT Core ──IoT Rule──▶ AWS Lambda ──▶ Amazon DynamoDB
                                                                    │
                       Dashboard ◀── WebSocket / REST ◀── API Gateway + Lambda
```
1. **Python → IoT Core:** replace `publish()` in `simulator.py` with an MQTT publish (topic `vehicles/VEHICLE_001/telemetry`) using device certificates.
2. **IoT Rule → Lambda:** validate the payload, evaluate alert thresholds.
3. **Lambda → DynamoDB:** table `VehicleTelemetry` (partition key `vehicle_id`, sort key `timestamp`).
4. **Dashboard API:** API Gateway REST endpoint (latest reading) or WebSocket (push).
5. **Dashboard:** in `utils/dataSource.ts` set `mode: 'websocket'` + `websocketUrl`, or `mode: 'polling'` + `apiUrl`. Incoming data is validated by `normalizeReading()`; incomplete readings are skipped.

Coordinates are simulated near Pune, Maharashtra, and do not represent a real vehicle.
