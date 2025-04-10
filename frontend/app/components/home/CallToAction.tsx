import React from 'react';

export default function CallToAction() {
  return (
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
  );
}