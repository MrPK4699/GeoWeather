import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const GeolocationMap = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const fallbackLocation = { lat: 40.7128, lng: -74.006 }; // New York City

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.error("Geolocation error:", err.message);
          setError("Unable to retrieve location. Using fallback location.");
          setLocation(fallbackLocation);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLocation(fallbackLocation);
    }
  }, []);

  console.log(location);
  return (
    <div style={{width:'90%', margin:'auto'}}>
      <h2>User Location Map</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {location ? (
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
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
};

export default GeolocationMap;
