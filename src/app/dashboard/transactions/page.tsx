// src/app/dashboard/transactions/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction, TransactionFilter } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Search, Filter, ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';

export default function TransactionsPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<TransactionFilter>({});
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);

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
      setIsLoadingTransactions(true);
      
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user?.uid),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(transactionsQuery);
      const transactionsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Transaction;
      });
      
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
        tx.toDestination.toLowerCase().includes(term) ||
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
      filtered = filtered.filter(tx => 
        tx.date >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(tx => 
        tx.date <= filters.dateTo!
      );
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

  const getTypeIcon = (type: string, isIncoming: boolean) => {
    if (isIncoming) {
      return <ArrowDownCircle className="h-6 w-6 text-green-500" />;
    } else {
      return <ArrowUpCircle className="h-6 w-6 text-red-500" />;
    }
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
      
      <main className="pt-24 pb-12 pl-64">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-display font-bold mb-6">Transactions</h1>
          
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input 
                    placeholder="Search transactions..." 
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
                >
                  Refresh
                </Button>
                
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
            </CardContent>
          </Card>
          
          {isLoadingTransactions ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No Transactions Found</h3>
                <p className="text-gray-400">
                  {transactions.length === 0 
                    ? "You don't have any transactions yet." 
                    : "No transactions match your search filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-dark-700">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Description</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">From/To</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                      {filteredTransactions.map((transaction) => {
                        // Determine if this is an incoming transaction (simplified logic)
                        const isIncoming = transaction.toDestination.includes('me') || 
                                           transaction.toDestination.includes('my') ||
                                           transaction.toDestination.toLowerCase().includes('wallet');
                        
                        return (
                          <tr key={transaction.id} className="hover:bg-dark-800">
                            <td className="p-4 text-sm text-gray-300">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-dark-700">
                                  {getTypeIcon(transaction.type, isIncoming)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{transaction.purpose}</p>
                                  <p className="text-xs text-gray-400 capitalize">{transaction.type} Transaction</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-300">
                              {isIncoming ? `From: ${transaction.fromSource}` : `To: ${transaction.toDestination}`}
                            </td>
                            <td className="p-4 text-sm">
                              <span className={isIncoming ? 'text-green-500' : 'text-red-500'}>
                                {isIncoming ? '+' : '-'}{formatCurrency(transaction.amount)}
                                {transaction.cryptoType ? ` ${transaction.cryptoType}` : ''}
                              </span>
                            </td>
                            <td className="p-4">
                              <span 
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}
                              >
                                {transaction.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewTransactionDetails(transaction)}
                              >
                                Details
                              </Button>
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
          
          {/* Transaction Details Modal */}
          {showDetails && selectedTransaction && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-2xl w-full">
                <CardHeader className="relative">
                  <CardTitle>Transaction Details</CardTitle>
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
                      <p className="text-white">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Date</h3>
                      <p className="text-white">{formatDate(selectedTransaction.date)}</p>
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
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Transaction Details</h3>
                    <div className="bg-dark-900 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Amount</p>
                          <p className="text-white font-semibold">
                            {formatCurrency(selectedTransaction.amount)}
                            {selectedTransaction.cryptoType ? ` ${selectedTransaction.cryptoType}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Purpose</p>
                          <p className="text-white">{selectedTransaction.purpose}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">From</p>
                          <p className="text-white">{selectedTransaction.fromSource}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">To</p>
                          <p className="text-white">{selectedTransaction.toDestination}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
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