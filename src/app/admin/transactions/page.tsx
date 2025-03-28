// src/app/admin/transactions/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { 
  Search, Filter, Plus, Edit, Trash, Check, X, ArrowDownCircle, ArrowUpCircle 
} from 'lucide-react';
import { 
  collection, getDocs, doc, updateDoc, getDoc, deleteDoc, query, 
  where, orderBy, addDoc, serverTimestamp, Timestamp, DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Transaction } from '@/types';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    fromSource: '',
    toDestination: '',
    purpose: '',
    status: 'pending',
    type: 'ach',
    cryptoType: '',
    notes: ''
  });
  
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
  
  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
    { value: 'USDC', label: 'USD Coin (USDC)' },
    { value: 'USDT', label: 'Tether (USDT)' }
  ];
  
  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, [statusFilter, typeFilter, userFilter]);
  
  const fetchUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email
      }));
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Start with a collection reference
      const transactionsCollection = collection(db, 'transactions');
      
      // Build query constraints
      const constraints = [];
      
      // Apply filters
      if (statusFilter !== 'all') {
        constraints.push(where('status', '==', statusFilter));
      }
      
      if (typeFilter !== 'all') {
        constraints.push(where('type', '==', typeFilter));
      }
      
      if (userFilter !== 'all') {
        constraints.push(where('userId', '==', userFilter));
      }
      
      // Always add orderBy as the last constraint
      constraints.push(orderBy('date', 'desc'));
      
      // Create the query
      const transactionsQuery = query(transactionsCollection, ...constraints);
      
      // Get the documents
      const querySnapshot = await getDocs(transactionsQuery);
      
      // Process the documents
      const transactionsData = await Promise.all(
        querySnapshot.docs.map(async (document) => {
          // Basic document data with proper typing
          const data: DocumentData & { id: string } = { 
            id: document.id, 
            ...document.data() 
          };
          
          // Convert timestamps to dates
          if (data.date instanceof Timestamp) {
            data.date = data.date.toDate();
          }
          
          if (data.createdAt instanceof Timestamp) {
            data.createdAt = data.createdAt.toDate();
          }
          
          if (data.updatedAt instanceof Timestamp) {
            data.updatedAt = data.updatedAt.toDate();
          }
          
          // Get user info for each transaction
          if (data.userId) {
            // Create a reference to the user document
            const userDocRef = doc(db, 'users', data.userId);
            // Get the user document
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              // Add user data to the transaction
              data.user = { 
                id: userDocSnap.id, 
                ...userDocSnap.data() 
              };
            }
          }
          
          return data;
        })
      );
      
      setTransactions(transactionsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      userId: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      fromSource: '',
      toDestination: '',
      purpose: '',
      status: 'pending',
      type: 'ach',
      cryptoType: '',
      notes: ''
    });
    setIsEditing(false);
  };
  
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.userId) {
        alert('Please select a user');
        return;
      }
      
      const transactionData = {
        userId: formData.userId,
        date: new Date(formData.date),
        amount: parseFloat(formData.amount),
        fromSource: formData.fromSource,
        toDestination: formData.toDestination,
        purpose: formData.purpose,
        status: formData.status,
        type: formData.type,
        ...(formData.type === 'crypto' && { cryptoType: formData.cryptoType }),
        notes: formData.notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      if (isEditing && selectedTransaction) {
        // Update existing transaction
        await updateDoc(doc(db, 'transactions', selectedTransaction.id), {
          ...transactionData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new transaction
        await addDoc(collection(db, 'transactions'), transactionData);
      }
      
      // Reset and refresh
      resetForm();
      setShowForm(false);
      fetchTransactions();
      
      alert(isEditing ? 'Transaction updated successfully' : 'Transaction created successfully');
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert('Error saving transaction. Please try again.');
    }
  };
  
  const handleEditTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsEditing(true);
    
    // Format date to YYYY-MM-DD
    const formattedDate = transaction.date instanceof Date 
      ? transaction.date.toISOString().split('T')[0]
      : '';
    
    setFormData({
      userId: transaction.userId || '',
      date: formattedDate,
      amount: transaction.amount?.toString() || '',
      fromSource: transaction.fromSource || '',
      toDestination: transaction.toDestination || '',
      purpose: transaction.purpose || '',
      status: transaction.status || 'pending',
      type: transaction.type || 'ach',
      cryptoType: transaction.cryptoType || '',
      notes: transaction.notes || ''
    });
    
    setShowForm(true);
  };
  
  const handleDeleteTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      await deleteDoc(doc(db, 'transactions', selectedTransaction.id));
      setShowDeleteConfirm(false);
      fetchTransactions();
      alert('Transaction deleted successfully');
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert('Error deleting transaction. Please try again.');
    }
  };
  
  const confirmDelete = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDeleteConfirm(true);
  };
  
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      (transaction.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (transaction.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (transaction.fromSource?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (transaction.toDestination?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (transaction.purpose?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    return matchesSearch;
  });
  
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

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">Transactions Management</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
              />
              
              <Dropdown
                options={typeOptions}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Filter by type"
              />
              
              <Dropdown
                options={[
                  { value: 'all', label: 'All Users' },
                  ...users.map(user => ({ 
                    value: user.id, 
                    label: `${user.name} (${user.email})` 
                  }))
                ]}
                value={userFilter}
                onChange={setUserFilter}
                placeholder="Filter by user"
              />
              
              <Button 
                variant="secondary"
                leftIcon={<Filter size={16} />}
                onClick={fetchTransactions}
              >
                Refresh
              </Button>
            </div>
            
            <Button 
              leftIcon={<Plus size={16} />}
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="max-w-2xl w-full">
            <CardHeader className="relative">
              <CardTitle>{isEditing ? 'Edit Transaction' : 'Create Transaction'}</CardTitle>
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setShowForm(false)}
              >
                &times;
              </button>
            </CardHeader>
            <form onSubmit={handleCreateTransaction}>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropdown
                    label="User"
                    options={users.map(user => ({ 
                      value: user.id, 
                      label: `${user.name} (${user.email})` 
                    }))}
                    value={formData.userId}
                    onChange={(value) => setFormData({...formData, userId: value})}
                    placeholder="Select a user"
                  />
                  
                  <Input
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropdown
                    label="Transaction Type"
                    options={[
                      { value: 'ach', label: 'ACH Transfer' },
                      { value: 'bank', label: 'Bank Transfer' },
                      { value: 'crypto', label: 'Cryptocurrency' }
                    ]}
                    value={formData.type}
                    onChange={(value) => setFormData({...formData, type: value})}
                    placeholder="Select transaction type"
                  />
                  
                  <Dropdown
                    label="Status"
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'failed', label: 'Failed' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ]}
                    value={formData.status}
                    onChange={(value) => setFormData({...formData, status: value})}
                    placeholder="Select status"
                  />
                </div>
                
                {formData.type === 'crypto' && (
                  <Dropdown
                    label="Cryptocurrency"
                    options={cryptoOptions}
                    value={formData.cryptoType}
                    onChange={(value) => setFormData({...formData, cryptoType: value})}
                    placeholder="Select cryptocurrency"
                  />
                )}
                
                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount"
                  required
                />
                
                <Input
                  label="From"
                  value={formData.fromSource}
                  onChange={(e) => setFormData({...formData, fromSource: e.target.value})}
                  placeholder="Source of funds"
                  required
                />
                
                <Input
                  label="To"
                  value={formData.toDestination}
                  onChange={(e) => setFormData({...formData, toDestination: e.target.value})}
                  placeholder="Destination of funds"
                  required
                />
                
                <Input
                  label="Purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  placeholder="Purpose of transaction"
                  required
                />
                
                <div className="space-y-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-200">
                    Admin Notes (Not visible to user)
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="block w-full rounded-lg border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Internal notes about this transaction"
                  ></textarea>
                </div>
              </CardContent>
              <div className="p-6 border-t border-dark-700 flex justify-end space-x-3">
                <Button 
                  type="button"
                  variant="secondary" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                >
                  {isEditing ? 'Update' : 'Create'} Transaction
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="relative">
              <CardTitle>Confirm Delete</CardTitle>
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setShowDeleteConfirm(false)}
              >
                &times;
              </button>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-white mb-4">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
              <div className="bg-dark-900 p-4 rounded-lg">
                <p className="text-gray-300 text-sm"><strong>Purpose:</strong> {selectedTransaction.purpose}</p>
                <p className="text-gray-300 text-sm">
                  <strong>Amount:</strong> {formatCurrency(selectedTransaction.amount)}
                  {selectedTransaction.cryptoType ? ` ${selectedTransaction.cryptoType}` : ''}
                </p>
                <p className="text-gray-300 text-sm"><strong>Date:</strong> {selectedTransaction.date && formatDate(selectedTransaction.date)}</p>
              </div>
            </CardContent>
            <div className="p-6 border-t border-dark-700 flex justify-end space-x-3">
              <Button 
                variant="secondary" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handleDeleteTransaction}
                >
                Delete Transaction
                </Button>
            </div>
          </Card>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">No transactions found</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Details</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Amount</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredTransactions.map((transaction) => {
                    // Determine if this is an incoming transaction
                    const isIncoming = transaction.toDestination.includes('user') ||
                                     transaction.toDestination.includes('wallet');
                    
                    return (
                      <tr key={transaction.id} className="hover:bg-dark-800">
                        <td className="p-4 text-sm text-gray-300">
                          {transaction.date && formatDate(transaction.date)}
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{transaction.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{transaction.user?.email || 'No email'}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-white">{transaction.purpose}</p>
                            <p className="text-xs text-gray-400">
                              From: {transaction.fromSource}<br />
                              To: {transaction.toDestination}
                            </p>
                          </div>
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
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              leftIcon={<Edit size={14} />}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => confirmDelete(transaction)}
                              leftIcon={<Trash size={14} />}
                            >
                              Delete
                            </Button>
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