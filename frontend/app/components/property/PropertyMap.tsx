'use client';
import React from 'react';
import { MapPin } from 'lucide-react';

interface PropertyMapProps {
  address: string;
  city: string;
  state: string;
}

export default function PropertyMap({ address, city, state }: PropertyMapProps) {
  // This is a placeholder for an actual map implementation
  // You would typically use a library like Google Maps, Mapbox, or Leaflet here
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
      
      <div className="bg-gray-700 rounded-lg overflow-hidden">
        {/* Placeholder for actual map - replace with real map implementation */}
        <div className="h-64 w-full bg-gray-600 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-10 w-10 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">{address}</p>
            <p className="text-gray-300">{city}, {state}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-gray-300">
        <p className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-blue-400" />
          {address}, {city}, {state}
        </p>
      </div>
    </div>
  );
}