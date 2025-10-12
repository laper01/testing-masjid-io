'use client';

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Marker, useMap, useMapEvents } from "react-leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });

const DefaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);
  return null;
}

interface LocationMarkerProps {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
}

function LocationMarker({ position, onPositionChange }: LocationMarkerProps) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker
      draggable
      position={position}
      eventHandlers={{
        dragend(e) {
          const marker = e.target as L.Marker;
          const latlng = marker.getLatLng();
          onPositionChange([latlng.lat, latlng.lng]);
        },
      }}
    />
  );
}

interface LocationPickerProps {
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPickerSearch({ onLocationChange }: LocationPickerProps) {
  // --- FIX: Component now manages its own position state ---
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(newPos);
        // Also notify parent on initial load
        onLocationChange({ lat: newPos[0], lng: newPos[1] });
      },
      () => {
        // Fallback to a default location (e.g., Mataram, Lombok)
        const defaultPos: [number, number] = [-8.583333, 116.116667];
        setPosition(defaultPos);
        onLocationChange({ lat: defaultPos[0], lng: defaultPos[1] });
      }
    );
  }, []); // Run only once on mount

  const handlePositionChange = (newPos: [number, number]) => {
    setPosition(newPos);
    onLocationChange({ lat: newPos[0], lng: newPos[1] });
  };

  const handleCoordInputChange = (coord: 'lat' | 'lng', value: string) => {
    if (!position) return;
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      const newPos: [number, number] = [
        coord === 'lat' ? numericValue : position[0],
        coord === 'lng' ? numericValue : position[1],
      ];
      handlePositionChange(newPos);
    }
  };

  if (!position) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24rem' }}>
        <p>Finding location...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ height: "400px", width: "100%", borderRadius: "1rem", overflow: "hidden" }}>
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            onPositionChange={handlePositionChange}
          />
          <MapUpdater position={position} />
        </MapContainer>
      </div>
      <div className="mt-4 row">
        <div className="col-md-6">
          <label className="form-label">Latitude</label>
          <input
            type="number"
            step="any"
            value={position[0]}
            onChange={(e) => handleCoordInputChange('lat', e.target.value)}
            className="form-control"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Longitude</label>
          <input
            type="number"
            step="any"
            value={position[1]}
            onChange={(e) => handleCoordInputChange('lng', e.target.value)}
            className="form-control"
          />
        </div>
      </div>
    </div>
  );
}