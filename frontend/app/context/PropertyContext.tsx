'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { mockProperties } from '../data/mockProperties';

type Property = (typeof mockProperties)[number];

type PropertyContextType = {
  pendingProperties: Property[];
  approvedProperties: Property[];
  approveProperty: (id: number) => void;
  addProperty: (property: Property) => void;
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>(
    mockProperties.map((prop) => ({ ...prop, status: prop.status || 'pending' }))
  );

  const approveProperty = (id: number) => {
    setProperties((prev) =>
      prev.map((prop) => (prop.id === id ? { ...prop, status: 'approved' } : prop))
    );
  };

  const addProperty = (property: Property) => {
    setProperties((prev) => [...prev, { ...property, status: 'pending' }]);
  };

  const pendingProperties = properties.filter((p) => p.status === 'pending');
  const approvedProperties = properties.filter((p) => p.status === 'approved');

  return (
    <PropertyContext.Provider
      value={{ pendingProperties, approvedProperties, approveProperty, addProperty }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('usePropertyContext must be used inside PropertyProvider');
  return context;
};
