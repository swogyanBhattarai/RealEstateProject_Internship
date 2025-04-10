import React from 'react';

// Property type definition
type Property = {
  title: string;
  price: string;
  image: string;
  beds: number;
  baths: number;
  sqft: number;
};

export default function FeaturedProperties() {
  // Featured properties data
  const properties: Property[] = [
    {
      title: "Modern Downtown Apartment",
      price: "$450,000",
      image: "400/250",
      beds: 2,
      baths: 2,
      sqft: 1200,
    },
    {
      title: "Luxury Villa with Pool",
      price: "$1,250,000",
      image: "400/250",
      beds: 4,
      baths: 3,
      sqft: 3500,
    },
    {
      title: "Cozy Suburban Family Home",
      price: "$650,000",
      image: "400/250",
      beds: 3,
      baths: 2,
      sqft: 2100,
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          <p className="mt-4 text-lg text-gray-600">
            Explore our handpicked selection of premium properties
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl">
              <img 
                src={`/api/placeholder/${property.image}`} 
                alt={property.title} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{property.title}</h3>
                <p className="mt-2 text-2xl font-semibold text-blue-600">{property.price}</p>
                <div className="mt-4 flex items-center justify-between text-gray-600">
                  <div className="flex items-center">
                    <span className="text-sm">{property.beds} beds</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">{property.baths} baths</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm">{property.sqft} sqft</span>
                  </div>
                </div>
                <button className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}