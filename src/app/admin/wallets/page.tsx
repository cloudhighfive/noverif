// src/app/admin/wallets/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Search, Filter, Wallet, ExternalLink, User } from 'lucide-react';
import { collection, getDocs, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate, shortenAddress } from '@/utils/formatters';

export default function WalletsAdmin() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoFilter, setCryptoFilter] = useState('all');
  
  const cryptoOptions = [
    { value: 'all', label: 'All Cryptocurrencies' },
    { value: 'btc', label: 'Bitcoin (BTC)' },
    { value: 'eth', label: 'Ethereum (ETH)' },
    { value: 'bch', label: 'Bitcoin Cash (BCH)' },
    { value: 'usdc', label: 'USD Coin (USDC)' },
    { value: 'usdt', label: 'Tether (USDT)' }
  ];
  
  useEffect(() => {
    fetchWallets();
  }, [cryptoFilter]);
  
  const fetchWallets = async () => {
    try {
      setLoading(true);
      
      // Get all users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      // Extract all wallets from users
      let allWallets: any[] = [];
      
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        const userId = doc.id;
        const userWallets = userData.wallets || [];
        
        userWallets.forEach((wallet: any) => {
          allWallets.push({
            ...wallet,
            userId,
            userName: userData.name,
            userEmail: userData.email
          });
        });
      });
      
      // Filter by crypto type if needed
      if (cryptoFilter !== 'all') {
        allWallets = allWallets.filter(wallet => wallet.type === cryptoFilter);
      }
      
      // Sort by most recent first
      allWallets.sort((a, b) => {
        const dateA = a.connectedAt ? a.connectedAt.toDate().getTime() : 0;
        const dateB = b.connectedAt ? b.connectedAt.toDate().getTime() : 0;
        return dateB - dateA;
      });
      
      setWallets(allWallets);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      setLoading(false);
    }
  };
  
  const filteredWallets = wallets.filter(wallet => {
    const matchesSearch = 
      (wallet.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (wallet.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (wallet.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (wallet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    return matchesSearch;
  });
  
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
        return '$';  // Fixed: added the closing quote
      case 'usdt':
        return '$';  // Fixed: added the closing quote
      default:
        return '₿';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">Crypto Wallets</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search wallets by address or user..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Dropdown
                options={cryptoOptions}
                value={cryptoFilter}
                onChange={setCryptoFilter}
                placeholder="Filter by cryptocurrency"
              />
            </div>
            <Button 
              variant="secondary"
              leftIcon={<Filter size={16} />}
              onClick={fetchWallets}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading wallets...</p>
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">No wallets found</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Wallets ({filteredWallets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Type</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Address</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Connected On</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredWallets.map((wallet, index) => {
                    const blockExplorerUrl = getBlockExplorerUrl(wallet.type, wallet.address);
                    
                    return (
                      <tr key={index} className="hover:bg-dark-800">
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full bg-${wallet.type === 'btc' ? 'yellow' : wallet.type === 'eth' ? 'purple' : 'blue'}-500/10 flex items-center justify-center mr-3`}>
                              <span className={`text-${wallet.type === 'btc' ? 'yellow' : wallet.type === 'eth' ? 'purple' : 'blue'}-500`}>
                                {getCryptoIcon(wallet.type)}
                              </span>
                            </div>
                            <span className="text-white">{wallet.name || wallet.type.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-300 font-mono">{shortenAddress(wallet.address, 8)}</span>
                            <button 
                              className="ml-2 text-gray-400 hover:text-white p-1"
                              onClick={() => {
                                navigator.clipboard.writeText(wallet.address);
                                alert('Address copied to clipboard');
                              }}
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4"
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center mr-3">
                              <User size={16} className="text-primary-500" />
                            </div>
                            <div>
                              <p className="text-white text-sm">{wallet.userName || 'Unknown'}</p>
                              <p className="text-xs text-gray-400">{wallet.userEmail || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-300">
                          {wallet.connectedAt ? formatDate(wallet.connectedAt.toDate()) : 'Unknown'}
                        </td>
                        <td className="p-4">
                          <div className="flex space-x-2">
                            <a
                              href={blockExplorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
                            >
                              <ExternalLink size={14} className="mr-1" />
                              Explorer
                            </a>
                            <a
                              href={`/admin/users?id=${wallet.userId}`}
                              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md bg-dark-700 text-gray-300 hover:bg-dark-600 transition-colors"
                            >
                              <User size={14} className="mr-1" />
                              User
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}