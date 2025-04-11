// src/components/dashboard/VirtualBankDetails.tsx
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ACHBankDetails } from '@/types';

const VirtualBankDetails = () => {
  const { userData } = useAuth();
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const bankDetails = userData?.bankDetails as ACHBankDetails | undefined;
  const hasVirtualBank = userData?.virtualBankStatus === 'completed' && bankDetails;
  
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };
  
  if (!hasVirtualBank) {
    return null; // Don't render anything if there's no bank details
  }
  
  const toggleAccountNumberVisibility = () => {
    setShowAccountNumber(!showAccountNumber);
  };
  
  // Mask account number, showing only the last 4 digits
  const maskedAccountNumber = showAccountNumber 
    ? bankDetails.accountNumber 
    : "•".repeat(bankDetails.accountNumber.length - 4) + bankDetails.accountNumber.slice(-4);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Virtual Bank Account</CardTitle>
        <CardDescription>Your virtual bank account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
            <CreditCard className="h-6 w-6 text-primary-500" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-white">{bankDetails.bankName}</h3>
            <p className="text-gray-400 capitalize">{bankDetails.accountType} Account</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Account Holder</h4>
            <div className="flex items-center justify-between">
              <p className="text-white truncate pr-2">{bankDetails.accountOwner}</p>
              <button 
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700 flex-shrink-0"
                onClick={() => handleCopy(bankDetails.accountOwner, 'accountOwner')}
              >
                {copiedField === 'accountOwner' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Account Number</h4>
            <div className="flex items-center justify-between">
              <p className="text-white font-mono truncate pr-2">{maskedAccountNumber}</p>
              <div className="flex items-center flex-shrink-0">
                <button 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700 mr-1"
                  onClick={toggleAccountNumberVisibility}
                >
                  {showAccountNumber ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <button 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700"
                  onClick={() => handleCopy(bankDetails.accountNumber, 'accountNumber')}
                >
                  {copiedField === 'accountNumber' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Routing Number (ABA)</h4>
            <div className="flex items-center justify-between">
              <p className="text-white font-mono truncate pr-2">{bankDetails.routingNumber}</p>
              <button 
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700 flex-shrink-0"
                onClick={() => handleCopy(bankDetails.routingNumber, 'routingNumber')}
              >
                {copiedField === 'routingNumber' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          
          {bankDetails.swiftCode && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">SWIFT Code</h4>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono truncate pr-2">{bankDetails.swiftCode}</p>
                <button 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-700 flex-shrink-0"
                  onClick={() => handleCopy(bankDetails.swiftCode as string, 'swiftCode')}
                >
                  {copiedField === 'swiftCode' ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-1">Bank Address</h4>
          <p className="text-white break-words">{bankDetails.bankAddress}</p>
        </div>
        
        <div className="bg-dark-900 p-4 rounded-lg mt-4">
          <div className="flex items-start">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-500 mr-3 mt-0.5 flex-shrink-0 fill-current">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/>
            </svg>
            <div>
              <p className="text-gray-300 text-sm">
                Use these details for ACH transfers to your virtual bank account. 
                For security, always verify these details before initiating large transfers.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualBankDetails;