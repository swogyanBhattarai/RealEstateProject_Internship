import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../../../contracts/contract-address.json';

export const usePropertyContract = (propertyId: number) => {
  const [account, setAccount] = useState<string>('');
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        return accounts[0];
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError('Failed to connect wallet');
        return '';
      }
    } else {
      setError('Please install MetaMask to use this feature');
      return '';
    }
  };
  
  // Fetch property data
  const fetchProperty = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setLoading(false);
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        provider
      );
      
      // Get all properties from the contract
      const [propertyAddresses, values, tokenAddresses, propertyImageURLs] = await contract.getProperties();
      
      // Check if the property with the given ID exists
      if (!propertyAddresses || propertyId >= propertyAddresses.length) {
        setProperty(null);
        setLoading(false);
        return;
      }
      
      // Get the specific property data using the ID
      const propertyAddress = propertyAddresses[propertyId];
      const value = values[propertyId];
      const tokenAddress = tokenAddresses[propertyId];
      const images = propertyImageURLs[propertyId] || [];
      
      // Format the property data
      const formattedProperty = {
        title: propertyAddress || `Property ${propertyId + 1}`,
        description: "A beautiful property available for investment through blockchain technology. This property has been tokenized to allow fractional ownership.",
        price: Number(ethers.formatUnits(value, 18)),
        bedrooms: 3,
        bathrooms: 2,
        area: 1500,
        address: propertyAddress || "",
        city: "City",
        state: "State",
        zipCode: "",
        propertyType: "Apartment",
        apartmentType: "",
        amenities: ["Parking", "Security", "Garden"],
        images: images.length > 0 
          ? images.map((img: string) => img.startsWith('http') ? img : `https://gateway.pinata.cloud/ipfs/${img}`)
          : ["/imageforLanding/house.jpg", "/imageforLanding/house2.jpg", "/imageforLanding/house3.jpg"],
        yearBuilt: 2020,
        featured: true,
        tokenAddress: tokenAddress,
        totalTokens: Math.floor(Number(ethers.formatUnits(value, 18)) / 50)
      };
      
      setProperty(formattedProperty);
      
      // Get listings for this property
      const propertyListings = await contract.getListings(propertyId);
      
      // Convert BigInt values in listings to regular numbers
      const formattedListings = propertyListings.map((listing: any) => ({
        seller: listing.seller,
        tokenAmount: Number(listing.tokenAmount),
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18))
      }));
      
      setListings(formattedListings);
      
      // Check if user is connected and get their balance
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const userAccount = accounts[0].address;
        setAccount(userAccount);
        
        // First check if the user has tokens from initial purchase
        const buyerInfo = await contract.getBuyerInfo(propertyId, userAccount);
        let balance = Number(buyerInfo);
        
        // Then check token balance from the token contract
        if (tokenAddress) {
          const tokenContract = new ethers.Contract(
            tokenAddress,
            PropertyTokenABI,
            provider
          );
          
          const tokenBalance = await tokenContract.balanceOf(userAccount);
          const decimals = await tokenContract.decimals();
          const formattedBalance = Number(ethers.formatUnits(tokenBalance, decimals));
          
          // Use the higher of the two balances
          balance = Math.max(balance, formattedBalance);
        }
        
        setUserBalance(balance);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize data
  useEffect(() => {
    fetchProperty();
    
    // Setup event listener for account changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
        }
      });
    }
    
    return () => {
      // Cleanup event listeners
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, [propertyId]);
  
  return {
    account,
    property,
    loading,
    userBalance,
    listings,
    error,
    success,
    setError,
    setSuccess,
    connectWallet,
    fetchProperty
  };
};