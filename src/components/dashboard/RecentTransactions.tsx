// src/components/dashboard/RecentTransactions.tsx

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate, formatStatus } from '@/utils/formatters';
import { getTransactions } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Transaction } from '@/types';
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { ArrowDownCircle } from 'lucide-react';

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

const RecentTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async (): Promise<void> => {
    try {
      if (!user) return;
      setLoading(true);
      const fetchedTransactions = await getTransactions(user.uid, 5);
      setTransactions(fetchedTransactions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Your latest incoming payments</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-400 text-sm">Loading payments...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const { label, color } = formatStatus(transaction.status);
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-900 border border-dark-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      transaction.type === 'crypto' ? 'bg-primary-500/10' : 'bg-secondary-500/10'
                    }`}>
                      <ArrowDownCircle className={
                        transaction.type === 'crypto' ? 'text-primary-500 h-5 w-5' : 'text-secondary-500 h-5 w-5'
                      } />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{transaction.purpose}</p>
                      <p className="text-xs text-gray-400">{formatFirebaseDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-500">
                      +{formatCurrency(transaction.amount)}
                      {transaction.cryptoType ? ` ${transaction.cryptoType}` : ''}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No payments received yet.</p>
          </div>
        )}
        
        {transactions.length > 0 && (
          <div className="mt-4 text-right">
            <Link href="/dashboard/transactions" className="text-sm text-primary-500 hover:underline">
              View all payments &rarr;
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;