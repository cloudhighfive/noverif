// src/app/admin/users/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, User, Wallet, CreditCard } from 'lucide-react';
import { collection, getDocs, doc, getDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate } from '@/utils/formatters';

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };
  
  const viewUserDetails = async (userId: string) => {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        alert("User not found");
        return;
      }
      
      const userData = { id: userDoc.id, ...userDoc.data() };
      
      // Get user's ACH applications
      const applications: any[] = [];
      const appsQuery = query(collection(db, 'achApplications'));
      const appsSnapshot = await getDocs(appsQuery);
      
      appsSnapshot.docs.forEach(doc => {
        const appData = doc.data();
        if (appData.userId === userId) {
          applications.push({ id: doc.id, ...appData });
        }
      });
      
      // Add applications to user data
      const userWithApps = {
        ...userData,
        applications
      };
      
      setSelectedUser(userWithApps);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      alert("Failed to load user details");
    }
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">Users</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search users by name or email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="secondary"
              leftIcon={<Filter size={16} />}
              onClick={fetchUsers}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">No users found</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Joined</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Bank Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Wallets</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-800">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center mr-3">
                            <User size={16} className="text-primary-500" />
                          </div>
                          <span className="text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-300">{user.email}</td>
                      <td className="p-4 text-sm text-gray-300">
                        {user.createdAt ? formatDate(user.createdAt.toDate()) : 'Unknown'}
                      </td>
                      <td className="p-4">
                        <span 
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            user.virtualBankStatus === 'pending' 
                              ? 'bg-yellow-500/10 text-yellow-500' 
                              : user.virtualBankStatus === 'in_progress'
                                ? 'bg-blue-500/10 text-blue-500'
                                : user.virtualBankStatus === 'completed'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {user.virtualBankStatus || 'None'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {user.wallets?.length || 0}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewUserDetails(user.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative">
              <CardTitle>User Details</CardTitle>
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setShowDetails(false)}
              >
                &times;
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-xl font-medium text-white">{selectedUser.name}</h2>
                  <p className="text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">User ID</h3>
                  <p className="text-white">{selectedUser.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Joined</h3>
                  <p className="text-white">
                    {selectedUser.createdAt ? formatDate(selectedUser.createdAt.toDate()) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Phone</h3>
                  <p className="text-white">{selectedUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Address</h3>
                  <p className="text-white">{selectedUser.address || 'Not provided'}</p>
                </div>
              </div>
              
              {/* Virtual Bank Status */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Virtual Bank Status</h3>
                <div className="bg-dark-900 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center mr-3">
                      <CreditCard className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span 
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                            selectedUser.virtualBankStatus === 'pending' 
                              ? 'bg-yellow-500/10 text-yellow-500' 
                              : selectedUser.virtualBankStatus === 'in_progress'
                                ? 'bg-blue-500/10 text-blue-500'
                                : selectedUser.virtualBankStatus === 'completed'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-gray-500/10 text-gray-500'
                          }`}
                        >
                          {selectedUser.virtualBankStatus || 'None'}
                        </span>
                        <span className="text-white text-sm">Virtual Bank Account</span>
                      </div>
                      
                      {selectedUser.virtualBankCreatedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Created on: {formatDate(selectedUser.virtualBankCreatedAt.toDate())}
                        </p>
                      )}
                      
                      {selectedUser.virtualBankCompletedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Completed on: {formatDate(selectedUser.virtualBankCompletedAt.toDate())}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Wallets */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Crypto Wallets</h3>
                {selectedUser.wallets && selectedUser.wallets.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.wallets.map((wallet: any, index: number) => (
                      <div key={index} className="bg-dark-900 p-4 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center mr-3">
                            <Wallet className="h-5 w-5 text-primary-500" />
                          </div>
                          <div>
                            <p className="text-white text-sm">{wallet.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{wallet.address}</p>
                            {wallet.connectedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Connected on: {formatDate(wallet.connectedAt.toDate())}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-dark-900 p-4 rounded-lg text-center">
                    <p className="text-gray-400">No wallets connected</p>
                  </div>
                )}
              </div>
              
              {/* Applications */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">ACH Applications</h3>
                {selectedUser.applications && selectedUser.applications.length > 0 ? (
                  <div className="space-y-2">
                    {selectedUser.applications.map((app: any) => (
                      <div key={app.id} className="bg-dark-900 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-white text-sm">
                              {app.businessName || 'Personal Account'}
                            </p>
                            <p className="text-xs text-gray-400">Purpose: {app.purpose}</p>
                            {app.createdAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Applied on: {formatDate(app.createdAt.toDate())}
                              </p>
                            )}
                          </div>
                          <span 
                            className={`inline-block px-2 py-1 h-6 rounded-full text-xs font-medium ${
                              app.status === 'pending' 
                                ? 'bg-yellow-500/10 text-yellow-500' 
                                : app.status === 'in_progress'
                                  ? 'bg-blue-500/10 text-blue-500'
                                  : app.status === 'completed'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-dark-900 p-4 rounded-lg text-center">
                    <p className="text-gray-400">No applications submitted</p>
                  </div>
                )}
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
  );
}