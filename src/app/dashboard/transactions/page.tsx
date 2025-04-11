// src/app/dashboard/transactions/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardWrapper from '@/components/layout/DashboardWrapper';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { getTransactions } from '@/lib/firebase';
import { Transaction, TransactionFilter } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Search, Filter, ArrowDownCircle, Clock, AlertOctagon, ExternalLink } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper function to safely format date values
const formatFirebaseDate = (dateField: Date | Timestamp | undefined): string => {
  if (!dateField) return '';
  
  // Check if it's a Timestamp object (has toDate method)
  if (dateField instanceof Timestamp || (dateField as any).toDate) {
    return formatDate((dateField as any).toDate());
  }
  // If it's already a Date object
  return formatDate(dateField as Date);
};

export default function TransactionsPage() {
  const { isAuthenticated, loading, user, isSuspended } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'ach', label: 'ACH Transfer' },
    { value: 'bank', label: 'Bank Transfer' }
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTransactions();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filters]);

  const fetchTransactions = async () => {
    try {
      if (!user) return;
      
      setIsLoadingTransactions(true);
      
      // Use the getTransactions function from firebase.ts
      const transactionsData = await getTransactions(user.uid);
      
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      setIsLoadingTransactions(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setIsLoadingTransactions(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.fromSource.toLowerCase().includes(term) ||
        tx.purpose.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status);
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filters.type);
    }

    // Apply date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(tx => {
        const txDate = tx.date instanceof Date ? tx.date : 
                      (tx.date as any)?.toDate ? (tx.date as any).toDate() : null;
        return txDate && txDate >= filters.dateFrom!;
      });
    }

    if (filters.dateTo) {
      filtered = filtered.filter(tx => {
        const txDate = tx.date instanceof Date ? tx.date : 
                      (tx.date as any)?.toDate ? (tx.date as any).toDate() : null;
        return txDate && txDate <= filters.dateTo!;
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }));
  };

  const handleTypeFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value }));
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : undefined;
    setFilters(prev => ({ ...prev, dateFrom: dateValue }));
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value ? new Date(e.target.value) : undefined;
    // Set time to end of day for "to" date
    if (dateValue) {
      dateValue.setHours(23, 59, 59, 999);
    }
    setFilters(prev => ({ ...prev, dateTo: dateValue }));
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      case 'failed':
        return 'bg-red-500/10 text-red-500';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getTransactionIcon = (type: string) => {
    return <ArrowDownCircle className="h-6 w-6 text-green-500" />;
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="pt-20 pb-16 md:pt-24 md:pb-12 md:pl-64 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-6">Incoming Payments</h1>

          {isSuspended && (
            <Card className="mb-6 bg-red-900/10 border-red-500/20">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <AlertOctagon className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-500">Account Suspended</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Your account is currently suspended. You can view your payment history, 
                      but new payments cannot be received. Please contact support for assistance.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Search payments..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Dropdown
                  options={statusOptions}
                  value={filters.status || 'all'}
                  onChange={handleStatusFilterChange}
                  placeholder="Filter by status"
                />
                
                <Dropdown
                  options={typeOptions}
                  value={filters.type || 'all'}
                  onChange={handleTypeFilterChange}
                  placeholder="Filter by type"
                />
                
                <Button 
                  variant="secondary"
                  leftIcon={<Filter size={16} />}
                  onClick={fetchTransactions}
                  className="mt-0"
                >
                  Refresh
                </Button>
                
                <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      From Date
                    </label>
                    <Input 
                      type="date" 
                      onChange={handleDateFromChange} 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      To Date
                    </label>
                    <Input 
                      type="date" 
                      onChange={handleDateToChange} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoadingTransactions ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading payments...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Payments Found</h3>
                <p className="text-gray-400">
                  {transactions.length === 0 
                    ? "You haven't received any payments yet." 
                    : "No payments match your search filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-full divide-y divide-dark-700">
                    {/* Table header - visible on desktop only */}
                    <div className="bg-dark-800 hidden md:flex">
                      <div className="py-3 px-4 w-32 text-sm font-medium text-gray-400">Date</div>
                      <div className="py-3 px-4 flex-1 text-sm font-medium text-gray-400">Description</div>
                      <div className="py-3 px-4 w-40 text-sm font-medium text-gray-400">From</div>
                      <div className="py-3 px-4 w-32 text-sm font-medium text-gray-400">Amount</div>
                      <div className="py-3 px-4 w-28 text-sm font-medium text-gray-400">Status</div>
                      <div className="py-3 px-4 w-24 text-sm font-medium text-gray-400">Actions</div>
                    </div>
                    
                    {/* Table rows / cards for mobile */}
                    <div className="divide-y divide-dark-700">
                      {filteredTransactions.map((transaction) => {
                        return (
                          <div 
                            key={transaction.id} 
                            className="hover:bg-dark-800 cursor-pointer"
                            onClick={() => viewTransactionDetails(transaction)}
                          >
                            {/* Mobile view - card style */}
                            <div className="p-4 md:hidden">
                              <div className="flex items-start mb-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-dark-700 flex-shrink-0">
                                  {getTransactionIcon(transaction.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-white">{transaction.purpose}</p>
                                      <p className="text-xs text-gray-400 capitalize mt-1">
                                        {transaction.type} Payment • {formatFirebaseDate(transaction.date)}
                                      </p>
                                    </div>
                                    <span className="text-sm text-green-500 font-medium ml-2">
                                      +{formatCurrency(transaction.amount)}
                                      {transaction.cryptoType ? ` ${transaction.cryptoType}` : ''}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between mt-2">
                                    <span 
                                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}
                                    >
                                      {transaction.status}
                                    </span>
                                    <p className="text-xs text-gray-400 truncate max-w-[150px]">
                                      From: {transaction.fromSource}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Desktop view - table row */}
                            <div className="hidden md:flex">
                              <div className="py-4 px-4 w-32 text-sm text-gray-300">
                                {formatFirebaseDate(transaction.date)}
                              </div>
                              <div className="py-4 px-4 flex-1">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-dark-700">
                                    {getTransactionIcon(transaction.type)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{transaction.purpose}</p>
                                    <p className="text-xs text-gray-400 capitalize">{transaction.type} Payment</p>
                                  </div>
                                </div>
                              </div>
                              <div className="py-4 px-4 w-40 text-sm text-gray-300 truncate">
                                {transaction.fromSource}
                              </div>
                              <div className="py-4 px-4 w-32 text-sm text-green-500 font-medium">
                                +{formatCurrency(transaction.amount)}
                                {transaction.cryptoType ? ` ${transaction.cryptoType}` : ''}
                              </div>
                              <div className="py-4 px-4 w-28">
                                <span 
                                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}
                                >
                                  {transaction.status}
                                </span>
                              </div>
                              <div className="py-4 px-4 w-24">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    viewTransactionDetails(transaction);
                                  }}
                                >
                                  Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Transaction Details Modal */}
          {showDetails && selectedTransaction && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full mx-4">
                <CardHeader className="relative">
                  <CardTitle>Payment Details</CardTitle>
                  <button 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    onClick={() => setShowDetails(false)}
                  >
                    &times;
                  </button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Transaction ID</h3>
                      <p className="text-white break-all text-sm">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Date</h3>
                      <p className="text-white">{formatFirebaseDate(selectedTransaction.date)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Type</h3>
                      <p className="text-white capitalize">{selectedTransaction.type}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedTransaction.status)}`}
                      >
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Details</h3>
                    <div className="bg-dark-900 p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Amount</p>
                          <p className="text-green-500 font-semibold">
                            +{formatCurrency(selectedTransaction.amount)}
                            {selectedTransaction.cryptoType ? ` ${selectedTransaction.cryptoType}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Purpose</p>
                          <p className="text-white">{selectedTransaction.purpose}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-gray-400 text-sm">From</p>
                          <p className="text-white break-words">{selectedTransaction.fromSource}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-gray-400 text-sm">To Your Wallet</p>
                          <p className="text-white break-words">{selectedTransaction.toDestination}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTransaction.type === 'crypto' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Transaction Hash</h3>
                      <div className="bg-dark-900 p-4 rounded-lg flex items-center justify-between flex-wrap gap-2">
                        <p className="text-sm font-mono text-gray-300 break-all">
                          {selectedTransaction.transactionHash || '0x7a69c0256e20406c679d5561cf8b88682993ad2c3985d97346a774d3383dc60d'}
                        </p>
                        <a 
                          href={`https://etherscan.io/tx/${selectedTransaction.transactionHash || '0x7a69c0256e20406c679d5561cf8b88682993ad2c3985d97346a774d3383dc60d'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-400"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      variant="secondary" 
                      onClick={() => setShowDetails(false)}
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}