// src/components/dashboard/WalletDetailsModal.tsx
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Wallet, Copy, Check, ExternalLink, X } from 'lucide-react';
import { shortenAddress } from '@/utils/formatters';
import { useState } from 'react';

interface WalletDetailsModalProps {
  wallet: {
    type: string;
    address: string;
    name: string;
    connectedAt?: Date;
  };
  onClose: () => void;
}

const WalletDetailsModal: React.FC<WalletDetailsModalProps> = ({ wallet, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getBlockExplorerUrl = (type: string, address: string) => {
    switch (type.toLowerCase()) {
      case 'btc':
        return `https://blockstream.info/address/${address}`;
      case 'eth':
      case 'usdc':
      case 'usdt':
        return `https://etherscan.io/address/${address}`;
      case 'bch':
        return `https://blockchair.com/bitcoin-cash/address/${address}`;
      default:
        return `https://etherscan.io/address/${address}`;
    }
  };

  const getCryptoIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'btc':
        return '₿';
      case 'eth':
        return 'Ξ';
      case 'bch':
        return '₿';
      case 'usdc':
        return '$';
      case 'usdt':
        return '$';
      default:
        return '₿';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="relative">
          <CardTitle>Wallet Details</CardTitle>
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary-500/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-primary-500">
                {getCryptoIcon(wallet.type)}
              </span>
            </div>
            <h3 className="text-xl font-medium text-white">{wallet.name}</h3>
            <p className="text-sm text-gray-400">{wallet.type.toUpperCase()}</p>
          </div>
          
          <div className="rounded-lg bg-dark-900 p-3 border border-dark-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Address</span>
              <button 
                onClick={handleCopy}
                className="text-primary-500 hover:text-primary-400 text-sm flex items-center"
              >
                {copied ? "Copied!" : "Copy"}
                {copied ? <Check className="h-3 w-3 ml-1" /> : <Copy className="h-3 w-3 ml-1" />}
              </button>
            </div>
            <p className="text-white text-sm break-all font-mono">{wallet.address}</p>
          </div>
          
          {wallet.connectedAt && (
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Connected on: {wallet.connectedAt.toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="secondary" 
            onClick={onClose}
          >
            Close
          </Button>
          <a 
            href={getBlockExplorerUrl(wallet.type, wallet.address)} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button 
              variant="outline" 
              rightIcon={<ExternalLink size={16} />}
            >
              View on Explorer
            </Button>
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WalletDetailsModal;