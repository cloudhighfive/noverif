// src/hooks/useWallet.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { connectWallet as firebaseConnectWallet } from '@/lib/firebase';

export function useWallet() {
  const { user, userData } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userData && userData.wallets) {
      setWallets(userData.wallets);
    } else {
      setWallets([]);
    }
  }, [userData]);

  // Simplified wallet connection function - just adds the provided wallet info
  const connectWallet = async (walletInfo: { type: string; address: string; name: string }) => {
    if (!user) {
      setError("You must be logged in to add a wallet");
      return;
    }
    
    setConnecting(true);
    setError(null);
    
    try {
      // Validate wallet address format (basic validation)
      if (!isValidWalletAddress(walletInfo.type, walletInfo.address)) {
        throw new Error("Invalid wallet address format");
      }
      
      // Check if wallet already exists
      const walletExists = wallets.some(wallet => 
        wallet.address.toLowerCase() === walletInfo.address.toLowerCase()
      );
      
      if (walletExists) {
        throw new Error("This wallet address is already connected");
      }
      
      // Create wallet object
      const wallet = {
        type: walletInfo.type,
        address: walletInfo.address,
        name: walletInfo.name
      };
      
      // Save to Firebase
      await firebaseConnectWallet(user.uid, wallet);
      
      // Update local state
      setWallets([...wallets, wallet]);
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      setError(error.message);
    } finally {
      setConnecting(false);
    }
  };
  
  // Basic wallet address validation
  const isValidWalletAddress = (type: string, address: string): boolean => {
    // This is a simplified validation - in a real app, you'd want more robust validation
    if (!address || address.trim() === '') return false;
    
    switch (type.toLowerCase()) {
      case 'btc':
        // Basic Bitcoin address validation (starts with 1, 3, or bc1)
        return /^(1|3|bc1)[a-zA-Z0-9]{25,42}$/.test(address);
      case 'eth':
      case 'usdc':
      case 'usdt':
        // Basic Ethereum address validation (0x followed by 40 hex characters)
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      default:
        // For other cryptocurrencies, just check minimum length
        return address.length >= 26;
    }
  };

  return {
    wallets,
    connecting,
    error,
    connectWallet
  };
}