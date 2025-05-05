'use client';
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface PropertyMapProps {
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

export default function PropertyMap({ address, city, state, lat, lng }: PropertyMapProps) {
  const center = { lat, lng };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Location</h2>

      <LoadScript googleMapsApiKey="AIzaSyCmaczzVfu5OGqpBAnzBVskLdk-4XvKHZ8">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>

      <div className="mt-4 text-gray-300">
        <p className="flex items-center">
          📍 {address}, {city}, {state}
        </p>
      </div>
    </div>
  );
}
