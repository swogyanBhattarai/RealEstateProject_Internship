'use client';
import React, { useState, useEffect } from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import { Home as HomeIcon, Search, Award, Phone } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  // State for image slideshow
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Array of house images from the correct path
  const houseImages = [
    '/imageforLanding/house.jpg',
    '/imageforLanding/house2.jpg',
    '/imageforLanding/house3.jpg',
    '/imageforLanding/house4.jpg',
    '/imageforLanding/house5.jpg',
  ];
  
  // Effect for image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      // Change to next image every 5 seconds
      setCurrentImageIndex((prevIndex) => 
        prevIndex === houseImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section with Image Slideshow */}
      <div className="relative">
        {/* Background Image Slideshow */}
        <div className="absolute inset-0 overflow-hidden">
          {houseImages.map((img, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image 
                src={img}
                alt={`Luxury home ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative px-4 py-32 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Find Your Dream Home
          </h1>
          <p className="max-w-2xl mx-auto mt-6 text-xl text-gray-200">
            Discover exceptional properties that match your lifestyle and aspirations with our premium real estate services.
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row shadow-xl rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="Enter location, property type, or keywords..."
                className="flex-grow px-5 py-4 focus:outline-none"
              />
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 flex items-center justify-center transition duration-300">
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rest of the content remains the same */}
      {/* Featured Properties */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="mt-4 text-lg text-gray-600">
              Explore our handpicked selection of premium properties
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
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
            ].map((property, index) => (
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
      
      {/* Services Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive real estate solutions tailored to your needs
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Property Buying",
                description: "Find your dream home with our expert guidance through the entire buying process.",
                icon: <HomeIcon className="w-8 h-8 text-blue-500" />,
              },
              {
                title: "Property Selling",
                description: "Get the best value for your property with our market analysis and strategic selling approach.",
                icon: <Award className="w-8 h-8 text-blue-500" />,
              },
              {
                title: "Consultation",
                description: "Receive personalized advice from our real estate experts to make informed decisions.",
                icon: <Phone className="w-8 h-8 text-blue-500" />,
              }
            ].map((service, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
                <div className="flex justify-center">{service.icon}</div>
                <h3 className="mt-4 text-xl font-semibold text-center text-gray-900">{service.title}</h3>
                <p className="mt-2 text-gray-600 text-center">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Find Your Perfect Property?</h2>
          <p className="mt-4 text-xl text-blue-100">
            Connect with our experts today and take the first step towards your dream home.
          </p>
          <div className="mt-8 flex justify-center">
            <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg">
              Contact Us Now
            </button>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
            <p className="mt-4 text-lg text-gray-600">
              Hear from our satisfied clients about their experiences
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2">
            {[
              {
                name: "Sarah Johnson",
                role: "Homebuyer",
                quote: "Working with this team made finding my dream home so easy. Their expertise and dedication are unmatched!",
                image: "150/150"
              },
              {
                name: "Michael Brown",
                role: "Property Investor",
                quote: "As a long-time investor, I've worked with many agents, but this team consistently delivers outstanding results.",
                image: "150/150"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <img 
                    src={`/api/placeholder/${testimonial.image}`} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    
    </div>
  );
}