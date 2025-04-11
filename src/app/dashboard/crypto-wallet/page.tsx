// src/app/dashboard/crypto-wallet/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SessionWarning from '@/components/common/SessionWarning';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, Check, Copy, QrCode, ExternalLink, Info } from 'lucide-react';
import { shortenAddress } from '@/utils/formatters';

export default function CryptoWallet() {
  const { isAuthenticated, loading, sessionExpiring, timeRemaining, resetSession, logout } = useAuth();
  const { wallets, connecting, connectWallet } = useWallet();
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const supportedWallets = [
    { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Connect to your MetaMask wallet' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: '📱', description: 'Connect to your Coinbase Wallet' },
    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', description: 'Connect using WalletConnect protocol' },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="pt-24 pb-12 pl-64">
        <div className="container mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-3xl font-display font-bold mb-2">Crypto Wallet Integration</h1>
            <p className="text-gray-400">
              Connect and manage your crypto wallets securely
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Connected Wallets</CardTitle>
                  <CardDescription>
                    Securely manage your cryptocurrency transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wallets.length > 0 ? (
                    <div className="space-y-4">
                      {wallets.map((wallet, index) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-lg bg-dark-900 border border-dark-700 hover:border-primary-500/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 flex items-center justify-center bg-primary-500/10 rounded-full mr-4">
                                <Wallet className="h-5 w-5 text-primary-500" />
                              </div>
                              <div>
                                <h3 className="text-white font-medium">{wallet.name}</h3>
                                <p className="text-gray-400 text-sm">
                                  {shortenAddress(wallet.address, 6)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(wallet.address);
                                }}
                                className="p-1.5 rounded-full hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
                              >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedWallet(wallet);
                                  setShowQR(true);
                                }}
                                className="p-1.5 rounded-full hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
                              >
                                <QrCode className="h-4 w-4" />
                              </button>
                              <a 
                                href={`https://etherscan.io/address/${wallet.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-full hover:bg-dark-800 text-gray-400 hover:text-white transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto bg-dark-800 rounded-full flex items-center justify-center mb-4">
                        <Wallet className="h-8 w-8 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-medium text-white mb-2">No wallets connected</h3>
                      <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Connect your crypto wallets to begin sending and receiving payments securely.
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <div className="rounded-lg bg-dark-900 p-4 border border-dark-700">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-white mb-1">
                            Your Keys, Your Crypto
                          </h3>
                          <p className="text-xs text-gray-400">
                            NoVerif never stores your wallet credentials or private keys. We connect securely using 
                            read-only APIs to ensure your assets remain under your control at all times.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* <div>
              <Card>
                <CardHeader>
                  <CardTitle>Connect New Wallet</CardTitle>
                  <CardDescription>
                    Add a new cryptocurrency wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {supportedWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      className="w-full p-4 rounded-lg bg-dark-900 border border-dark-700 hover:border-primary-500/50 flex items-center transition-colors"
                      onClick={() => {
                        // Connect using wallet ID - this will generate a simulated wallet
                        // based on the selected wallet type
                        const walletInfo = {
                          type: wallet.id,
                          address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
                          name: wallet.name
                        };
                        connectWallet(walletInfo);
                      }}
                      disabled={connecting}
                    >
                      <span className="text-2xl mr-3">{wallet.icon}</span>
                      <div className="text-left">
                        <h3 className="text-white font-medium">{wallet.name}</h3>
                        <p className="text-sm text-gray-400">{wallet.description}</p>
                      </div>
                    </button>
                  ))}
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-400">
                      Don't see your wallet? We're continuously adding support for more wallets.
                    </p>
                  </div>
                </CardContent>
              </Card> */}
              
              {/* QR Code Scanner Component */}
              {/* <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Scan Wallet QR Code</CardTitle>
                  <CardDescription>
                    Quickly add wallets by scanning a QR code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-square w-full bg-white rounded-lg flex items-center justify-center p-4">
                      <div className="text-center text-dark-900">
                        <QrCode className="h-10 w-10 mx-auto mb-2" />
                        <p className="text-sm">QR scanner will appear here</p>
                      </div>
                    </div>
                    <Button variant="secondary" fullWidth>
                      Start Scanner
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div> */}
          </div>
          
          {/* Wallet Details Modal */}
          {selectedWallet && (
            <div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedWallet(null);
                  setShowQR(false);
                }
              }}
            >
              <Card className="max-w-md w-full relative">
                <CardHeader className="relative">
                  <CardTitle>Wallet Details</CardTitle>
                  <button 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold z-10"
                    onClick={() => {
                      setSelectedWallet(null);
                      setShowQR(false);
                    }}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-primary-500/10 rounded-full flex items-center justify-center mb-4">
                      <Wallet className="h-8 w-8 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white">{selectedWallet.name}</h3>
                  </div>
                  
                  <div className="rounded-lg bg-dark-900 p-3 border border-dark-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-400">Address</span>
                      <button 
                        onClick={() => copyToClipboard(selectedWallet.address)}
                        className="text-primary-500 hover:text-primary-400 text-sm flex items-center"
                      >
                        {copied ? "Copied!" : "Copy"}
                        {copied ? <Check className="h-3 w-3 ml-1" /> : <Copy className="h-3 w-3 ml-1" />}
                      </button>
                    </div>
                    <p className="text-white text-sm break-all font-mono">{selectedWallet.address}</p>
                  </div>
                  
                  {showQR && (
                    <div className="bg-white p-4 rounded-lg">
                      <div className="aspect-square w-full flex items-center justify-center">
                        {/* QR Code would be generated here in a real implementation */}
                        <div className="grid grid-cols-6 grid-rows-6 gap-1">
                          {Array(36).fill(0).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-full aspect-square bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="secondary" 
                      fullWidth 
                      onClick={() => setShowQR(!showQR)}
                    >
                      {showQR ? "Hide QR" : "Show QR"}
                    </Button>
                    <a 
                      href={`https://etherscan.io/address/${selectedWallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" fullWidth>
                        View on Explorer
                      </Button>
                    </a>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setSelectedWallet(null);
                      setShowQR(false);
                    }}
                  >
                    Close
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {/* Session timeout warning - add this to support the session timeout feature */}
          {sessionExpiring && (
            <SessionWarning
              timeRemaining={timeRemaining}
              onExtend={resetSession}
              onLogout={logout}
            />
          )}
        </div>
      </main>
    </div>
  );
}