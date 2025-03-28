'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import VirtualBankStatus from '@/components/dashboard/VirtualBankStatus';
import VirtualBankDetails from '@/components/dashboard/VirtualBankDetails';
import WalletConnection from '@/components/dashboard/WalletConnection';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import QuickActions from '@/components/dashboard/QuickActions';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { isAuthenticated, loading, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Determine if virtual bank is completed
  const hasCompletedVirtualBank = userData?.virtualBankStatus === 'completed';

  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="pt-24 pb-12 pl-64">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-display font-bold mb-6">Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              {/* Show either VirtualBankStatus or VirtualBankDetails based on status */}
              {hasCompletedVirtualBank ? (
                <VirtualBankDetails />
              ) : (
                <VirtualBankStatus />
              )}
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WalletConnection />
            <RecentTransactions />
          </div>
        </div>
      </main>
    </div>
  );
}