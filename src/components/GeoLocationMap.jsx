import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const GEO_ERRORS = {
  1: "Location permission was denied. Allow location access in your browser to see your position.",
  2: "Your location could not be determined.",
  3: "Finding your location took too long. Please try again.",
};

const GeolocationMap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return undefined;
    }
    let active = true; // ignore a late reply after the map is hidden
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (err) => {
        if (!active) return;
        // No fake fallback location: showing a random city as "You are here" is misleading.
        setError(GEO_ERRORS[err.code] || "Unable to retrieve your location.");
      },
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ width: '90%', margin: 'auto' }}>
      <h2>User Location Map</h2>
      {error && <p role="alert" style={{ color: "red", background: "white", padding: "8px", borderRadius: "6px" }}>{error}</p>}
      {location && (
        <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "500px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>You are here!</Popup>
          </Marker>
          <Circle
            center={[location.lat, location.lng]}
            radius={500} // Radius in meters
            pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.2 }}
          />
        </MapContainer>
      )}
      {!location && !error && <p role="status" style={{ color: "white" }}>Finding your location…</p>}
    </div>
  );
};

export default GeolocationMap;
