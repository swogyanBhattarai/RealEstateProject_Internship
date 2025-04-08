'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useWallet } from './hooks/usewallet';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'backdrop-blur-lg bg-white/90 shadow-lg py-3' 
        : 'backdrop-blur-md bg-white/80 shadow-md py-4'
    } px-8 flex items-center border-b border-gray-100`}>
      {/* Left side - Navigation links */}
      <div className="flex gap-8 text-sm font-medium mr-auto hidden md:flex">
        <Link href="/buy" className="text-black-800 hover:text-blue-600 transition-colors relative group">
          Buy
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link href="/rent" className="text-black-800 hover:text-blue-600 transition-colors relative group">
          Rent
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </Link>
        <Link href="/sell" className="text-black-800 hover:text-black-600 transition-colors relative group">
          Sell
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
        </Link>
      </div>
      
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-gray-800 hover:text-blue-600 transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Center - Logo and name */}
      <div className="flex items-center gap-0 mx-auto">
        <div className="relative group">
          <Image
            src="/logo2.png"
            alt="BlocAdobe Logo"
            width={60}
            height={60}
          />
        </div>
        <Link href="/" className="text-xl font-bold text-black-900 hover:text-blue-700 transition-all duration-300 -ml-1">
          BlocAdobe
        </Link>
      </div>
      
      {/* Right side - Wallet connection */}
      <div className="hidden md:block ml-auto">
        {account ? (
          <div className="flex items-center gap-2">
            <span className="bg-gray-50 border border-gray-100 text-gray-900 px-3 py-1.5 rounded-full text-xs flex items-center shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <button
              onClick={disconnectWallet}
              className="text-gray-800 hover:text-red-500 text-xs transition-colors relative after:content-[''] after:absolute after:w-0 after:h-[1px] after:bg-red-500 after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-all after:duration-300"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 hover:from-blue-600 hover:to-blue-800 relative overflow-hidden group"
            disabled={isConnecting}
          >
            <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-white/95 backdrop-blur-lg z-40 p-6 animate-fadeIn shadow-xl">
          <div className="flex flex-col gap-6">
            <Link 
              href="/buy" 
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg border-b border-gray-100 pb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Buy
            </Link>
            <Link 
              href="/rent" 
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg border-b border-gray-100 pb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rent
            </Link>
            <Link 
              href="/sell" 
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2 text-lg border-b border-gray-100 pb-3"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sell
            </Link>
            
            <div className="mt-4">
              {account ? (
                <div className="flex flex-col gap-3">
                  <span className="bg-gray-50 border border-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-full text-sm hover:bg-red-100 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-300"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}