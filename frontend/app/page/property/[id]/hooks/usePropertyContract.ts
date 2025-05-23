<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../../../contracts/contract-address.json';
import { formatImageUrl} from '../../../../components/utils/imageUtils';
=======
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import RealEstateTokenFactoryABI from "../../../../../contracts/RealEstateTokenFactoryABI.json";
import PropertyTokenABI from "../../../../../contracts/PropertyTokenABI.json";
import contractAddress from "../../../../../contracts/contract-address.json";
import { formatImageUrl } from "../../../../components/utils/imageUtils";
>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91

export const usePropertyContract = (propertyId: number) => {
  const [account, setAccount] = useState<string>("");
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [listings, setListings] = useState<any[]>([]);
<<<<<<< HEAD
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
=======
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [listingAmount, setListingAmount] = useState<number>(1);
  const [listingPrice, setListingPrice] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
<<<<<<< HEAD
  
=======

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        return accounts[0];
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setError("Failed to connect wallet");
        return "";
      }
    } else {
      setError("Please install MetaMask to use this feature");
      return "";
    }
  };

  // Fetch property data
  const fetchProperty = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
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
      const [propertyAddresses, values, tokenAddresses, propertyImageURLs] =
        await contract.getProperties();

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
        description:
          "A beautiful property available for investment through blockchain technology. This property has been tokenized to allow fractional ownership.",
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
<<<<<<< HEAD
        images: images.length > 0 
          ? images.map((img: string) => formatImageUrl(img))
          : ["/imageforLanding/house.jpg", "/imageforLanding/house2.jpg", "/imageforLanding/house3.jpg"],
=======
        images:
          images.length > 0
            ? images.map((img: string) => formatImageUrl(img))
            : [
                "/imageforLanding/house.jpg",
                "/imageforLanding/house2.jpg",
                "/imageforLanding/house3.jpg",
              ],
>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
        yearBuilt: 2020,
        featured: true,
        tokenAddress: tokenAddress,
        totalTokens: Math.floor(Number(ethers.formatUnits(value, 18)) / 50),
      };

      setProperty(formattedProperty);

      // Get listings for this property
      const propertyListings = await contract.getListings(propertyId);

      // Convert BigInt values in listings to regular numbers
      const formattedListings = propertyListings.map((listing: any) => ({
        seller: listing.seller,
        tokenAmount: Number(listing.tokenAmount),
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18)),
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
          const formattedBalance = Number(
            ethers.formatUnits(tokenBalance, decimals)
          );

          // Use the higher of the two balances
          balance = Math.max(balance, formattedBalance);
        }

        setUserBalance(balance);
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };
<<<<<<< HEAD
  
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
      
=======

  // Buy tokens from initial sale
  const buyTokens = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (tokenAmount <= 0) {
      setError("Please enter a valid token amount");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
<<<<<<< HEAD
      
      // Calculate cost in ETH (assuming $50 per token as per contract)
      const costPerToken = 50;
      const totalCostUSD = tokenAmount * costPerToken;
      
      // For demo purposes, using a fixed ETH price. In production, use an oracle
      const ethPriceUSD = 2000; // 1 ETH = $2000
      const costInEth = totalCostUSD / ethPriceUSD;
      
      // Convert to wei
      const costInWei = ethers.parseEther(costInEth.toString());
      
      // Call the buyFromSale function
      const tx = await contract.buyFromSale(propertyId, tokenAmount, {
        value: costInWei
      });
      
      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens!`);
      
=======

      // Calculate cost in ETH
      if (!property || property.totalTokens <= 0) {
        setError("Property data is incomplete or invalid for purchase.");
        setIsProcessing(false);
        return;
      }

      const costPerToken = property.price / property.totalTokens; // Use dynamic price

      const totalCostUSD = tokenAmount * costPerToken;

      const ethPriceUSD = 2000; // 1 ETH = $2000. This should ideally be fetched dynamically.
      const costInEth = totalCostUSD / ethPriceUSD;

      // Convert to wei
      const costInEthWithBuffer = costInEth * 1.01; // 1% buffer
      const costInWei = ethers.parseEther(costInEthWithBuffer.toFixed(18)); // Use toFixed for precision

      // Call the buyFromSale function
      const tx = await contract.buyFromSale(propertyId, tokenAmount, {
        value: costInWei,
      });

      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens!`);

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      // Refresh user balance
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
<<<<<<< HEAD
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(ethers.formatUnits(balance, decimals)));
      
    } catch (error: any) {
      console.error('Error buying tokens:', error);
      setError(error.message || 'Failed to buy tokens. Please try again.');
=======

      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(ethers.formatUnits(balance, decimals)));
    } catch (error: any) {
      console.error("Error buying tokens:", error);
      setError(error.message || "Failed to buy tokens. Please try again.");
>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
    } finally {
      setIsProcessing(false);
    }
  };
<<<<<<< HEAD
  
  // Create a listing to sell tokens
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
      
=======

  // Create a listing to sell tokens
  const createListing = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    if (listingAmount <= 0) {
      setError("Please enter a valid token amount");
      return;
    }

    if (listingPrice <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (listingAmount > userBalance) {
      setError("You don't have enough tokens");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
<<<<<<< HEAD
      
=======

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      // First approve the contract to transfer tokens
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        signer
      );
<<<<<<< HEAD
      
      const decimals = await tokenContract.decimals();
      
   
=======

      const decimals = await tokenContract.decimals();

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      const base = BigInt(10);
      const exponent = BigInt(decimals);
      const multiplier = base ** exponent;
      const tokenAmountWithDecimals = BigInt(listingAmount) * multiplier;
<<<<<<< HEAD
      
=======

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      // Approve tokens
      const approveTx = await tokenContract.approve(
        contractAddress.RealEstateTokenFactory,
        tokenAmountWithDecimals
      );
      await approveTx.wait();
<<<<<<< HEAD
      
      // Create the listing
      const ethPriceUSD = 2000; 
      const priceInEth = listingPrice / ethPriceUSD;
      const priceInWei = ethers.parseEther(priceInEth.toString());
      
      const tx = await contract.listForSale(propertyId, listingAmount, priceInWei);
      await tx.wait();
      
      setSuccess('Listing created successfully!');
      
      // Refresh listings
      const propertyListings = await contract.getListings(propertyId);
      
=======

      // Create the listing
      const ethPriceUSD = 2000;
      const priceInEth = listingPrice / ethPriceUSD;
      const priceInWei = ethers.parseEther(priceInEth.toString());

      const tx = await contract.listForSale(
        propertyId,
        listingAmount,
        priceInWei
      );
      await tx.wait();

      setSuccess("Listing created successfully!");

      // Refresh listings
      const propertyListings = await contract.getListings(propertyId);

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      // Convert BigInt values in listings to regular numbers
      const formattedListings = propertyListings.map((listing: any) => ({
        seller: listing.seller,
        tokenAmount: Number(listing.tokenAmount),
<<<<<<< HEAD
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18))
      }));
      
      setListings(formattedListings);
      
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setError(error.message || 'Failed to create listing. Please try again.');
=======
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18)),
      }));

      setListings(formattedListings);
    } catch (error: any) {
      console.error("Error creating listing:", error);
      setError(error.message || "Failed to create listing. Please try again.");
>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
    } finally {
      setIsProcessing(false);
    }
  };
<<<<<<< HEAD
  
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
      
=======

  // Buy tokens from a listing
  const buyFromListing = async (listingIndex: number) => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    setError("");
    setSuccess("");

    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      );
      const signer = await provider.getSigner();

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
<<<<<<< HEAD
      
=======

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      // Get the listing details
      const listing = listings[listingIndex];
      const tokenAmount = listing.tokenAmount;
      const pricePerToken = listing.pricePerToken;
      const totalCost = Number(tokenAmount) * Number(pricePerToken);
<<<<<<< HEAD
      
      // For demo purposes, using a fixed ETH price. In production, use an oracle
      const ethPriceUSD = 2000; // 1 ETH = $2000
      const costInEth = totalCost / ethPriceUSD;
      
      // Convert to wei
      const costInWei = ethers.parseEther(costInEth.toString());
      
      // Call the buyFromListing function
      const tx = await contract.buyFromListing(propertyId, listingIndex, {
        value: costInWei
      });
      
      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens from listing!`);
      
=======

      // For demo purposes, using a fixed ETH price. In production, use an oracle
      const ethPriceUSD = 2000; // 1 ETH = $2000
      const costInEth = totalCost / ethPriceUSD;

      // Convert to wei
      const costInWei = ethers.parseEther(costInEth.toString());

      // Call the buyFromListing function
      const tx = await contract.buyFromListing(propertyId, listingIndex, {
        value: costInWei,
      });

      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens from listing!`);

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
      // Refresh user balance
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
<<<<<<< HEAD
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(ethers.formatUnits(balance, decimals)));
      
      // Refresh listings
      const propertyListings = await contract.getListings(propertyId);
      setListings(propertyListings);
      
    } catch (error: any) {
      console.error('Error buying from listing:', error);
      setError(error.message || 'Failed to buy from listing. Please try again.');
=======

      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(ethers.formatUnits(balance, decimals)));

      // Refresh listings
      const propertyListings = await contract.getListings(propertyId);
      setListings(propertyListings);
    } catch (error: any) {
      console.error("Error buying from listing:", error);
      setError(
        error.message || "Failed to buy from listing. Please try again."
      );
>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
    } finally {
      setIsProcessing(false);
    }
  };
<<<<<<< HEAD
  
=======

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
  // Cancel a listing
  const cancelListing = async (listingIndex: number) => {
    // This would require a contract function to cancel listings
    // For now, we'll just show an error
<<<<<<< HEAD
    setError('Cancelling listings is not implemented in the current contract');
  };
  
=======
    setError("Cancelling listings is not implemented in the current contract");
  };

>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
  // Initialize data
  useEffect(() => {
    fetchProperty();

    // Setup event listener for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount("");
        }
      });
    }

    return () => {
      // Cleanup event listeners
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
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
    tokenAmount,
    setTokenAmount,
    listingAmount,
    setListingAmount,
    listingPrice,
    setListingPrice,
    isProcessing,
    setError,
    setSuccess,
    connectWallet,
    fetchProperty,
    buyTokens,
    createListing,
    buyFromListing,
<<<<<<< HEAD
    cancelListing
=======
    cancelListing,
>>>>>>> c483766da4f027b8aa24db5c2534ee709ab4ca91
  };
};
