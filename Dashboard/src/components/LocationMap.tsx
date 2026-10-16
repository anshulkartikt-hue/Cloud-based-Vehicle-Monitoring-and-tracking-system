
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { VehicleReading } from '../types/vehicle';
import { PUNE_ORIGIN } from '../utils/telemetry';

interface LocationMapProps {
  readings: VehicleReading[];
  isDark: boolean;
  height: number;
}

const TILE_URL =
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

export function LocationMap({
  readings,
  isDark,
  height
}: LocationMapProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);

  // Initialize the map once.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;

    const map = L.map(elRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView(
      [PUNE_ORIGIN.lat, PUNE_ORIGIN.lng],
      15
    );

    trailRef.current = L.polyline([], {
      color: '#3b82f6',
      weight: 3,
      opacity: 0.55
    }).addTo(map);

    markerRef.current = L.circleMarker(
      [PUNE_ORIGIN.lat, PUNE_ORIGIN.lng],
      {
        radius: 9,
        color: '#ffffff',
        weight: 3,
        fillColor: '#2563eb',
        fillOpacity: 1
      }
    )
      .bindTooltip('VEHICLE_001')
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      trailRef.current = null;
      tileRef.current = null;
    };
  }, []);

  // Update the tile layer when the theme changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    tileRef.current?.remove();

    const tileLayer = L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
      className: isDark ? 'dark-map-tiles' : ''
    });

    tileRef.current = tileLayer.addTo(map);
  }, [isDark]);

  // Update the vehicle position and recent trail.
  useEffect(() => {
    const latest = readings[readings.length - 1];

    if (!latest || !mapRef.current) return;

    const position: L.LatLngExpression = [
      latest.latitude,
      latest.longitude
    ];

    markerRef.current?.setLatLng(position);

    markerRef.current?.setStyle({
      fillColor: latest.alerts.length > 0
        ? '#dc2626'
        : '#2563eb'
    });

    trailRef.current?.setLatLngs(
      readings
        .slice(-40)
        .map(
          (reading) =>
            [reading.latitude, reading.longitude] as L.LatLngTuple
        )
    );

    mapRef.current.panTo(position, {
      animate: true,
      duration: 0.25
    });
  }, [readings]);

  // Refresh Leaflet's dimensions when the container changes size.
  useEffect(() => {
    const id = window.setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 50);

    return () => window.clearTimeout(id);
  }, [height]);

  return (
    <div
      ref={elRef}
      style={{ height }}
      className="w-full overflow-hidden rounded-xl border border-line"
      role="application"
      aria-label="Map showing vehicle position near Pune"
    />
  );
}
