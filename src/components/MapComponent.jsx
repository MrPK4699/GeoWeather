import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
// Fix for default marker icons

const MapComponent = ({ location, lat, lon }) => {
  const mapStyle = {
    height: "400px",
    width: "80%",
    margin: "20px auto",
  };

  const MapUpdater = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lon) {
        map.setView([lat, lon], 10); // Update map center and zoom
      }
    }, [lat, lon, map]);
    return null;
  };

  return (
    <MapContainer center={[lat, lon]} zoom={10} style={mapStyle}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lon]}>
        <Popup>{location}</Popup>
      </Marker>
      <MapUpdater lat={lat} lon={lon} />
    </MapContainer>
  );
};

export default MapComponent;

