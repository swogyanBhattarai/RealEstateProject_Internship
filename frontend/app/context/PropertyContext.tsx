'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  approvePropertyContract, 
  rejectPropertyContract, 
  getPendingProperties 
} from '../components/utils/contractInteraction';

type Property = {
  id: number;
  propertyAddress: string;
  value: string;
  tokenAddress: string;
  propertyImageURLs: string[];
  status: 'pending' | 'approved' | 'rejected';
  originalIndex?: number; // Original index from the UI
  contractIndex?: number; // Index to use with the contract
  originalOwner?: string; // Add the original owner address
};

type PropertyContextType = {
  pendingProperties: Property[];
  approvedProperties: Property[];
  rejectedProperties: Property[]; 
  approveProperty: (id: number) => Promise<void>;
  rejectProperty: (id: number) => Promise<void>;
  addProperty: (property: Property) => void;
  refreshPendingProperties: () => Promise<void>;
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with empty arrays instead of mock data
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [approvedProperties, setApprovedProperties] = useState<Property[]>([]);
  const [rejectedProperties, setRejectedProperties] = useState<Property[]>([]);

  // Function to fetch pending properties
  const fetchPendingProperties = async () => {
    try {
      console.log('Fetching pending properties...');
      
      // Check if window is defined (client-side only)
      if (typeof window === 'undefined') {
        console.log('Window is undefined, skipping fetch');
        return;
      }
      
      // Check if ethereum provider is available
      if (!window.ethereum) {
        console.log('Ethereum provider not available');
        return;
      }
      
      const properties = await getPendingProperties();
      console.log('Raw pending properties from contract:', properties);
      
      // Check if properties is defined and is an array before mapping
      if (properties && Array.isArray(properties)) {
        console.log('Received properties:', properties);
        
        // If properties array is empty, log it but don't update state
        if (properties.length === 0) {
          console.log('No pending properties found');
          setPendingProperties([]);
          return;
        }
        
        // Transform the properties to match our expected format
        const formattedProperties = properties.map((prop, index) => {
          // Add null checks to avoid accessing properties of undefined
          if (!prop) {
            console.log(`Property at index ${index} is undefined`);
            return null;
          }

          // Process propertyImageURLs to ensure they are valid URLs
          const processedImageURLs = (prop.propertyImageURLs || []).map((url: string) =>
            typeof url === 'string' && (url.startsWith('http') || url.startsWith('/')) ? url : `https://gateway.pinata.cloud/ipfs/${url}`
          );
          
          return {
            id: index,
            propertyAddress: prop?.propertyAddress || '',
            value: prop?.value || '0',
            tokenAddress: '',  
            propertyImageURLs: processedImageURLs,
            status: 'pending' as const,
            originalIndex: index, // Store the UI index
            contractIndex: prop?.contractIndex || index,
            originalOwner: prop?.originalOwner || '' 
          };
        }).filter(Boolean); // Remove null entries
        
        console.log('Formatted properties:', formattedProperties);
        setPendingProperties(formattedProperties as Property[]);
      } else {
        console.error('Invalid properties data received:', properties);
        setPendingProperties([]);
      }
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      setPendingProperties([]);
    }
  };

  // Fetch pending properties from the blockchain
  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      fetchPendingProperties();
      
      // Set up an interval to refresh pending properties every 30 seconds
      const intervalId = setInterval(() => {
        fetchPendingProperties();
      }, 30000);
      
      // Clean up the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, []);

  const approveProperty = async (id: number) => {
    // Find the property to approve
    const property = pendingProperties.find(p => p.id === id);
    if (!property) {
      console.error(`Property with id ${id} not found`);
      return;
    }

    try {
      // Use the contractIndex from the property object
      const contractIndex = property.contractIndex !== undefined ? property.contractIndex : id;
      console.log(`Approving property with UI id ${id}, contract index ${contractIndex}`);
      
      // Call the contract to approve the property
      await approvePropertyContract(contractIndex);
      
      // Update local state
      setPendingProperties(prev => prev.filter(p => p.id !== id));
      setApprovedProperties(prev => [...prev, {...property, status: 'approved'}]);
      
      // Refresh the pending properties list
      await fetchPendingProperties();
    } catch (error: any) {
      console.error('Error approving property:', error);
      // Check for the specific error message from the contract
      if (error.message && error.message.includes("Already handled or invalid")) {
        console.warn(`Property with contract index ${property.contractIndex} might have already been processed.`);
        // Refresh the list to potentially remove the item from pending
        await fetchPendingProperties();
        throw new Error(`Property #${id} might have already been approved or rejected.`);
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

  const rejectProperty = async (id: number) => {
    // Find the property to reject
    const property = pendingProperties.find(p => p.id === id);
    if (!property) {
      console.error(`Property with id ${id} not found`);
      return;
    }

    try {
      // Use the contractIndex from the property object
      const contractIndex = property.contractIndex !== undefined ? property.contractIndex : id;
      console.log(`Rejecting property with UI id ${id}, contract index ${contractIndex}`);
      
      // Call the contract to reject the property
      await rejectPropertyContract(contractIndex);
      
      // Update local state
      setPendingProperties(prev => prev.filter(p => p.id !== id));
      setRejectedProperties(prev => [...prev, {...property, status: 'rejected'}]);
      
      // Refresh the pending properties list
      await fetchPendingProperties();
    } catch (error: any) {
      console.error('Error rejecting property:', error);
       // Check for the specific error message from the contract
      if (error.message && error.message.includes("Already handled or invalid")) {
        console.warn(`Property with contract index ${property.contractIndex} might have already been processed.`);
         // Refresh the list to potentially remove the item from pending
        await fetchPendingProperties();
        throw new Error(`Property #${id} might have already been approved or rejected.`);
      } else {
        throw error; // Re-throw other errors
      }
    }
  };

  const addProperty = async (property: Property) => {
    setPendingProperties(prev => [...prev, property]);
    // Refresh the pending properties list to ensure we have the latest data
    await fetchPendingProperties();
  };

  return (
    <PropertyContext.Provider value={{
      pendingProperties,
      approvedProperties,
      rejectedProperties,
      approveProperty,
      rejectProperty,
      addProperty,
      refreshPendingProperties: fetchPendingProperties
    }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('usePropertyContext must be used inside PropertyProvider');
  return context;
};