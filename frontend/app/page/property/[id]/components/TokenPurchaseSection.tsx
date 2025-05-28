import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, Info, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';
import RealEstateTokenFactoryABI from '../../../../../contracts/RealEstateTokenFactoryABI.json';
import contractAddress from '../../../../../contracts/contract-address.json';
import PropertyTokenABI from '../../../../../contracts/PropertyTokenABI.json';

interface TokenPurchaseSectionProps {
  property: any;
  propertyId: number;
  account: string | null;
  connectWallet: () => Promise<void>;
}

const TokenPurchaseSection: React.FC<TokenPurchaseSectionProps> = ({
  property,
  propertyId,
  account,
  connectWallet
}) => {
  // State variables
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(2000); // Default ETH price in USD
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [tokenPrice, setTokenPrice] = useState<number>(50); // Default price per token is $50
  const [totalTokens, setTotalTokens] = useState<number>(0);
  
  // Fixed token price in ETH as defined in the smart contract
  const tokenPriceInEth = 50; // 50 ETH per token
  
  // Calculate USD price based on current ETH price
  const tokenPriceInUsd = tokenPriceInEth * ethPrice;
  const totalCostInEth = tokenPriceInEth * tokenAmount;
  const totalCostInUsd = tokenPriceInUsd * tokenAmount;
  
  // Fetch ETH price
  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        // Try CoinGecko API first with updated options
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0',  // Adding a user agent can help with some API restrictions
          },
          cache: 'no-store',
          // Add timeout to prevent long hanging requests
          signal: AbortSignal.timeout(5000)
        });
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data && data.ethereum && data.ethereum.usd) {
          setEthPrice(data.ethereum.usd);
          console.log("Successfully fetched ETH price:", data.ethereum.usd);
        } else {
          // Try alternative API if CoinGecko format is unexpected
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        console.error("Error fetching ETH price from CoinGecko:", err);
        
        // Try alternative API as backup
        try {
          const altResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', {
            signal: AbortSignal.timeout(5000)
          });
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData && altData.price) {
              const price = parseFloat(altData.price);
              setEthPrice(price);
              console.log("Successfully fetched ETH price from Binance:", price);
              return;
            }
          }
          // If we get here, both APIs failed
          console.log("Using fallback ETH price of $2000");
        } catch (altErr) {
          console.error("Error fetching ETH price from alternative source:", altErr);
          console.log("Using fallback ETH price of $2000");
        }
      }
    };
    
    fetchEthPrice();
    
    // Set up a retry mechanism that tries again after 5 seconds if the first attempt fails
    const retryTimeout = setTimeout(() => {
      // Only retry if we're still using the default price
      if (ethPrice === 2000) {
        console.log("Retrying ETH price fetch...");
        fetchEthPrice();
      }
    }, 5000);
    
    return () => clearTimeout(retryTimeout);
  }, []);
  
  // Add this useEffect to fetch the token price and total tokens
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!property || propertyId === undefined) return;
      
      try {
        const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
        if (!provider) return;
        
        const contract = new ethers.Contract(
          contractAddress.RealEstateTokenFactory,
          RealEstateTokenFactoryABI,
          provider
        );
        
        // Get property details
        const properties = await contract.getProperties();
        if (propertyId < properties[0].length) {
          // Set token price (assuming $50 per token as default from the contract)
          setTokenPrice(50);
          
          // Calculate total tokens based on property value
          const propertyValue = Number(ethers.formatUnits(properties[1][propertyId], 18));
          const calculatedTotalTokens = Math.floor(propertyValue / 50);
          setTotalTokens(calculatedTotalTokens);
        }
      } catch (err) {
        console.error("Error fetching token details:", err);
      }
    };
    
    fetchTokenDetails();
  }, [property, propertyId]);
  
  // Fetch user's token balance
  const fetchUserBalance = async () => {
    if (!account || !property || propertyId === undefined) return;
    
    setIsLoadingBalance(true);
    
    try {
      const provider = window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null;
      if (!provider) return;
      
      // First check if the user has tokens from initial purchase
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        provider
      );
      
      const buyerInfo = await contract.getBuyerInfo(propertyId, account);
      let balance = Number(buyerInfo);
      
      // Then check token balance from the token contract
      if (property.tokenAddress) {
        const tokenContract = new ethers.Contract(
          property.tokenAddress,
          PropertyTokenABI,
          provider
        );
        
        const tokenBalance = await tokenContract.balanceOf(account);
        const decimals = await tokenContract.decimals();
        const formattedBalance = Number(ethers.formatUnits(tokenBalance, decimals));
        
        // Use the higher of the two balances
        balance = Math.max(balance, formattedBalance);
      }
      
      setUserBalance(balance);
    } catch (err) {
      console.error("Error fetching user balance:", err);
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  useEffect(() => {
    fetchUserBalance();
  }, [account, property, propertyId, transactionHash]);
  
  // Buy tokens function
  const buyTokens = async () => {
    if (!account || !property || tokenAmount <= 0 || propertyId === undefined) return;
    
    setIsProcessing(true);
    setError(null);
    
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
      
      // Calculate cost exactly as the contract expects
      // 50 ETH per token converted to wei (10^18)
      const tokenPriceWei = ethers.parseUnits(tokenPriceInEth.toString(), 18);
      const totalCost = tokenPriceWei * BigInt(tokenAmount);
      
      console.log(`Buying ${tokenAmount} tokens for property #${propertyId}`);
      console.log(`Total cost: ${ethers.formatEther(totalCost)} ETH (approx. $${totalCostInUsd.toLocaleString()})`);
      
      // Call the buyFromSale function
      const tx = await contract.buyFromSale(propertyId, tokenAmount, {
        value: totalCost
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      setTransactionHash(receipt.hash);
      setSuccess(`Successfully purchased ${tokenAmount} tokens for ${ethers.formatEther(totalCost)} ETH`);
      
      
      // Create notification for the purchase
      try {
        // Get property owner address from the contract
        const propertyOwner = await contract.getPropertyOwner(propertyId);
        
        // Create notification data
        const notificationData = {
          type: 'purchase',
          propertyId: propertyId,
          tokenAmount: tokenAmount,
          buyerAddress: account,
          totalCost: ethers.formatEther(totalCost),
          timestamp: new Date().toISOString(),
          propertyAddress: property.address || "Property #" + propertyId,
          transactionHash: receipt.hash
        };
        
        // Store notification in localStorage for the property owner
        const allNotifications = JSON.parse(localStorage.getItem('propertyNotifications') || '{}');
        
        if (!allNotifications[propertyOwner]) {
          allNotifications[propertyOwner] = [];
        }
        
        allNotifications[propertyOwner].push(notificationData);
        localStorage.setItem('propertyNotifications', JSON.stringify(allNotifications));
        
        console.log(`Notification sent to property owner ${propertyOwner}:`, notificationData);
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the whole transaction if notification creation fails
      }
      
      // Reset token amount
      setTokenAmount(1);
      
      // Refresh user balance
      fetchUserBalance();
    } catch (err) {
      console.error("Error buying tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to buy tokens. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!property) return null;
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg mb-8 border border-gray-800 shadow-lg shadow-blue-900/10 text-white">
      <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
        <span>Invest in This Property</span>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-400 hover:text-blue-300"
        >
          <Info size={18} />
        </button>
      </h2>
      
      {showInfo && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-md text-sm">
          <p className="text-gray-300">
            When you purchase tokens, you're buying partial ownership of this property. 
            Each token represents a fraction of the property's value. You can later sell 
            these tokens on the marketplace to other investors.
          </p>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-gray-300 mb-2">
          This property has been tokenized into {totalTokens} tokens.
          Each token represents partial ownership of the property.
        </p>
        <div className="flex items-center gap-2 text-blue-400">
          <DollarSign size={20} />
          <span className="font-semibold">${tokenPrice.toFixed(2)} per token</span>
        </div>
        
        {/* Add indicator for fallback ETH price */}
        {ethPrice === 2000 && (
          <div className="mt-2 text-xs flex items-center gap-1 text-yellow-400">
            <AlertCircle size={14} />
            <span>Using estimated ETH price ($2000). Live price unavailable.</span>
          </div>
        )}
      </div>
      
      {account ? (
        <>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tokenAmount" className="font-medium text-gray-300">
                Number of Tokens
              </label>
              <div className="text-sm text-gray-400 flex items-center gap-1">
                <Wallet size={16} />
                <span>
                  Your Balance: {isLoadingBalance ? (
                    <RefreshCw size={14} className="inline animate-spin ml-1" />
                  ) : (
                    `${userBalance} tokens`
                  )}
                </span>
                <button 
                  onClick={fetchUserBalance}
                  className="ml-1 text-blue-400 hover:text-blue-300"
                  disabled={isLoadingBalance}
                >
                  <RefreshCw size={14} className={isLoadingBalance ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                id="tokenAmount"
                min="1"
                max={totalTokens}
                value={tokenAmount}
                onChange={(e) => setTokenAmount(Number(e.target.value))}
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
              />
              <button
                onClick={() => setTokenAmount(1)}
                className="px-3 py-2 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
              >
                Min
              </button>
              <button
                onClick={() => setTokenAmount(10)}
                className="px-3 py-2 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
              >
                10
              </button>
              <button
                onClick={() => setTokenAmount(Math.min(totalTokens, 100))}
                className="px-3 py-2 bg-gray-700 rounded-md text-sm text-gray-300 hover:bg-gray-600"
              >
                Max
              </button>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gray-800 rounded-md border border-gray-700">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-300">Cost for {tokenAmount} tokens</span>
              <span className="font-semibold text-blue-400">
                ${(tokenAmount * tokenPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2 text-sm text-gray-400">
              <span>Estimated ETH:</span>
              <span>{((tokenAmount * tokenPrice) / ethPrice).toFixed(6)} ETH</span>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-md text-sm flex items-start gap-2">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-300">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-800/50 rounded-md text-sm flex items-start gap-2">
              <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-green-300">{success}</p>
            </div>
          )}
          
          {transactionHash && (
            <div className="mb-4 p-3 bg-gray-800 rounded-md text-xs flex items-start gap-2">
              <div className="w-full">
                <p className="text-gray-400 mb-1">Transaction Hash:</p>
                <div className="flex items-center justify-between">
                  <code className="text-blue-300 break-all">{transactionHash}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(transactionHash);
                      alert("Transaction hash copied to clipboard!");
                    }}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    Copy
                  </button>
                </div>
                <a
                  href={`https://etherscan.io/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 mt-2 inline-block"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          )}
          
          <button
            onClick={buyTokens}
            disabled={isProcessing || tokenAmount <= 0}
            className={`w-full py-3 rounded-md font-medium transition-all duration-300 ${
              isProcessing || tokenAmount <= 0
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <RefreshCw size={18} className="animate-spin mr-2" />
                Processing Transaction...
              </span>
            ) : (
              `Buy ${tokenAmount} Tokens for $${(tokenAmount * tokenPrice).toFixed(2)}`
            )}
          </button>
          
          <div className="mt-3 text-xs text-gray-400 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <p>
              Token purchases are final and non-refundable. The value of tokens may fluctuate 
              based on market conditions. Please invest responsibly.
            </p>
          </div>
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-md font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-300"
        >
          Connect Wallet to Invest
        </button>
      )}
    </div>
  );
};

export default TokenPurchaseSection;