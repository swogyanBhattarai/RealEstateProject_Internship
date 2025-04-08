'use client';
import { useState, useEffect } from 'react';

export function useWallet() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Check for existing connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      // Check if user manually disconnected
      const isDisconnected = localStorage.getItem('walletDisconnected') === 'true';
      
      if (isDisconnected) {
        return; // Don't auto-connect if user disconnected
      }

      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          }) as string[];
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            localStorage.removeItem('walletDisconnected'); // Clear disconnected state
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        setIsConnecting(true);
        localStorage.removeItem('walletDisconnected'); // Clear disconnected state

        // Force MetaMask popup
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }]
        });
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        }) as string[];
        
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("Error connecting wallet:", err);
        if (err instanceof Error) {
          alert(`Error connecting wallet: ${err.message}`);
        }
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask not found. Please install it or enable it for this site.");
    }
  };
  
  const disconnectWallet = () => {
    setAccount(null);
    localStorage.setItem('walletDisconnected', 'true'); // Remember disconnected state
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          const isDisconnected = localStorage.getItem('walletDisconnected') === 'true';
          if (!isDisconnected) {
            setAccount(accounts[0]);
          }
        } else {
          setAccount(null);
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  return { account, connectWallet, disconnectWallet, isConnecting };
}
