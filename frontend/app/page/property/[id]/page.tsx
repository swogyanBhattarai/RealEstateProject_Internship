'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '../../../components/navbar';
import Footer from '../../../components/footer';
import { 
  Bed, Bath, Square, MapPin, Calendar, Heart, 
  ArrowLeft, ArrowRight, Share2, Phone, Mail, MessageSquare,
  DollarSign, Tag, Wallet
} from 'lucide-react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../../contracts/contract-address.json';

export default function PropertyDetails() {
  const params = useParams();
  const id = Number(params.id);
  
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // New states for token functionality
  const [account, setAccount] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [listings, setListings] = useState<any[]>([]);
  const [listingAmount, setListingAmount] = useState<number>(1);
  const [listingPrice, setListingPrice] = useState<number>(60); 
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      setError('Please install MetaMask to use this feature');
    }
  };
  
  // Fetch property datas
  useEffect(() => {
    const fetchProperty = async () => {
      console.log("Starting to fetch property with ID:", id);
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          provider
        );
  
        try {
          // Get all properties from the contract
          console.log("Calling getProperties from contract...");
          const [propertyAddresses, values, tokenAddresses, propertyImageURLs] = await contract.getProperties();
          console.log("Properties fetched:", {
            propertyAddresses,
            values,
            tokenAddresses,
            propertyImageURLs
          });
          
          // Check if the property with the given ID exists
          if (!propertyAddresses || id >= propertyAddresses.length) {
            console.log("Property not found for ID:", id);
            setProperty(null);
            return;
          }
          
          // Get the specific property data using the ID
          const propertyAddress = propertyAddresses[id];
          const value = values[id];
          const tokenAddress = tokenAddresses[id];
          const images = propertyImageURLs[id] || [];
          
          console.log("Property data for ID", id, ":", {
            propertyAddress,
            value: Number(ethers.formatUnits(value, 18)), // Convert BigInt to number
            tokenAddress,
            images
          });
          
          // Format the property data to match the expected structure
          const formattedProperty = {
            title: propertyAddress || `Property ${id + 1}`,
            description: "A beautiful property available for investment through blockchain technology. This property has been tokenized to allow fractional ownership.",
            price: Number(ethers.formatUnits(value, 18)), // Convert BigInt to number
            bedrooms: 3, // Default values since these aren't stored in the contract
            bathrooms: 2,
            area: 1500,
            address: propertyAddress || "",
            city: "City", // These could be parsed from the address if formatted consistently
            state: "State",
            zipCode: "",
            propertyType: "Apartment",
            apartmentType: "",
            amenities: ["Parking", "Security", "Garden"],
            // Use the actual images from the blockchain or fallback to defaults
            images: images.length > 0 
              ? images.map((img: string) => img.startsWith('http') ? img : `https://gateway.pinata.cloud/ipfs/${img}`)
              : ["/imageforLanding/house.jpg", "/imageforLanding/house2.jpg", "/imageforLanding/house3.jpg"],
            yearBuilt: 2020,
            featured: true,
            tokenAddress: tokenAddress,
            totalTokens: Math.floor(Number(ethers.formatUnits(value, 18)) / 50) // Ensure this is a number, not BigInt
          };
          
          console.log("Formatted property:", formattedProperty);
          setProperty(formattedProperty);
          
          // Get listings for this property
          console.log("Fetching listings for property ID:", id);
          const propertyListings = await contract.getListings(id);
          console.log("Raw listings:", propertyListings);
          
          // Convert BigInt values in listings to regular numbers
          const formattedListings = propertyListings.map((listing: any) => ({
            seller: listing.seller,
            tokenAmount: Number(listing.tokenAmount),
            pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18))
          }));
          console.log("Formatted listings:", formattedListings);
          setListings(formattedListings);
          
          // Check if user is connected and get their balance
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address); // Use .address property instead of toString()
            console.log("Connected account:", accounts[0]);
            
            // Get user's token balance if they're connected
            if (tokenAddress) {
              const tokenContract = new ethers.Contract(
                tokenAddress,
                PropertyTokenABI,
                provider
              );
              
              const balance = await tokenContract.balanceOf(accounts[0]);
              const decimals = await tokenContract.decimals();
              // Use ethers.formatUnits for proper BigInt conversion
              const userTokenBalance = Number(ethers.formatUnits(balance, decimals));
              console.log("User token balance:", userTokenBalance);
              setUserBalance(userTokenBalance);
              
              // Also get how many tokens they bought from the initial sale
              const tokensBought = await contract.getBuyerInfo(id, accounts[0]);
              // Convert BigInt to string before logging
              console.log('Tokens bought from initial sale:', tokensBought.toString());
            }
          }
        } catch (error) {
          console.error('Error fetching property:', error);
          setProperty(null);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("Ethereum provider not available");
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, account, success]);
  
  // Buy tokens from initial sale
  const buyTokens = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (tokenAmount <= 0) {
      setError('Please enter a valid token amount');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // Calculate cost in ETH (assuming $50 per token as per contract)
      const costPerToken = 50;
      const totalCostUSD = tokenAmount * costPerToken;
      
      // For demo purposes, using a fixed ETH price. In production, use an oracle
      const ethPriceUSD = 2000; // 1 ETH = $2000
      const costInEth = totalCostUSD / ethPriceUSD;
      
      // Convert to wei
      const costInWei = ethers.parseEther(costInEth.toString());
      
      // Call the buyFromSale function (not buyTokens as per contract)
      const tx = await contract.buyFromSale(id, tokenAmount, {
        value: costInWei
      });
      
      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens!`);
      
      // Refresh user balance
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(balance) / (10 ** decimals));
      
    } catch (error: any) {
      console.error('Error buying tokens:', error);
      setError(error.message || 'Failed to buy tokens. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Create a new listing
  const createListing = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (listingAmount <= 0) {
      setError('Please enter a valid token amount');
      return;
    }
    
    if (listingPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (listingAmount > userBalance) {
      setError('You don\'t have enough tokens');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      
      console.log("Creating contract instance with address:", contractAddress.RealEstateTokenFactory);
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // First approve the contract to transfer tokens
      console.log("Creating token contract instance with address:", property.tokenAddress);
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        signer
      );
      
      const decimals = await tokenContract.decimals();
      console.log("Token decimals:", decimals);
      const tokenAmountWithDecimals = BigInt(listingAmount) * BigInt(10 ** decimals);
      console.log("Token amount with decimals:", tokenAmountWithDecimals.toString());
      
      // Approve tokens
      console.log("Approving tokens for transfer to:", contractAddress.RealEstateTokenFactory);
      const approveTx = await tokenContract.approve(
        contractAddress.RealEstateTokenFactory,
        tokenAmountWithDecimals
      );
      console.log("Approval transaction sent:", approveTx.hash);
      await approveTx.wait();
      console.log("Approval transaction confirmed");
      
      // Create the listing
      console.log("Converting price to wei:", listingPrice);
      const ethPriceUSD = 2000; // 1 ETH = $2000
      const priceInEth = listingPrice / ethPriceUSD;
      const priceInWei = ethers.parseEther(priceInEth.toString());
      console.log("Price in wei:", priceInWei.toString());
      
      console.log("Listing for sale with params:", {
        propertyId: id,
        tokenAmount: listingAmount,
        priceInWei: priceInWei.toString()
      });
      
      const tx = await contract.listForSale(id, listingAmount, priceInWei);
      console.log("Listing transaction sent:", tx.hash);
      await tx.wait();
      console.log("Listing transaction confirmed");
      
      setSuccess('Listing created successfully!');
      
      // Refresh listings
      console.log("Refreshing listings");
      const propertyListings = await contract.getListings(id);
      setListings(propertyListings);
      
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setError(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Buy tokens from a listing 
  const buyFromListingDirect = async (listingIndex: number) => { 
    if (!account) { 
      setError('Please connect your wallet first'); 
      return; 
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // Get the listing details
      const listing = listings[listingIndex];
      const tokenAmount = listing.tokenAmount;
      const pricePerToken = ethers.formatUnits(listing.pricePerToken, 18);
      const totalCost = Number(tokenAmount) * Number(pricePerToken);
      
      // For demo purposes, using a fixed ETH price. In production, use an oracle
      const ethPriceUSD = 2000; // 1 ETH = $2000
      const costInEth = totalCost / ethPriceUSD;
      
      // Convert to wei
      const costInWei = ethers.parseEther(costInEth.toString());
      
      // Call the buyFromListing function
      const tx = await contract.buyFromListing(id, listingIndex, {
        value: costInWei
      });
      
      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens from listing!`);
      
      // Refresh user balance
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(balance) / (10 ** decimals));
      
    } catch (error: any) {
      console.error('Error buying from listing:', error);
      setError(error.message || 'Failed to buy from listing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // List tokens for sale
  const listTokensForSale = async () => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (listingAmount <= 0) {
      setError('Please enter a valid token amount');
      return;
    }
    
    if (listingPrice <= 0) {
      setError('Please enter a valid price per token');
      return;
    }
    
    if (listingAmount > userBalance) {
      setError(`You only have ${userBalance} tokens available to list`);
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // First approve the factory contract to transfer tokens
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        signer
      );
      
      // Get token decimals
      const decimals = await tokenContract.decimals();
      const tokenAmount = BigInt(listingAmount) * BigInt(10 ** decimals);
      
      // Approve the factory contract to transfer tokens
      const approveTx = await tokenContract.approve(
        contractAddress.RealEstateTokenFactory,
        tokenAmount
      );
      
      await approveTx.wait();
      
      // Convert price to wei (18 decimals)
      const priceInWei = ethers.parseEther(listingPrice.toString());
      
      // List tokens for sale
      const tx = await contract.listForSale(id, listingAmount, priceInWei);
      await tx.wait();
      
      setSuccess(`Successfully listed ${listingAmount} tokens for sale at $${listingPrice} each!`);
      setListingAmount(1);
      setListingPrice(60);
      
    } catch (error: any) {
      console.error('Error listing tokens for sale:', error);
      setError(error.message || 'Failed to list tokens for sale. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Buy tokens from a listing
  const buyFromListing = async (listingIndex: number) => {
    if (!account) {
      setError('Please connect your wallet first');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // Get the listing details
      const listing = listings[listingIndex];
      const tokenAmount = listing.tokenAmount;
      const pricePerToken = ethers.formatUnits(listing.pricePerToken, 18);
      const totalCost = Number(tokenAmount) * Number(pricePerToken);
      
      // For demo purposes, using a fixed ETH price. In production, use an oracle
      const ethPriceUSD = 2000; // 1 ETH = $2000
      const costInEth = totalCost / ethPriceUSD;
      
      // Convert to wei
      const costInWei = ethers.parseEther(costInEth.toString());
      
      // Call the buyFromListing function
      const tx = await contract.buyFromListing(id, listingIndex, {
        value: costInWei
      });
      
      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens from listing!`);
      
      // Refresh user balance
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(balance) / (10 ** decimals));
      
    } catch (error: any) {
      console.error('Error buying from listing:', error);
      setError(error.message || 'Failed to buy from listing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle image navigation
  const nextImage = () => {
    if (property && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  // Format ETH price
  const formatEthPrice = (priceWei: bigint) => {
    const ethPrice = Number(priceWei) / 1e18;
    return `${ethPrice.toFixed(6)} ETH`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-medium text-white mb-2">Property not found</h3>
            <p className="text-gray-400 mb-4">The property you're looking for doesn't exist or has been removed.</p>
            <Link href="/page/buy" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Back to Properties
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black text-gray-300">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/page/buy" className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Link>
          </div>
          
          {/* Property header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.address}</span>
              </div>
              {property.tokenAddress && (
                <div className="text-sm text-gray-400 mt-1">
                  Token Address: {property.tokenAddress.slice(0, 10)}...{property.tokenAddress.slice(-8)}
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <span className="text-3xl font-bold text-white mr-4">{formatPrice(property.price)}</span>
              <button 
                onClick={toggleFavorite}
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
              <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors ml-2">
                <Share2 className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
          
          {/* Property images */}
          <div className="mb-8 relative">
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={property.images[currentImageIndex]}
                alt={property.title}
                fill
                className="object-cover"
              />
              
              {/* Image navigation buttons */}
              {property.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft className="h-5 w-15 text-white" />
                  </button>
                  <button 
                    onClick={nextImage}
                    disabled={currentImageIndex === property.images.length - 1}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    <ArrowRight className="h-5 w-15 text-white" />
                  </button>
                </>
              )}
              
              {/* Image counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
              
              {property.featured && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>
            
            {/* Thumbnail navigation */}
            {property.images.length > 1 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
                {property.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 ${
                      currentImageIndex === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Property details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="md:col-span-2">
              {/* Key details */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Property Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Bed className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Bedrooms</span>
                    <span className="text-lg font-semibold text-white">
                      {property.bedrooms === 0 ? 'Studio' : property.bedrooms}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Bath className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Bathrooms</span>
                    <span className="text-lg font-semibold text-white">{property.bathrooms}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Square className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Area</span>
                    <span className="text-lg font-semibold text-white">{property.area} sqft</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-400 mb-2" />
                    <span className="text-sm text-gray-300">Year Built</span>
                    <span className="text-lg font-semibold text-white">{property.yearBuilt}</span>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">{property.description}</p>
              </div>
              
              {/* Amenities */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Location */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
                <div className="bg-gray-700 h-64 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Map will be integrated here</p>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="md:col-span-1">
              {/* Contact form */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6 sticky top-24">
                <h2 className="text-xl font-semibold text-white mb-4">Contact Agent</h2>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-700 rounded-full mr-3 flex items-center justify-center">
                    <span className="text-blue-500 font-bold">BA</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">BlocAdobe Agent</h3>
                    <p className="text-gray-400 text-sm">Real Estate Professional</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-300">
                    <Phone className="h-4 w-4 mr-2 text-blue-400" />
                    <span>(123) 456-7890</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Mail className="h-4 w-4 mr-2 text-blue-400" />
                    <span>agent@blocadobe.com</span>
                  </div>
                </div>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
                      placeholder="I'm interested in this property..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );

}