import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../../../contracts/contract-address.json';
import { formatImageUrl} from '../../../../components/utils/imageUtils';

export const usePropertyContract = (propertyId: number) => {
  const [account, setAccount] = useState<string>("");
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [listingAmount, setListingAmount] = useState<number>(1);
  const [listingPrice, setListingPrice] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // Add missing ethPrice state
  const [ethPrice, setEthPrice] = useState<number>(2000); // Default ETH price in USD
  // Add tokenPrice calculation
  const tokenPrice = 50; // Default $50 per token
  
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
        images: images.length > 0 
          ? images.map((img: string) => formatImageUrl(img))
          : ["/imageforLanding/house.jpg", "/imageforLanding/house2.jpg", "/imageforLanding/house3.jpg"],
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
  
  // Buy tokens from initial sale
  const buyTokens = async () => {
    if (!account || !property || tokenAmount <= 0 || propertyId === undefined) return;
    
    setIsProcessing(true);
    setError(''); // Changed from null to empty string
    
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) throw new Error("Please install MetaMask to continue");
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // Calculate cost in ETH (wei)
      const totalCostUSD = tokenAmount * tokenPrice;
      
      // Add null check for ethPrice
      if (!ethPrice || ethPrice === 0) {
        throw new Error("ETH price is not available. Please try again later.");
      }
      
      const costInEth = totalCostUSD / ethPrice;
      
      // Validate the calculation result
      if (isNaN(costInEth) || costInEth <= 0) {
        throw new Error("Invalid cost calculation. Please try again.");
      }
      
      // Add a buffer to ensure enough ETH is sent (10% more)
      const costInEthWithBuffer = costInEth * 1.1;
      
      // Convert to wei with more precision
      const totalCost = ethers.parseEther(costInEthWithBuffer.toFixed(18));
      
      // Call the buyFromSale function
      const tx = await contract.buyFromSale(propertyId, tokenAmount, {
        value: totalCost
      });
      
      await tx.wait();
      setSuccess(`Successfully purchased ${tokenAmount} tokens!`);
      
      // Send notification to property owner about the purchase
      try {
        // Get property owner address from the contract
        const propertyOwner = await contract.getPropertyOwner(propertyId);
        
        // Create notification data
        const notificationData = {
          type: 'TOKEN_PURCHASE',
          propertyId: propertyId,
          tokenAmount: tokenAmount,
          buyerAddress: account,
          totalCost: ethers.formatEther(totalCost),
          timestamp: new Date().toISOString(),
        };
        
        // Store notification in local storage for demo purposes
        // In a production app, you would send this to a backend service
        const existingNotifications = JSON.parse(localStorage.getItem('propertyNotifications') || '{}');
        
        // Create arrays for both seller and buyer if they don't exist
        if (!existingNotifications[propertyOwner]) {
          existingNotifications[propertyOwner] = [];
        }
        
        // Add notification for the property owner (seller)
        existingNotifications[propertyOwner].push({
          ...notificationData,
          type: 'PROPERTY_SOLD'
        });
        
        // Also create a notification for the buyer
        if (!existingNotifications[account]) {
          existingNotifications[account] = [];
        }
        
        // Add notification for the buyer with a different type
        existingNotifications[account].push({
          ...notificationData,
          type: 'PROPERTY_PURCHASED'
        });
        
        localStorage.setItem('propertyNotifications', JSON.stringify(existingNotifications));
        
        console.log(`Notification sent to property owner ${propertyOwner} and buyer ${account}`);
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
        // Don't throw error here, as the purchase was successful
      }
      
      // Refresh user balance
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(ethers.formatUnits(balance, decimals)));
      
    } catch (error: any) {
      console.error('Error buying tokens:', error);
      setError(error.message || 'Failed to buy tokens. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
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
      
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // First approve the contract to transfer tokens
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        signer
      );
      
      const decimals = await tokenContract.decimals();
      
   
      const base = BigInt(10);
      const exponent = BigInt(decimals);
      const multiplier = base ** exponent;
      const tokenAmountWithDecimals = BigInt(listingAmount) * multiplier;
      
      // Approve tokens
      const approveTx = await tokenContract.approve(
        contractAddress.RealEstateTokenFactory,
        tokenAmountWithDecimals
      );
      await approveTx.wait();
      
      // Create the listing
      const ethPriceUSD = 2000; 
      const priceInEth = listingPrice / ethPriceUSD;
      const priceInWei = ethers.parseEther(priceInEth.toString());
      
      const tx = await contract.listForSale(propertyId, listingAmount, priceInWei);
      await tx.wait();
      
      setSuccess('Listing created successfully!');
      
      // Refresh listings
      const propertyListings = await contract.getListings(propertyId);
      
      // Convert BigInt values in listings to regular numbers
      const formattedListings = propertyListings.map((listing: any) => ({
        seller: listing.seller,
        tokenAmount: Number(listing.tokenAmount),
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18))
      }));
      
      setListings(formattedListings);
      
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setError(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Buy tokens from a listing
  const buyFromListing = async (listingIndex: number) => {
    if (!account || !property || propertyId === undefined) return;
    
    setIsProcessing(true);
    setError(''); 
    
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) throw new Error("Please install MetaMask to continue");
      const signer = await provider.getSigner();
      
      // Get the factory contract
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // Get the listing details
      const listings = await contract.getListings(propertyId);
      if (listingIndex >= listings.length) {
        throw new Error("Invalid listing index");
      }
      
      const listing = listings[listingIndex];
      const seller = listing.seller;
      const tokenAmount = Number(listing.tokenAmount);
      
      // IMPORTANT: Don't convert the price to a number, keep it as BigInt
      // This is the key fix - we use the raw pricePerToken from the contract
      const totalCost = listing.tokenAmount * listing.pricePerToken;
      
      console.log(`Buying ${tokenAmount} tokens from listing #${listingIndex}`);
      console.log(`Total cost in wei: ${totalCost.toString()}`);
      console.log(`Seller: ${seller}`);
      
      // Call the buyFromListing function with the exact wei amount
      const tx = await contract.buyFromListing(propertyId, listingIndex, {
        value: totalCost
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Display success message to the buyer
      setSuccess(`Successfully purchased ${tokenAmount} tokens from listing #${listingIndex + 1}.`);
      
      // Refresh listings after purchase
      fetchListings();
      
      // Refresh user balance
      fetchUserBalance();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        seller: seller,
        tokenAmount: tokenAmount
      };
    } catch (err) {
      console.error("Error buying from listing:", err);
      setError(err instanceof Error ? err.message : "Failed to buy from listing. Please try again.");
      return { success: false, error: err };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Add missing fetchListings function
  const fetchListings = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        provider
      );
      
      // Get listings for this property
      const propertyListings = await contract.getListings(propertyId);
      
      // Convert BigInt values in listings to regular numbers
      const formattedListings = propertyListings.map((listing: any) => ({
        seller: listing.seller,
        tokenAmount: Number(listing.tokenAmount),
        pricePerToken: Number(ethers.formatUnits(listing.pricePerToken, 18))
      }));
      
      setListings(formattedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  };
  
  // Add missing fetchUserBalance function
  const fetchUserBalance = async () => {
    try {
      if (typeof window === "undefined" || !window.ethereum || !account || !property) return;
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenContract = new ethers.Contract(
        property.tokenAddress,
        PropertyTokenABI,
        provider
      );
      
      const balance = await tokenContract.balanceOf(account);
      const decimals = await tokenContract.decimals();
      setUserBalance(Number(ethers.formatUnits(balance, decimals)));
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };
  
  // Cancel a listing
  const cancelListing = async (listingIndex: number) => {
    // This would require a contract function to cancel listings
    // For now, we'll just show an error
    setError('Cancelling listings is not implemented in the current contract');
  };
  
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
    cancelListing
  };
};
