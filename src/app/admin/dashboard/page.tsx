// src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Users, CreditCard, Wallet, FileText } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate } from '@/utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApplications: 0,
    activeWallets: 0,
    totalTransactions: 0
  });
  
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnapshot.size;
        
        // Fetch recent users
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsersData = recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch pending applications
        const pendingAppsQuery = query(
          collection(db, 'achApplications'),
          where('status', '==', 'pending')
        );
        const pendingAppsSnapshot = await getDocs(pendingAppsQuery);
        const pendingApplications = pendingAppsSnapshot.size;
        
        // Fetch recent applications
        const recentAppsQuery = query(
          collection(db, 'achApplications'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentAppsSnapshot = await getDocs(recentAppsQuery);
        const recentAppsData = recentAppsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Count all wallets
        let walletCount = 0;
        usersSnapshot.docs.forEach(doc => {
          const userData = doc.data();
          if (userData.wallets && Array.isArray(userData.wallets)) {
            walletCount += userData.wallets.length;
          }
        });
        
        // Fetch transactions count
        const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
        const totalTransactions = transactionsSnapshot.size;
        
        setStats({
          totalUsers,
          pendingApplications,
          activeWallets: walletCount,
          totalTransactions
        });
        
        setRecentUsers(recentUsersData);
        setRecentApplications(recentAppsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <h3 className="text-2xl font-semibold text-white">{stats.totalUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mr-4">
                <CreditCard className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pending Applications</p>
                <h3 className="text-2xl font-semibold text-white">{stats.pendingApplications}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mr-4">
                <Wallet className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Wallets</p>
                <h3 className="text-2xl font-semibold text-white">{stats.activeWallets}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mr-4">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Transactions</p>
                <h3 className="text-2xl font-semibold text-white">{stats.totalTransactions}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="divide-y divide-dark-700">
                {recentUsers.map((user) => (
                  <div key={user.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {user.createdAt ? formatDate(user.createdAt.toDate()) : 'Unknown date'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {user.wallets ? `${user.wallets.length} wallet(s)` : '0 wallets'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No users found</p>
            )}
            
            <div className="mt-4 text-right">
              <a 
                href="/admin/users"
                className="text-sm text-primary-500 hover:underline"
              >
                View all users &rarr;
              </a>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent ACH Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="divide-y divide-dark-700">
                {recentApplications.map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">
                        {app.businessName || 'Personal Account'}
                      </p>
                      <p className="text-sm text-gray-400">Purpose: {app.purpose}</p>
                    </div>
                    <div className="text-right">
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          app.status === 'pending' 
                            ? 'bg-yellow-500/10 text-yellow-500' 
                            : app.status === 'in_progress'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-green-500/10 text-green-500'
                        }`}
                      >
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {app.createdAt ? formatDate(app.createdAt.toDate()) : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No applications found</p>
            )}
            
            <div className="mt-4 text-right">
              <a 
                href="/admin/ach-applications"
                className="text-sm text-primary-500 hover:underline"
              >
                View all applications &rarr;
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}