'use client';
import React, { useState } from 'react';
import Navbar from '../../components/navbar'; 
import Footer from '../../components/footer'; 
import { Camera, Check, AlertCircle, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { ethers } from 'ethers';
import contractAddress from '../../../contracts/contract-address.json';
// import PropertyTokenABI from '../../../contracts/PropertyTokenABI.json';
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import { uploadToIPFS } from  '../../components/utils/contractInteraction'


export default function SellPage() {
  // Form state
  const [formData, setFormData] = useState({
    propertyType: 'apartment',
    apartmentType: '',
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    yearBuilt: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    amenities: [] as string[],
  });

  // Image upload state
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [ipfsHashes, setIpfsHashes] = useState<string[]>([]); // Store IPFS hashes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Step navigation state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Available apartment types
  const apartmentTypes = [
    'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom', '4+ Bedroom',
    'Loft', 'Duplex', 'Penthouse'
  ];

  // Available amenities for apartments
  const availableAmenities = [
    'Swimming Pool', 'Gym', 'Elevator', 'Parking', 'Security System',
    'Balcony', 'Air Conditioning', 'Heating', 'Laundry Room', 'Storage Room',
    'Pet Friendly', 'Furnished', 'Wheelchair Access', 'Concierge Service'
  ];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on change
    validateField(name, value);
  };

  // Handle input blur for validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Validate a single field
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    
    // Clear previous error for this field
    delete newErrors[name];
    
    // Validation rules based on field name
    switch (name) {
      case 'apartmentType':
        if (!value) newErrors[name] = 'Apartment type is required';
        break;
      case 'title':
        if (!value) newErrors[name] = 'Title is required';
        else if (value.length < 5) newErrors[name] = 'Title must be at least 5 characters';
        break;
      case 'description':
        if (!value) newErrors[name] = 'Description is required';
        else if (value.length < 20) newErrors[name] = 'Description must be at least 20 characters';
        break;
      case 'price':
        if (!value) newErrors[name] = 'Price is required';
        else if (isNaN(Number(value)) || Number(value) <= 0) newErrors[name] = 'Price must be a positive number';
        break;
      case 'bedrooms':
        if (!value) newErrors[name] = 'Number of bedrooms is required';
        else if (isNaN(Number(value)) || Number(value) < 0) newErrors[name] = 'Bedrooms must be a non-negative number';
        break;
      case 'bathrooms':
        if (!value) newErrors[name] = 'Number of bathrooms is required';
        else if (isNaN(Number(value)) || Number(value) < 0) newErrors[name] = 'Bathrooms must be a non-negative number';
        break;
      case 'area':
        if (!value) newErrors[name] = 'Area is required';
        else if (isNaN(Number(value)) || Number(value) <= 0) newErrors[name] = 'Area must be a positive number';
        break;
      case 'address':
        if (!value) newErrors[name] = 'Address is required';
        break;
      case 'city':
        if (!value) newErrors[name] = 'City is required';
        break;
      case 'state':
        if (!value) newErrors[name] = 'State is required';
        break;
      case 'zipCode':
        if (!value) newErrors[name] = 'ZIP code is required';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newTouched: Record<string, boolean> = { ...touched };
    
    // Fields to validate for each step
    const stepFields: Record<number, string[]> = {
      1: ['apartmentType', 'title', 'description', 'price'],
      2: ['bedrooms', 'bathrooms', 'area'],
      3: ['address', 'city', 'state', 'zipCode'],
      4: [] // No required fields in step 4
    };
    
    // Validate all fields for the current step
    stepFields[step].forEach(field => {
      newTouched[field] = true;
      const value = formData[field as keyof typeof formData]?.toString() || '';
      if (!validateField(field, value)) {
        isValid = false;
        // Re-validate to populate errors
        validateField(field, value);
      }
    });
    
    setTouched(newTouched);
    return isValid;
  };
  // Handle amenity selection
  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => {
      const updatedAmenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity];

      return { ...prev, amenities: updatedAmenities };
    });
  };

  // Limit image uploads to 5
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      if (images.length + newFiles.length > 5) {
        alert('You can only upload up to 5 images.');
        return;
      }

      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

      setImages(prev => [...prev, ...newFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
      
      // Clear any image-related errors when images are uploaded
      if (errors.images) {
        setErrors(prev => {
          const newErrors = {...prev};
          delete newErrors.images;
          return newErrors;
        });
      }
      
      // Reset error status if it was related to images
      if (submitStatus === 'error') {
        setSubmitStatus('idle');
      }
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));

    // Also remove the IPFS hash if it exists
    if (ipfsHashes.length > index) {
      setIpfsHashes(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Navigation functions
  const nextStep = () => {
    // Validate current step before proceeding
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        // Reset any submission error when navigating between steps
        if (submitStatus === 'error') {
          setSubmitStatus('idle');
        }
        window.scrollTo(0, 0);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Reset any submission error when navigating between steps
      if (submitStatus === 'error') {
        setSubmitStatus('idle');
      }
      window.scrollTo(0, 0);
    }
  };

  // When submitting the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setErrors(prev => ({ ...prev, images: 'At least one image is required' }));
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Upload images to IPFS first
      const imageHashes = await Promise.all(
        images.map(image => uploadToIPFS(image))
      );
      
      setIpfsHashes(imageHashes);
      
      // Connect to Ethereum
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Create contract instance
        const contract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          signer
        );
        
        // Format the property address
        const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`;
        
        // Convert price to wei (assuming price is in USD)
        const priceInWei = ethers.parseUnits(formData.price, 18);
        
        // Call the addProperty function with only the 4 required parameters
        const tx = await contract.addProperty(
          fullAddress,                      // propertyAddress
          priceInWei,                       // valueUSD
          await signer.getAddress(),        // originalOwner
          imageHashes                       // propertyImageURLs
        );
        
        await tx.wait();
        setSubmitStatus('success');
      }
    } catch (error) {
      console.error('Error submitting property:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this line to ensure handleSubmit is properly bound to the component
  const onSubmit = handleSubmit;

  // Render progress bar
  const renderProgressBar = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${index < currentStep ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
                  ${index + 1 === currentStep 
                    ? 'bg-blue-600 text-white' 
                    : index + 1 < currentStep 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-200 text-gray-500'}`}
              >
                {index + 1 < currentStep ? '✓' : index + 1}
              </div>
              <span className="text-xs">
                {index === 0 ? 'Basic Info' : 
                 index === 1 ? 'Details' : 
                 index === 2 ? 'Location' : 'Images & Amenities'}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Helper function to show error message
  const renderError = (fieldName: string) => {
    if (touched[fieldName] && errors[fieldName]) {
      return (
        <div className="text-red-500 text-sm mt-1 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {errors[fieldName]}
        </div>
      );
    }
    return null;
  };

  // Render form steps
  const renderFormStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="apartmentType" className="block text-sm font-medium text-gray-700 mb-1">
                  Apartment Type*
                </label>
                <select
                  id="apartmentType"
                  name="apartmentType"
                  value={formData.apartmentType}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-4 py-2 border ${touched.apartmentType && errors.apartmentType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900`}
                >
                  <option value="">Select Apartment Type</option>
                  {apartmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {renderError('apartmentType')}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g. Modern Downtown Apartment"
                  className={`w-full px-4 py-2 border ${touched.title && errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('title')}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  rows={4}
                  placeholder="Describe your apartment in detail..."
                  className={`w-full px-4 py-2 border ${touched.description && errors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('description')}
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (USD)*
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  placeholder="e.g. 450000"
                  className={`w-full px-4 py-2 border ${touched.price && errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('price')}
              </div>

              <div>
                <label htmlFor="yearBuilt" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Built
                </label>
                <input
                  type="number"
                  id="yearBuilt"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="e.g. 2010"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Apartment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms*
                </label>
                <input
                  type="number"
                  id="bedrooms"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  placeholder="e.g. 2"
                  className={`w-full px-4 py-2 border ${touched.bedrooms && errors.bedrooms ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('bedrooms')}
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms*
                </label>
                <input
                  type="number"
                  id="bathrooms"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  step="0.5"
                  placeholder="e.g. 1.5"
                  className={`w-full px-4 py-2 border ${touched.bathrooms && errors.bathrooms ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('bathrooms')}
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                  Area (sq ft)*
                </label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  min="0"
                  placeholder="e.g. 1200"
                  className={`w-full px-4 py-2 border ${touched.area && errors.area ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('area')}
              </div>

              <div>
                <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Number
                </label>
                <input
                  type="number"
                  id="floor"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="e.g. 3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="totalFloors" className="block text-sm font-medium text-gray-700 mb-1">
                  Total Floors in Building
                </label>
                <input
                  type="number"
                  id="totalFloors"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="e.g. 10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address*
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g. 123 Main Street, Apt 4B"
                  className={`w-full px-4 py-2 border ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('address')}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City*
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g. San Francisco"
                  className={`w-full px-4 py-2 border ${touched.city && errors.city ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('city')}
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province*
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g. California"
                  className={`w-full px-4 py-2 border ${touched.state && errors.state ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('state')}
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP/Postal Code*
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g. 94105"
                  className={`w-full px-4 py-2 border ${touched.zipCode && errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400`}
                />
                {renderError('zipCode')}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities & Images</h2>
            
            {/* Amenities section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`amenity-${amenity}`} className="ml-2 text-sm text-gray-700">
                      {amenity}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Image upload section */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Property Images</h3>
              <p className="text-sm text-gray-500 mb-4">Upload up to 5 images of your property. The first image will be used as the main image.</p>
              
              {/* Display error message for images */}
              {errors.images && (
                <div className="text-red-500 text-sm mb-3 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {errors.images}
                </div>
              )}
              
              {/* Image upload button */}
              <div className="mb-4">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5 images)</p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {/* Image previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-32 w-full rounded-lg overflow-hidden">
                        <Image
                          src={url}
                          alt={`Property image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          Main Image
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  // Render navigation buttons
  const renderNavButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </button>
        ) : (
          <div></div>
        )}
        
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => {
              const isValid = validateStep(currentStep);
              if (isValid) {
                nextStep();
              } else {
                window.scrollTo(0, 0);
              }
            }}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isSubmitting}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Listing'}
            {isSubmitting ? null : <Check className="ml-2 h-4 w-4" />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-gray-300">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">List Your Apartment</h1>
            <p className="mt-4 text-lg text-gray-400">
              Complete the form below to list your apartment on our platform
            </p>
          </div>

          {submitStatus === 'success' && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <Check className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-green-800 font-medium">Apartment Listed Successfully!</h3>
                {/* <p className="text-green-700 mt-1">Your apartment has been submitted for review. We will notify you once it live.</p> */}
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-medium">Submission Failed</h3>
                <p className="text-red-700 mt-1">There was an error submitting your apartment. Please try again.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 md:p-8 text-gray-900">
            {renderProgressBar()}
            
            {/* Display validation errors at the top of the form */}
            {Object.keys(errors).length > 0 && Object.keys(errors).some(key => touched[key]) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="text-red-500 mr-2 h-5 w-5" />
                  <h3 className="text-red-800 font-medium">Please fix the following errors:</h3>
                </div>
                <ul className="list-disc pl-5 text-red-700 text-sm">
                  {Object.keys(errors)
                    .filter(key => touched[key])
                    .map(key => (
                      <li key={key}>{errors[key]}</li>
                    ))}
                </ul>
              </div>
            )}
            
            {renderFormStep()}
            {renderNavButtons()}
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}