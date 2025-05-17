import React, { useState, useEffect } from 'react';
import { DollarSign, Wallet, Info, AlertCircle, Check } from 'lucide-react';
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
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [ethPrice, setEthPrice] = useState<number>(2000); // Default ETH price in USD
  
  // Calculate token price based on property value and total tokens
  const tokenPrice = property ? property.price : 50; // Default $50 per token
  const totalTokens = property ? Math.floor(property.price / 50) : 0;
  
  // Fetch user's token balance
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!account || !property || propertyId === undefined) return;
      
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
      }
    };
    
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
      const contract = new ethers.Contract(
        contractAddress.RealEstateTokenFactory,
        RealEstateTokenFactoryABI,
        signer
      );
      
      // Calculate cost in ETH (wei)
      const totalCostUSD = tokenAmount * tokenPrice;
      const costInEth = totalCostUSD / ethPrice;
      const totalCost = ethers.parseEther(costInEth.toString());
      
      // Call the buyFromSale function with the correct parameters
      const tx = await contract.buyFromSale(
        propertyId,
        tokenAmount,
        { value: totalCost }
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      setTransactionHash(receipt.hash);
      
      // Update user balance after successful purchase
      const newBalance = await contract.getBuyerInfo(propertyId, account);
      setUserBalance(Number(newBalance));
      
    } catch (err: any) {
      console.error("Error buying tokens:", err);
      setError(err.message || "Failed to purchase tokens. Please try again.");
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
                <span>Your Balance: {userBalance} tokens</span>
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
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-md text-sm text-red-300">
              {error}
            </div>
          )}
          
          {transactionHash && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-800/50 rounded-md text-sm flex items-start gap-2">
              <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-300 font-medium">Purchase successful!</p>
                <p className="text-gray-400 text-xs mt-1 break-all">
                  Transaction: {transactionHash}
                </p>
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
            {isProcessing ? 'Processing...' : `Buy ${tokenAmount} Tokens`}
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