'use client'
import React from 'react';
import { Home as HomeIcon, Award, Phone } from 'lucide-react';

// Service type definition
type Service = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

export default function ServicesSection() {
  // Services data
  const services: Service[] = [
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
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
          <p className="mt-4 text-lg text-gray-600">
            Comprehensive real estate solutions tailored to your needs
          </p>
        </div>
        
        <div className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition duration-300">
              <div className="flex justify-center">{service.icon}</div>
              <h3 className="mt-4 text-xl font-semibold text-center text-gray-900">{service.title}</h3>
              <p className="mt-2 text-gray-600 text-center">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}