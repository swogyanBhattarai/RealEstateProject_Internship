'use client'
import React from 'react';
import { Home as HomeIcon, Award, Phone, Shield, Coins, Clock } from 'lucide-react';

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
      title: "Blockchain-Secured Properties",
      description: "Every property transaction is secured with blockchain technology for maximum transparency and security.",
      icon: <Shield className="w-10 h-10 text-blue-500" />,
    },
    {
      title: "Premium Property Selection",
      description: "Find your dream home with our expert guidance through our curated selection of premium properties.",
      icon: <HomeIcon className="w-10 h-10 text-blue-500" />,
    },
    {
      title: "Smart Contract Selling",
      description: "Get the best value for your property with our market analysis and blockchain-powered smart contracts.",
      icon: <Award className="w-10 h-10 text-blue-500" />,
    },
    {
      title: "Expert Consultation",
      description: "Receive personalized advice from our real estate and blockchain experts to make informed decisions.",
      icon: <Phone className="w-10 h-10 text-blue-500" />,
    },
    {
      title: "Transparent Pricing",
      description: "All fees and costs are clearly displayed and secured in smart contracts with no hidden charges.",
      icon: <Coins className="w-10 h-10 text-blue-500" />,
    },
    {
      title: "Quick Transactions",
      description: "Complete property transactions in a fraction of the time compared to traditional methods.",
      icon: <Clock className="w-10 h-10 text-blue-500" />,
    }
  ];

  return (
    <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900">Why Choose Our Platform</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto my-6"></div>
          <p className="mt-4 text-xl text-gray-600">
            Comprehensive blockchain-powered real estate solutions tailored to your needs
          </p>
        </div>
        
        <div className="mt-16 grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100 group hover:border-blue-200"
            >
              <div className="p-4 bg-blue-50 rounded-full inline-flex mb-6 group-hover:bg-blue-100 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}