import { ethers } from "ethers";
import RealEstateTokenFactoryABI from '../../../contracts/RealEstateTokenFactoryABI.json';
import PropertyTokenABI from '../../../contracts/PropertyTokenABI.json';
import contractAddress from '../../../contracts/contract-address.json'
import axios from "axios";

const PINATA_API_KEY = "f5151a020e32a782a73e";
const PINATA_SECRET_API_KEY = "d2fd4c05e87d7ff481eb8cb45272f01427726658e8e2644114b8082a596b5008";

// ABI for RealEstateTokenFactory contract
const factoryABI = RealEstateTokenFactoryABI.abi;

// ABI for PropertyToken contract
const tokenABI = PropertyTokenABI.abi;
// Contract address for RealEstateTokenFactory contract
const FACTORY_CONTRACT_ADDRESS = contractAddress.RealEstateTokenFactory;

// Get contract instance
export const getFactoryContract = async (needSigner = false) => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not available");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);

  if (needSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, signer);
  }

  return new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, provider);
};

// Get token contract instance
export const getTokenContract = async (tokenAddress, needSigner = false) => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not available");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  if (needSigner) {
    const signer = await provider.getSigner();
    return new ethers.Contract(tokenAddress, tokenABI, signer);
  }

  return new ethers.Contract(tokenAddress, tokenABI, provider);
};

// Get all properties
export const getAllProperties = async () => {
  try {
    const contract = await getFactoryContract();
    const properties = await contract.getProperties();

    return properties.map((property, index) => ({
      id: index,
      address: property.propertyAddress,
      value: ethers.formatUnits(property.value, 0),
      tokenAddress: property.tokenAddress,
    }));
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
};

// Buy tokens from initial sale
export const buyTokensFromSale = async (propertyId, tokenAmount) => {
  try {
    const contract = await getFactoryContract(true);

    // Calculate cost (50 USD per token in wei)
    const costPerToken = ethers.parseEther("50");
    const totalCost = costPerToken * BigInt(tokenAmount);

    const tx = await contract.buyFromSale(propertyId, tokenAmount, {
      value: totalCost,
    });

    return await tx.wait();
  } catch (error) {
    console.error("Error buying tokens:", error);
    throw error;
  }
};

// Get user token balance
export const getUserTokenBalance = async (propertyId, userAddress) => {
  try {
    const contract = await getFactoryContract();
    const properties = await contract.getProperties();

    if (propertyId >= properties.length) {
      throw new Error("Invalid property ID");
    }

    const tokenAddress = properties[propertyId].tokenAddress;
    const tokenContract = await getTokenContract(tokenAddress);

    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();

    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};

// Get current user address
export const getCurrentUserAddress = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Ethereum provider not available");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return await signer.getAddress();
};

// List tokens for sale from profile page
export const listTokensForSaleFromProfile = async (propertyId, tokenAmount, pricePerToken) => {
  try {
    if (!tokenAmount || tokenAmount <= 0) {
      throw new Error("Token amount must be greater than 0");
    }
    
    if (!pricePerToken || pricePerToken <= 0) {
      throw new Error("Price per token must be greater than 0");
    }
    
    const contract = await getFactoryContract(true);
    
    // Convert price to wei (assuming price is in USD)
    const priceInWei = ethers.parseEther(pricePerToken.toString());
    
    // Get token contract to approve transfer
    const properties = await contract.getProperties();
    const tokenAddress = properties[3][propertyId]; // Access tokenAddresses from the returned array
    const tokenContract = await getTokenContract(tokenAddress, true);
    
    // Approve the factory contract to transfer tokens
    const approvalAmount = BigInt(tokenAmount) * BigInt(10 ** 18); // Assuming 18 decimals
    await tokenContract.approve(FACTORY_CONTRACT_ADDRESS, approvalAmount);
    
    // Call the listForSale function
    const tx = await contract.listForSale(propertyId, tokenAmount, priceInWei);
    
    // Wait for transaction to be mined
    return await tx.wait();
  } catch (error) {
    console.error("Error listing tokens for sale:", error);
    throw error;
  }
};

// Buy tokens from a listing
export const buyTokensFromListing = async (propertyId, listingIndex) => {
  try {
    const contract = await getFactoryContract(true);
    const listings = await contract.getListings(propertyId);
    const listing = listings[listingIndex];
    
    // In ethers v6, we need to handle BigInt differently
    const tokenAmount = BigInt(listing.tokenAmount);
    const pricePerToken = listing.pricePerToken;
    const totalCost = tokenAmount * pricePerToken;

    const tx = await contract.buyFromListing(propertyId, listingIndex, {
      value: totalCost,
    });
    return await tx.wait();
  } catch (error) {
    console.error("Error buying tokens from listing:", error);
    throw error;
  }
};

// Fetch active listings for a property
export const getActiveListings = async (propertyId) => {
  try {
    const contract = await getFactoryContract();
    const listings = await contract.getListings(propertyId);

    return listings.map((listing, index) => ({
      id: index,
      seller: listing.seller,
      tokenAmount: listing.tokenAmount,
      pricePerToken: ethers.formatEther(listing.pricePerToken),
    }));
  } catch (error) {
    console.error("Error fetching active listings:", error);
    throw error;
  }
};

// Fetch buyers for a property
export const getPropertyBuyers = async (propertyId) => {
  try {
    const contract = await getFactoryContract();
    return await contract.getBuyers(propertyId);
  } catch (error) {
    console.error("Error fetching property buyers:", error);
    throw error;
  }
};

// Fetch buyer information
export const getBuyerInfo = async (propertyId, userAddress) => {
  try {
    const contract = await getFactoryContract();
    const tokensBought = await contract.getBuyerInfo(propertyId, userAddress);
    return ethers.formatUnits(tokensBought, 0);
  } catch (error) {
    console.error("Error fetching buyer info:", error);
    throw error;
  }
};

// Update the uploadToIPFS function to handle both single files and arrays
export const uploadToIPFS = async (files) => {
  try {
    // Convert to array if a single file is passed
    const fileArray = Array.isArray(files) ? files : [files];
    console.log('Files to upload to IPFS:', fileArray);

    // Create FormData for Pinata API
    const formData = new FormData();
    fileArray.forEach((file) => {
      formData.append('file', file);
    });

    // Upload to Pinata
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxContentLength: "Infinity",
        headers: {
          "Content-Type": `multipart/form-data;`,
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    // Return the IPFS hash
    return `${res.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};
// Fetch featured properties
export const getFeaturedProperties = async (limit = 3) => {
  try {
    const allProperties = await getAllProperties();
    
    // Sort properties by some criteria (e.g., value) and take the top ones
    const sortedProperties = allProperties.sort((a, b) => 
      parseInt(b.value) - parseInt(a.value)
    );
    
    return sortedProperties.slice(0, limit);
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    throw error;
  }
};

// Unified function to list tokens for sale from any page
export const listTokensForSale = async (propertyId, tokenAmount, pricePerToken) => {
  try {
    if (!tokenAmount || tokenAmount <= 0) {
      throw new Error("Token amount must be greater than 0");
    }
    
    if (!pricePerToken || pricePerToken <= 0) {
      throw new Error("Price per token must be greater than 0");
    }
    
    const contract = await getFactoryContract(true);
    
    // Get property details to find token address
    const properties = await contract.getProperties();
    if (propertyId >= properties[0].length) {
      throw new Error("Invalid property ID");
    }
    
    const tokenAddress = properties[2][propertyId]; // Access tokenAddresses from the returned array
    
    // Get token contract
    const tokenContract = await getTokenContract(tokenAddress, true);
    
    // Convert price to wei (assuming price is in USD)
    const priceInWei = ethers.parseEther(pricePerToken.toString());
    
    // Get token decimals
    const decimals = await tokenContract.decimals();
    
    // Calculate token amount in smallest units
    const tokenAmountWithDecimals = BigInt(tokenAmount) * BigInt(10 ** decimals);
    
    // Approve the factory contract to transfer tokens
    await tokenContract.approve(FACTORY_CONTRACT_ADDRESS, tokenAmountWithDecimals);
    
    // Call the listForSale function
    const tx = await contract.listForSale(propertyId, tokenAmount, priceInWei);
    
    // Wait for transaction to be mined
    return await tx.wait();
  } catch (error) {
    console.error("Error listing tokens for sale:", error);
    throw error;
  }
};
