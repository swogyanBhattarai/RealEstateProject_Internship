import React from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Share2 } from 'lucide-react';

interface PropertyImageGalleryProps {
  images: string[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({
  images,
  currentImageIndex,
  setCurrentImageIndex
}) => {
  const nextImage = () => {
    setCurrentImageIndex((currentImageIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((currentImageIndex - 1 + images.length) % images.length);
  };

  const shareProperty = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this property',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="relative mb-8 group">
      <div className="relative h-[500px] w-full rounded-lg overflow-hidden border border-gray-800 shadow-lg shadow-blue-900/20">
        {images && images.length > 0 ? (
          <Image
            src={images[currentImageIndex]}
            alt={`Property image ${currentImageIndex + 1}`}
            fill
            style={{ objectFit: 'cover' }}
            priority
            className="transition-all duration-700 ease-in-out transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-gray-400">No images available</p>
          </div>
        )}
      </div>
      
      {images && images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={prevImage}
            className="bg-black/70 text-white p-3 rounded-full shadow-md hover:bg-black/90 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <button 
            onClick={nextImage}
            className="bg-black/70 text-white p-3 rounded-full shadow-md hover:bg-black/90 transition-all"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      )}
      
      <button 
        onClick={shareProperty}
        className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-full shadow-md hover:bg-black/90 transition-all"
      >
        <Share2 size={20} />
      </button>
      
      {images && images.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-blue-500 scale-125' : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;