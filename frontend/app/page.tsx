'use client';
import React from 'react';
import Navbar from './components/navbar';
import Footer from './components/footer';
import HeroSection from './components/home/HeroSection';
import FeaturedProperties from './components/home/FeaturedProperties';
import ServicesSection from './components/home/ServicesSection';
import CallToAction from './components/home/CallToAction';
import TestimonialsSection from './components/home/TestimonialsSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />
      <FeaturedProperties />
      <ServicesSection />
      <CallToAction />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}