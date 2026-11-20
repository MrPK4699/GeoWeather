import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LuLayers } from 'react-icons/lu';
import { placeLabel } from '../data/cities';
import { precipitationTileUrl } from '../services/weatherApi';

// Pulsing dot drawn in CSS: no marker image files to break in the bundle
const markerIcon = L.divIcon({ className: '', html: '<div class="pulse-marker"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });

/** Glide to the new place when the location changes. */
function FlyTo({ lat, lon }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], 9, { duration: 1.2 });
  }, [lat, lon, map]);
  return null;
}

/** Dark map with an optional live rain-radar overlay. Loaded lazily (Leaflet is big). */
export default function WeatherMap({ place }) {
  const [showRain, setShowRain] = useState(true);
  const { lat, lon } = place;

  return (
    <section aria-labelledby="map-heading" className="glass flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 id="map-heading" className="text-xs font-semibold uppercase tracking-wider text-white/65">
          Map
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-white/80">
          <LuLayers className="size-4" aria-hidden="true" />
          Rain radar
          <input
            type="checkbox"
            checked={showRain}
            onChange={(e) => setShowRain(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-5 w-9 rounded-full bg-white/20 transition after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:bg-sky-400 peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-amber-200"
          />
        </label>
      </div>
      <div className="mt-3 min-h-72 flex-1 overflow-hidden rounded-2xl">
        <MapContainer
          center={[lat, lon]}
          zoom={9}
          scrollWheelZoom={false}
          className="h-full min-h-72 w-full"
          aria-label={`Map of ${placeLabel(place)}`}
        >
          {/* Standard OSM tiles (free, no key), darkened with CSS to match the app (.map-tiles-dark) */}
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            className="map-tiles-dark"
            maxZoom={19}
          />
          {showRain && (
            <TileLayer
              url={precipitationTileUrl()}
              opacity={0.75}
              attribution='Rain &copy; <a href="https://openweathermap.org/">OpenWeather</a>'
            />
          )}
          <Marker position={[lat, lon]} icon={markerIcon} title={placeLabel(place)} />
          <FlyTo lat={lat} lon={lon} />
        </MapContainer>
      </div>
    </section>
  );
}
