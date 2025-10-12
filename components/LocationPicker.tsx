"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Marker, useMap, useMapEvents } from "react-leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

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

// --- FIX 1: Add type definitions for props ---
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
  latitude?: number | null;
  longitude?: number | null;
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          onLocationChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsInitializing(false);
        },
        () => {
          onLocationChange({ lat: -8.583333, lng: 116.116667 });
          setIsInitializing(false);
        }
      );
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleCoordChange = (coord: 'lat' | 'lng', value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onLocationChange({
        lat: coord === 'lat' ? numericValue : latitude!,
        lng: coord === 'lng' ? numericValue : longitude!,
      });
    }
  };

  if (isInitializing || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Mencari lokasi...</p>
      </div>
    );
  }

  const currentPosition: [number, number] = [latitude, longitude];

  return (
    <div>
      <div style={{ height: "400px", width: "100%", borderRadius: "1rem", overflow: "hidden" }}>
        <MapContainer
          center={currentPosition}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={currentPosition} 
            onPositionChange={([lat, lng]) => onLocationChange({ lat, lng })}
          />
          <MapUpdater position={currentPosition} />
        </MapContainer>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Latitude</label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => handleCoordChange('lat', e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Longitude</label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => handleCoordChange('lng', e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          />
        </div>
      </div>
    </div>
  );
}