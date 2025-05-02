'use client';

import { usePropertyContext } from '../../../context/PropertyContext';
import { useState } from 'react';
import { FileCheck2, MapPin, ShieldCheck } from 'lucide-react';



export default function PropertyAdminPage() {
  const { pendingProperties, approvedProperties, approveProperty } = usePropertyContext();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleApprove = (id: number) => approveProperty(id);
  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const propertiesToShow = activeTab === 'pending' ? pendingProperties : approvedProperties;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-4xl font-extrabold mb-6 text-center tracking-wide text-blue-400">Manage Properties</h1>
      <div className="flex justify-center space-x-4 mb-10">
        <button
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:scale-105 ${
            activeTab === 'pending' ? 'bg-blue-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Properties
        </button>
        <button
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 shadow-md hover:scale-105 ${
            activeTab === 'approved' ? 'bg-green-600' : 'bg-gray-700'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          Approved Properties
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertiesToShow.map((property) => (
          <div key={property.id} className="border border-gray-700 rounded-2xl p-5 bg-gray-850 shadow-xl transition-transform duration-200 hover:scale-[1.02]">
            <h2
              className="text-xl font-bold cursor-pointer text-blue-300 hover:underline"
              onClick={() => toggleExpand(property.id)}
            >
              {property.title}
            </h2>
            {expandedId === property.id && (
              <div className="mt-3 text-sm space-y-2 text-gray-200">
                <p><strong>Description:</strong> {property.description}</p>
                <p><strong>Price:</strong> ${property.price.toLocaleString()}</p>
                <p><strong>Bedrooms:</strong> {property.bedrooms}</p>
                <p><strong>Bathrooms:</strong> {property.bathrooms}</p>
                <p><strong>Area:</strong> {property.area} sq ft</p>
                <p><strong>Address:</strong> {property.address}, {property.city}, {property.state} {property.zipCode}</p>
                <p><strong>Type:</strong> {property.propertyType} - {property.apartmentType}</p>
                <p><strong>Year Built:</strong> {property.yearBuilt}</p>
                <p><strong>Amenities:</strong> <span className="text-gray-100">{property.amenities.join(', ')}</span></p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {property.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Property"
                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    />
                  ))}
                </div>
                {/* Simulated Document Validation */}
                <div className="mt-4 space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-green-400"><FileCheck2 size={16} /> Ownership Documents: <span className="font-semibold">Submitted</span></p>
                  <p className="flex items-center gap-2 text-green-400"><MapPin size={16} /> Geo-tag Verification: <span className="font-semibold">Validated</span></p>
                  <p className="flex items-center gap-2 text-green-400"><ShieldCheck size={16} /> Property Inspection: <span className="font-semibold">Passed</span></p>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-4">
              {activeTab === 'pending' && (
                <button
                  onClick={() => handleApprove(property.id)}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  Approve
                </button>
              )}
              <button
                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
