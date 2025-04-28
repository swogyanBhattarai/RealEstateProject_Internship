'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bed, Bath, Square, Wallet, Lock, MapPin, Shield } from 'lucide-react';
import { useWallet } from '../hooks/usewallet';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../contracts/contract-address.json';

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  apartmentType: string;
  amenities: string[];
  images: string[];
  yearBuilt: number;
  featured: boolean;
}

export default function FeaturedProperties() {
  const { account, connectWallet, isConnecting } = useWallet();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const router = useRouter();

  // Fetch featured properties
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        // Directly fetch from the contract instead of using the API
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const contract = new ethers.Contract(
            contractAddress.RealEstateTokenFactory,
            RealEstateTokenFactoryABI,
            provider
          );

          const properties = await contract.getProperties();
          
          // Format the properties data
          const formattedProperties = properties.slice(0, 3).map((property: any, index: number) => ({
            id: index,
            title: property.propertyAddress || `Property ${index + 1}`,
            description: property.description || "A beautiful property available for investment",
            price: Number(property.value) / 1e18,
            bedrooms: property.bedrooms || 3,
            bathrooms: property.bathrooms || 2,
            area: property.area || 1500,
            address: property.propertyAddress || "",
            city: property.city || "City",
            state: property.state || "State",
            zipCode: property.zipCode || "",
            propertyType: property.propertyType || "Apartment",
            apartmentType: property.apartmentType || "",
            amenities: property.amenities || ["Parking", "Security", "Garden"],
            images: property.propertyImageURLs || ["/imageforLanding/house.jpg", "/imageforLanding/house2.jpg", "/imageforLanding/house3.jpg"],
            yearBuilt: property.yearBuilt || 2020,
            featured: true
          }));
          
          setFeaturedProperties(formattedProperties);
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    if (!account) {
      alert('Please connect your wallet to save favorites');
      return;
    }
    
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  // Handle property click - redirect to details or prompt wallet connection
  const handlePropertyClick = (e: React.MouseEvent, propertyId: number) => {
    e.preventDefault();
    
    if (!account) {
      alert('Please connect your wallet to view property details');
    } else {
      router.push(`/page/property/${propertyId}`);
    }
  };

  return (
    <div className="py- bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Exclusive Selection</span>
          <h2 className="mt-2 text-4xl font-bold text-gray-900">Featured Properties</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto my-6"></div>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our handpicked selection of premium properties, each verified and secured with blockchain technology
          </p>
        </div>
        
        <div className="mt-16 grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ensure featuredProperties is an array before calling .map() */}
          {Array.isArray(featuredProperties) ? (
            featuredProperties.map((property) => (
              <div 
                key={property.id} 
                className="bg-white rounded-xl overflow-hidden transition duration-300 hover:shadow-2xl group border border-gray-200 hover:border-blue-200"
              >
                <div className="relative h-72">
                  <Image 
                    src={property.images[0] || "/imageforLanding/house.jpg"} 
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className="absolute top-4 right-0 p-2 bg-white/90 rounded-full hover:bg-white transition-colors z-10 shadow-md btn-press-effect"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                      }`}
                    />
                  </button>
                  {property.featured && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium z-10 shadow-md flex items-center">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      Verified
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <p className="text-white font-bold text-2xl">{formatPrice(property.price)}</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{property.title}</h3>
                      <div className="flex items-center mt-1 text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <p className="text-sm">{property.city}, {property.state}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-4 line-clamp-2">{property.description}</p>
                  
                  <div className="flex justify-between text-sm text-gray-600 mt-6 pb-6 border-b border-gray-100">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bed${property.bedrooms > 1 ? 's' : ''}`}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{property.area} sqft</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {account ? (
                      <Link href={`/page/property/${property.id}`} className="block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium btn-press-effect btn-ripple">
                        View Details
                      </Link>
                    ) : (
                      <button 
                        onClick={(e) => handlePropertyClick(e, property.id)}
                        className="flex w-full text-center px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors items-center justify-center font-medium btn-press-effect btn-ripple"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Connect to View
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No properties available to display.</p>
          )}
        </div>
        
        <div className="mt-16 text-center">
          {account ? (
            <Link href="/page/buy" className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-lg hover:shadow-xl btn-press-effect btn-ripple">
              View All Properties
            </Link>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto bg-gray-50 p-8 rounded-xl border border-gray-200 shadow-md ">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl text-black font-semibold">Unlock Premium Properties</h3>
              <p className="text-black">Connect your wallet to view all available properties and unlock the full potential of our blockchain-powered platform</p>
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md btn-press-effect btn-ripple"
              >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}