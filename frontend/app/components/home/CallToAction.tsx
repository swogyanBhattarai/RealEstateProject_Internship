'use client';
import React from 'react';
import { ArrowRight, Shield } from 'lucide-react';
import { useWallet } from '../hooks/usewallet';
import { useRouter } from 'next/navigation';

export default function CallToAction() {
  const { account, connectWallet } = useWallet();
  const router = useRouter();

  const handleExploreClick = () => {
    if (!account) {
      alert('Please connect your wallet to explore properties');
    } else {
      router.push('/page/buy');
    }
  };

  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-600 opacity-95"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full opacity-20"></div>
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-blue-300 rounded-full opacity-20"></div>
        <div className="absolute -bottom-24 left-1/3 w-64 h-64 bg-blue-500 rounded-full opacity-20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 p-4 rounded-full">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <h2 className="text-4xl font-bold text-white md:text-5xl">Ready to Find Your Perfect Property?</h2>
        <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
          Connect with our blockchain-powered platform today and take the first step towards your dream home with unparalleled security and transparency.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={handleExploreClick}
            className="px-8 py-4 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition duration-300 shadow-lg flex items-center justify-center text-lg"
          >
            Explore Properties
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          
          {!account && (
            <button 
              onClick={connectWallet}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition duration-300 flex items-center justify-center text-lg"
            >
              Connect Wallet
            </button>
          )}
        </div>
        
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">500+</div>
            <div className="text-blue-100 mt-2">Properties</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">300+</div>
            <div className="text-blue-100 mt-2">Happy Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">100%</div>
            <div className="text-blue-100 mt-2">Secure Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">24/7</div>
            <div className="text-blue-100 mt-2">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}