'use client';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer';
import { Search, Home, Filter, X, MapPin, Bed, Bath, Square, DollarSign, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Pagination from '../../components/pagination';
import { mockProperties } from '../../data/mockProperties';



// Available apartment types (same as in sell page)
const apartmentTypes = [
  'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom',
  'Loft', 'Duplex', 'Penthouse'
];

// Available amenities for apartments (same as in sell page)
const availableAmenities = [
  'Swimming Pool', 'Gym', 'Elevator', 'Parking', 'Security System',
  'Balcony', 'Air Conditioning', 'Heating', 'Laundry Room', 'Storage Room',
  'Pet Friendly', 'Furnished', 'Wheelchair Access', 'Concierge Service'
];

export default function BuyPage() {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [bedroomsFilter, setBedroomsFilter] = useState<number | null>(null);
  const [bathroomsFilter, setBathroomsFilter] = useState<number | null>(null);
  const [selectedApartmentTypes, setSelectedApartmentTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [filteredProperties, setFilteredProperties] = useState(mockProperties);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [isLoading, setIsLoading] = useState(false);

  // Filter properties based on search and filters
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      const filtered = mockProperties.filter(property => {
        // Search term filter
        const matchesSearch = 
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.zipCode.includes(searchTerm);
        
        // Price range filter
        const matchesPrice = 
          property.price >= priceRange[0] && property.price <= priceRange[1];
        
        // Bedrooms filter
        const matchesBedrooms = 
          bedroomsFilter === null || 
          (bedroomsFilter === 4 ? property.bedrooms >= 4 : property.bedrooms === bedroomsFilter);
        
        // Bathrooms filter
        const matchesBathrooms = 
          bathroomsFilter === null || 
          (bathroomsFilter === 3 ? property.bathrooms >= 3 : Math.floor(property.bathrooms) === bathroomsFilter);
        
        // Apartment type filter
        const matchesApartmentType = 
          selectedApartmentTypes.length === 0 || 
          selectedApartmentTypes.includes(property.apartmentType);
        
        // Amenities filter
        const matchesAmenities = 
          selectedAmenities.length === 0 || 
          selectedAmenities.every(amenity => property.amenities.includes(amenity));
        
        return matchesSearch && matchesPrice && matchesBedrooms && matchesBathrooms && 
               matchesApartmentType && matchesAmenities;
      });
      
      // Sort the filtered properties
      const sorted = [...filtered].sort((a, b) => {
        switch(sortOption) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'newest':
            return b.yearBuilt - a.yearBuilt;
          case 'bedrooms':
            return b.bedrooms - a.bedrooms;
          case 'featured':
          default:
            return b.featured ? 1 : -1;
        }
      });
      
      setFilteredProperties(sorted);
      setIsLoading(false);
    }, 500); // Simulate loading delay
    
    return () => clearTimeout(timer);
  }, [searchTerm, priceRange, bedroomsFilter, bathroomsFilter, selectedApartmentTypes, selectedAmenities, sortOption]);

  // Toggle apartment type selection
  const toggleApartmentType = (type: string) => {
    setSelectedApartmentTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(favId => favId !== id) 
        : [...prev, id]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 2000000]);
    setBedroomsFilter(null);
    setBathroomsFilter(null);
    setSelectedApartmentTypes([]);
    setSelectedAmenities([]);
    setSortOption('featured');
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-300">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Find Your Dream Home</h1>
            <p className="mt-4 text-lg text-gray-400">
              Browse our selection of premium apartments and find the perfect match for your lifestyle
            </p>
          </div>

          {/* Search and Filter Section - Updated with morphic design */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by location, property name, or keywords..."
                  className="pl-10 pr-4 py-2 w-full bg-gray-800/30 backdrop-blur-md border border-gray-700/50 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white placeholder:text-gray-400 shadow-lg"
                  style={{
                    boxShadow: "inset 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(255, 255, 255, 0.05)"
                  }}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600/80 backdrop-blur-md text-white rounded-lg hover:bg-blue-700/90 transition-colors shadow-lg border border-blue-500/30"
                style={{
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                }}
              >
                <Filter className="h-5 w-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Filters Panel - Updated with morphic design */}
            {showFilters && (
              <div className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-lg p-6 mb-6 animate-fadeIn shadow-xl"
                style={{
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 2px 4px 0 rgba(255, 255, 255, 0.05)"
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Filters</h3>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Reset All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Price Range Filter - Updated with morphic design */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price Range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        min="0"
                        step="10000"
                        className="w-full px-3 py-2 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white shadow-inner"
                        style={{
                          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)"
                        }}
                        placeholder="Min"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                        min="0"
                        step="10000"
                        className="w-full px-3 py-2 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white shadow-inner"
                        style={{
                          boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)"
                        }}
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Bedrooms Filter - Updated with morphic design */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bedrooms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setBedroomsFilter(null)}
                        className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                          bedroomsFilter === null
                            ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-md'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border border-gray-600/30'
                        }`}
                        style={{
                          boxShadow: bedroomsFilter === null ? 
                            "0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)" : 
                            "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        }}
                      >
                        Any
                      </button>
                      {[0, 1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBedroomsFilter(num)}
                          className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                            bedroomsFilter === num
                              ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-md'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border border-gray-600/30'
                          }`}
                          style={{
                            boxShadow: bedroomsFilter === num ? 
                              "0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)" : 
                              "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                          }}
                        >
                          {num === 0 ? 'Studio' : num === 4 ? '4+' : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bathrooms Filter - Updated with morphic design */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bathrooms
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setBathroomsFilter(null)}
                        className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                          bathroomsFilter === null
                            ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-md'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border border-gray-600/30'
                        }`}
                        style={{
                          boxShadow: bathroomsFilter === null ? 
                            "0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)" : 
                            "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        }}
                      >
                        Any
                      </button>
                      {[1, 2, 3].map((num) => (
                        <button
                          key={num}
                          onClick={() => setBathroomsFilter(num)}
                          className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                            bathroomsFilter === num
                              ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-md'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border border-gray-600/30'
                          }`}
                          style={{
                            boxShadow: bathroomsFilter === num ? 
                              "0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)" : 
                              "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                          }}
                        >
                          {num === 3 ? '3+' : num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Options - Updated with morphic design */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white shadow-inner appearance-none"
                      style={{
                        boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2)",
                        backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em",
                        paddingRight: "2.5rem"
                      }}
                    >
                      <option value="featured">Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest</option>
                      <option value="bedrooms">Most Bedrooms</option>
                    </select>
                  </div>
                </div>

                {/* Advanced Filters - Apartment Types - Updated with morphic design */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Apartment Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {apartmentTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleApartmentType(type)}
                        className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                          selectedApartmentTypes.includes(type)
                            ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-md'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border border-gray-600/30'
                        }`}
                        style={{
                          boxShadow: selectedApartmentTypes.includes(type) ? 
                            "0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)" : 
                            "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Filters - Amenities - Updated with morphic design */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Amenities</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {availableAmenities.map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-3 py-1 rounded-full text-sm backdrop-blur-sm ${
                          selectedAmenities.includes(amenity)
                            ? 'bg-blue-600/80 text-white border border-blue-500/50 shadow-md'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 border border-gray-600/30'
                        } truncate`}
                        style={{
                          boxShadow: selectedAmenities.includes(amenity) ? 
                            "0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)" : 
                            "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        }}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Count and Active Filters - Updated with morphic design */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="mb-2 sm:mb-0">
              <p className="text-gray-400">
                {isLoading ? 'Searching...' : `${filteredProperties.length} properties found`}
              </p>
            </div>
            
            {/* Active Filters - Updated with morphic design */}
            {(selectedApartmentTypes.length > 0 || selectedAmenities.length > 0 || 
              bedroomsFilter !== null || bathroomsFilter !== null || 
              priceRange[0] > 0 || priceRange[1] < 2000000) && (
              <div className="flex flex-wrap gap-2">
                {selectedApartmentTypes.map(type => (
                  <div key={type} className="flex items-center bg-blue-900/30 backdrop-blur-sm text-blue-200 px-2 py-1 rounded-full text-xs border border-blue-800/50">
                    {type}
                    <button onClick={() => toggleApartmentType(type)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {selectedAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center bg-blue-900/30 backdrop-blur-sm text-blue-200 px-2 py-1 rounded-full text-xs border border-blue-800/50">
                    {amenity}
                    <button onClick={() => toggleAmenity(amenity)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {bedroomsFilter !== null && (
                  <div className="flex items-center bg-blue-900/30 backdrop-blur-sm text-blue-200 px-2 py-1 rounded-full text-xs border border-blue-800/50">
                    {bedroomsFilter === 0 ? 'Studio' : `${bedroomsFilter}${bedroomsFilter === 4 ? '+' : ''} Bed`}
                    <button onClick={() => setBedroomsFilter(null)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {bathroomsFilter !== null && (
                  <div className="flex items-center bg-blue-900/30 backdrop-blur-sm text-blue-200 px-2 py-1 rounded-full text-xs border border-blue-800/50">
                    {`${bathroomsFilter}${bathroomsFilter === 3 ? '+' : ''} Bath`}
                    <button onClick={() => setBathroomsFilter(null)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                
                {(priceRange[0] > 0 || priceRange[1] < 2000000) && (
                  <div className="flex items-center bg-blue-900/30 backdrop-blur-sm text-blue-200 px-2 py-1 rounded-full text-xs border border-blue-800/50">
                    {`${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`}
                    <button onClick={() => setPriceRange([0, 2000000])} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Property Listings - Updated with morphic design */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/40 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-lg">
              <Home className="mx-auto h-12 w-12 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No properties found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search criteria</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-blue-600/80 backdrop-blur-md text-white rounded-lg hover:bg-blue-700/90 transition-colors shadow-md border border-blue-500/30"
                style={{
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property: any) => (
                <div 
                  key={property.id} 
                  className="bg-gray-800/40 backdrop-blur-md rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02] border border-gray-700/50"
                  style={{
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div className="relative h-48">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(property.id) ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                      />
                    </button>
                    {property.featured && (
                      <div className="absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded border border-blue-500/50">
                        Featured
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-white font-bold text-xl">{formatPrice(property.price)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate">{property.title}</h3>
                    <div className="flex items-center text-gray-400 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="truncate">{`${property.address}, ${property.city}, ${property.state}`}</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{property.description}</p>
                    
                    <div className="flex justify-between text-sm text-gray-300 mb-4">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} Bed${property.bedrooms > 1 ? 's' : ''}`}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span>{property.area} sqft</span>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/page/property/${property.id}`} 
                      className="block w-full text-center px-4 py-2 bg-blue-600/80 backdrop-blur-sm text-white rounded-lg hover:bg-blue-700/90 transition-colors border border-blue-500/30 shadow-md"
                      style={{
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination - Updated with morphic design */}
          {filteredProperties.length > 0 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button 
                  className="px-3 py-1 bg-gray-700/50 backdrop-blur-sm text-gray-300 rounded-md hover:bg-gray-600/70 disabled:opacity-50 border border-gray-600/30"
                  style={{
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  }}
                  disabled
                >
                  Previous
                </button>
                <button 
                  className="px-3 py-1 bg-blue-600/80 backdrop-blur-sm text-white rounded-md border border-blue-500/50 shadow-md"
                  style={{
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                  }}
                >
                  1
                </button>
                <button 
                  className="px-3 py-1 bg-gray-700/50 backdrop-blur-sm text-gray-300 rounded-md hover:bg-gray-600/70 border border-gray-600/30"
                  style={{
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  }}
                >
                  2
                </button>
                <button 
                  className="px-3 py-1 bg-gray-700/50 backdrop-blur-sm text-gray-300 rounded-md hover:bg-gray-600/70 border border-gray-600/30"
                  style={{
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  }}
                >
                  3
                </button>
                <button 
                  className="px-3 py-1 bg-gray-700/50 backdrop-blur-sm text-gray-300 rounded-md hover:bg-gray-600/70 border border-gray-600/30"
                  style={{
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                  }}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}