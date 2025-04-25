'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../../components/navbar';
import Footer from '../../../components/footer';
import { 
  Bed, Bath, Square, MapPin, Calendar, Heart, 
  ArrowLeft, ArrowRight, Share2, Phone, Mail, MessageSquare 
} from 'lucide-react';

// Import mock data from the shared data file
import { mockProperties } from '../../../data/mockProperties';

export default function PropertyDetails() {
  const params = useParams();
  const id = Number(params.id);
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch property data
  useEffect(() => {
    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // Find property in mock data
      const foundProperty = Array.isArray(mockProperties) ? mockProperties.find(p => p.id === id) : null;
      setProperty(foundProperty || null);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  // Handle image navigation
  const nextImage = () => {
    if (property && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-medium text-white mb-2">Property not found</h3>
            <p className="text-gray-400 mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <Link href="/page/buy" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Back to Properties
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-gray-300">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/page/buy" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Link>
          </div>
          
          {/* Property header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{`${property.address}, ${property.city}, ${property.state} ${property.zipCode}`}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <span className="text-3xl font-bold text-white mr-4">{formatPrice(property.price)}</span>
              <button 
                onClick={toggleFavorite}
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
              <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors ml-2">
                <Share2 className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Property images */}
          <div className="mb-8 relative">
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={property.images[currentImageIndex]}
                alt={property.title}
                fill
                className="object-cover"
              />
              
              {/* Image navigation buttons */}
              {property.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                  <button 
                    onClick={nextImage}
                    disabled={currentImageIndex === property.images.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="h-5 w-5 text-white" />
                  </button>
                </>
              )}
              
              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
              
              {property.featured && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>
            
            {/* Thumbnail navigation */}
            {property.images.length > 1 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
                {property.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Property details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="md:col-span-2">
              {/* Key details */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Bed className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Bedrooms</span>
                    <span className="text-lg font-semibold text-white">
                      {property.bedrooms === 0 ? 'Studio' : property.bedrooms}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Bath className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Bathrooms</span>
                    <span className="text-lg font-semibold text-white">{property.bathrooms}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Square className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Area</span>
                    <span className="text-lg font-semibold text-white">{property.area} sqft</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Year Built</span>
                    <span className="text-lg font-semibold text-white">{property.yearBuilt}</span>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">{property.description}</p>
              </div>
              
              {/* Amenities */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Location */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
                <div className="bg-gray-700 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Map will be integrated here</p>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Contact form */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6 sticky top-24">
                <h2 className="text-xl font-semibold text-white mb-4">Contact Agent</h2>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-blue-500 font-bold">BA</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">BlocAdobe Agent</h3>
                    <p className="text-gray-400 text-sm">Real Estate Professional</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 mr-2 text-blue-400" />
                    <span>(123) 456-7890</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                    <span>agent@blocadobe.com</span>
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="I'm interested in this property..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
}