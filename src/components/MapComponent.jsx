import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons (bundlers break Leaflet's built-in icon paths)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Defined OUTSIDE MapComponent: a component declared inside another one is a brand-new
// component on every render, so React would unmount and remount it each time.
const MapUpdater = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 10); // Re-centre when the city changes
    }
  }, [lat, lon, map]);
  return null;
};

const MapComponent = ({ location, lat, lon }) => (
  <div style={{ width: '90%', margin: 'auto' }}>
    <h2>City Map</h2>
    <MapContainer center={[lat, lon]} zoom={10} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lon]}>
        <Popup>{location}</Popup>
      </Marker>
      <MapUpdater lat={lat} lon={lon} />
    </MapContainer>
  </div>
);

export default MapComponent;
