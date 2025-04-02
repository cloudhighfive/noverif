// src/components/dashboard/RecentTransactions.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate, formatStatus } from '@/utils/formatters';

// Mock transaction data
const mockTransactions = [
  {
    id: 'tx1',
    type: 'ACH',
    amount: 750.00,
    status: 'completed',
    date: new Date('2023-07-15'),
    description: 'Payment from Client A',
  },
  {
    id: 'tx2',
    type: 'Crypto',
    amount: 1200.50,
    status: 'pending',
    date: new Date('2023-07-14'),
    description: 'ETH transfer',
  },
  {
    id: 'tx3',
    type: 'ACH',
    amount: 450.00,
    status: 'completed',
    date: new Date('2023-07-12'),
    description: 'Subscription payment',
  },
];

const RecentTransactions = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest payment activities</CardDescription>
      </CardHeader>
      <CardContent>
        {mockTransactions.length > 0 ? (
          <div className="space-y-4">
            {mockTransactions.map((transaction) => {
              const { label, color } = formatStatus(transaction.status);
              
              return (
                <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-900 border border-dark-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      transaction.type === 'Crypto' ? 'bg-primary-500/10' : 'bg-secondary-500/10'
                    }`}>
                      <span className={
                        transaction.type === 'Crypto' ? 'text-primary-500' : 'text-secondary-500'
                      }>
                        {transaction.type === 'Crypto' ? '₿' : '$'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{transaction.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{formatCurrency(transaction.amount)}</p>
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
            <p className="text-gray-400">No transactions yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;