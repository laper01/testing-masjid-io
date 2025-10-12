"use client"

import LocationPicker from "@/components/LocationPicker";
import { useState } from "react";

// --- FIX 2: Define the type for your form data ---
interface FormDataType {
  namaTempat: string;
  latitude: number | null; // Allow number OR null
  longitude: number | null; // Allow number OR null
}

export default function MyFormComponent() {
  // Use the defined type with useState
  const [formData, setFormData] = useState<FormDataType>({
    namaTempat: "Kantor BKD Mataram",
    latitude: null,
    longitude: null,
  });

  const handleLocationChange = (coords: { lat: number; lng: number }) => {
    // This will now work without type errors
    setFormData((prev) => ({
      ...prev,
      latitude: coords.lat,
      longitude: coords.lng,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Data yang akan dikirim:", formData);
    // Logic to send formData to an API...
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label>Nama Tempat</label>
        <input
          type="text"
          className="border rounded p-2 w-full"
          value={formData.namaTempat}
          onChange={(e) => setFormData({ ...formData, namaTempat: e.target.value })}
        />
      </div>

      <LocationPicker
        latitude={formData.latitude}
        longitude={formData.longitude}
        onLocationChange={handleLocationChange}
      />

      <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-4">
        Simpan Lokasi
      </button>

      <pre className="bg-gray-100 p-2 rounded mt-4">
        {JSON.stringify(formData, null, 2)}
      </pre>
    </form>
  );
}