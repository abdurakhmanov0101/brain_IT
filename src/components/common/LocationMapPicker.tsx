import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ZoomIn, ZoomOut, Navigation } from 'lucide-react';

interface LocationMapPickerProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export const LocationMapPicker: React.FC<LocationMapPickerProps> = ({
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Default to Tashkent center if coordinates are zero/invalid
  const initialLat = latitude && latitude !== 0 ? latitude : 41.311081;
  const initialLng = longitude && longitude !== 0 ? longitude : 69.240562;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create custom glowing pin icon using L.divIcon so no external images are required
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -100%);">
          <div style="position: absolute; bottom: 0; width: 12px; height: 6px; background: rgba(0,0,0,0.3); border-radius: 50%; filter: blur(2px);"></div>
          <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981, #059669); border: 3px solid #ffffff; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 10px rgba(16,185,129,0.5); display: flex; align-items: center; justify-content: center;">
            <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 16,
      zoomControl: false, // We render custom clean zoom controls or let scroll zoom work
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;

    const circle = L.circle([initialLat, initialLng], {
      color: '#10B981',
      fillColor: '#34D399',
      fillOpacity: 0.25,
      weight: 2,
      radius: radiusMeters || 100,
    }).addTo(map);

    circleRef.current = circle;

    // Handle map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(6));
      const lng = parseFloat(e.latlng.lng.toFixed(6));
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      onLocationChange(lat, lng);
    });

    // Handle marker drag
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const lat = parseFloat(pos.lat.toFixed(6));
      const lng = parseFloat(pos.lng.toFixed(6));
      circle.setLatLng([lat, lng]);
      onLocationChange(lat, lng);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map, marker, and circle when props change externally
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;
    const currentLat = latitude && latitude !== 0 ? latitude : 41.311081;
    const currentLng = longitude && longitude !== 0 ? longitude : 69.240562;

    const currentPos = markerRef.current.getLatLng();
    if (
      Math.abs(currentPos.lat - currentLat) > 0.000001 ||
      Math.abs(currentPos.lng - currentLng) > 0.000001
    ) {
      markerRef.current.setLatLng([currentLat, currentLng]);
      circleRef.current.setLatLng([currentLat, currentLng]);
      mapInstanceRef.current.setView([currentLat, currentLng]);
    }
    circleRef.current.setRadius(radiusMeters || 100);
  }, [latitude, longitude, radiusMeters]);

  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-inner group">
      <div
        ref={mapContainerRef}
        className="w-full h-[280px] sm:h-[320px] z-0 focus:outline-none"
      />

      {/* Map Helper Badge Overlay */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-wrap gap-1.5">
        <div className="bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg border border-white/15 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
          <span>Xaritani bosib yoki markerni surib joylashuvni belgilang</span>
        </div>
      </div>

      {/* Quick Center Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current && markerRef.current) {
              const pos = markerRef.current.getLatLng();
              mapInstanceRef.current.setView(pos, 17, { animate: true });
            }
          }}
          title="Markazga olib kelish"
          className="w-9 h-9 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-emerald-500 hover:text-white rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Coordinates Display Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none flex items-center justify-between bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-md text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Tanlangan nuqta:</span>
        </div>
        <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
          {latitude ? latitude.toFixed(6) : '41.311081'}, {longitude ? longitude.toFixed(6) : '69.240562'}
        </div>
      </div>
    </div>
  );
};
