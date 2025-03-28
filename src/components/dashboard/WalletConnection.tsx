"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, ExternalLink, Plus } from 'lucide-react';
import { shortenAddress } from '@/utils/formatters';
import WalletDetailsModal from './WalletDetailsModal';

const cryptoOptions = [
  { value: 'btc', label: 'BTC - Bitcoin' },
  { value: 'eth', label: 'ETH - Ethereum' },
  { value: 'bch', label: 'BCH - Bitcoin Cash' },
  { value: 'usdc', label: 'USDC - USD Coin' },
  { value: 'usdt', label: 'USDT - Tether' }
];

const WalletConnection = () => {
  const { wallets, connecting, connectWallet, error } = useWallet();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrypto || !walletAddress) {
      alert("Please select a cryptocurrency and enter a wallet address");
      return;
    }
    
    try {
      // Get the label for the selected crypto
      const crypto = cryptoOptions.find(c => c.value === selectedCrypto);
      
      await connectWallet({
        type: selectedCrypto,
        address: walletAddress,
        name: crypto?.label || selectedCrypto
      });
      
      // Reset form
      setSelectedCrypto('');
      setWalletAddress('');
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding wallet:", error);
    }
  };

  const openWalletDetails = (wallet: any) => {
    setSelectedWallet(wallet);
  };

  const closeWalletDetails = () => {
    setSelectedWallet(null);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Wallet Connection</CardTitle>
        <CardDescription>Add your cryptocurrency wallet addresses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {wallets.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Connected Wallets</h3>
            {wallets.map((wallet, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg bg-dark-900 border border-dark-700 cursor-pointer hover:border-primary-500/50 transition-colors"
                onClick={() => openWalletDetails(wallet)}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-primary-500/10 rounded-full mr-3">
                    <Wallet className="h-4 w-4 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{wallet.name}</p>
                    <p className="text-xs text-gray-400">{shortenAddress(wallet.address)}</p>
                  </div>
                </div>
                <a 
                  href={`https://etherscan.io/address/${wallet.address}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-dark-700 mx-auto flex items-center justify-center mb-4">
              <Wallet className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No wallets connected</h3>
            <p className="text-gray-400 mb-4">Add your cryptocurrency wallet addresses to get started.</p>
          </div>
        )}
        
        {!showAddForm ? (
          <Button 
            onClick={() => setShowAddForm(true)}
            variant="secondary"
            leftIcon={<Plus className="h-4 w-4" />}
            fullWidth
          >
            Add Cryptocurrency Wallet
          </Button>
        ) : (
          <Card className="border border-dark-700">
            <CardContent className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-medium text-white mb-2">Add Crypto Wallet</h3>
                
                <Dropdown
                  label="Cryptocurrency"
                  options={cryptoOptions}
                  value={selectedCrypto}
                  onChange={setSelectedCrypto}
                  placeholder="Select cryptocurrency"
                />
                
                <Input
                  label="Wallet Address"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
                
                {error && <p className="text-sm text-red-500">{error}</p>}
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setShowAddForm(false)}
                    className="w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    isLoading={connecting}
                    className="w-1/2"
                  >
                    Add Wallet
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <p className="text-xs text-gray-500 pt-2">
          <span className="inline-flex items-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 mr-1 text-primary-500 fill-current">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
            </svg>
            Your keys, your crypto. We never store wallet credentials.
          </span>
        </p>

        {/* Wallet Details Modal */}
        {selectedWallet && (
          <WalletDetailsModal
            wallet={selectedWallet}
            onClose={closeWalletDetails}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnection;