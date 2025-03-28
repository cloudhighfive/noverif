// src/app/admin/ach-applications/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Search, Filter, ChevronDown, Check, X } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDate } from '@/utils/formatters';
import ACHApprovalForm from '@/components/admin/ACHApprovalForm';
import { ACHApplication } from '@/types';

export default function ACHApplicationsAdmin() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' }
  ];
  
  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);
  
  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      let applicationsQuery;
      
      if (statusFilter === 'all') {
        applicationsQuery = query(
          collection(db, 'achApplications'),
          orderBy('createdAt', 'desc')
        );
      } else {
        applicationsQuery = query(
          collection(db, 'achApplications'),
          where('status', '==', statusFilter),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(applicationsQuery);
      const applicationsData = await Promise.all(querySnapshot.docs.map(async (document) => {
        const data = { id: document.id, ...document.data() } as any;
        
        // Get user info for each application
        if (data.userId) {
          // Fixed: using doc() function directly with db and userId
          const userDocRef = doc(db, 'users', data.userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            data.user = { id: userDocSnap.id, ...userDocSnap.data() };
          }
        }
        
        return data;
      }));
      
      setApplications(applicationsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (appId: string, userId: string, newStatus: string) => {
    try {
      if (newStatus === 'in_progress' || newStatus === 'completed') {
        // For these statuses, we'll use the approval form instead
        const app = applications.find(a => a.id === appId);
        if (app) {
          setSelectedApp(app);
          setShowApprovalForm(true);
        }
        return;
      }
      
      // For reject status, we can directly update
      const timestamp = new Date();
      
      // Update application status
      await updateDoc(doc(db, 'achApplications', appId), {
        status: newStatus,
        updatedAt: timestamp,
        rejectedAt: timestamp
      });
      
      // Update user's virtual bank status
      await updateDoc(doc(db, 'users', userId), {
        virtualBankStatus: newStatus,
        updatedAt: timestamp
      });
      
      // Update the local state
      setApplications(applications.map(app => {
        if (app.id === appId) {
          return { ...app, status: newStatus };
        }
        return app;
      }));
      
      // Close details if showing
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
      
      alert(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };
  
  const handleApprovalSuccess = () => {
    // Close the form
    setShowApprovalForm(false);
    
    // Refresh the applications list
    fetchApplications();
    
    // Update the selected app if details were being viewed
    if (selectedApp && showDetails) {
      // Re-fetch the specific application to get the updated data
      getDoc(doc(db, 'achApplications', selectedApp.id)).then(docSnap => {
        if (docSnap.exists()) {
          setSelectedApp({ id: docSnap.id, ...docSnap.data() });
        }
      });
    }
  };
  
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      (app.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (app.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (app.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (app.id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
  
  const viewApplicationDetails = (app: any) => {
    setSelectedApp(app);
    setShowDetails(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">ACH Applications</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search applications..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filter by status"
              />
            </div>
            <Button 
              variant="secondary"
              leftIcon={<Filter size={16} />}
              onClick={fetchApplications}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">No applications found</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">ID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Business Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Purpose</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-dark-800">
                      <td className="p-4 text-sm text-gray-300">{app.id.slice(0, 8)}...</td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm text-white">{app.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{app.user?.email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {app.businessName || 'Personal Account'}
                      </td>
                      <td className="p-4 text-sm text-gray-300">{app.purpose}</td>
                      <td className="p-4 text-sm text-gray-300">
                        {app.createdAt ? formatDate(app.createdAt.toDate()) : 'Unknown'}
                      </td>
                      <td className="p-4">
                        <span 
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewApplicationDetails(app)}
                          >
                            Details
                          </Button>
                          
                          {app.status === 'pending' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                              onClick={() => handleStatusChange(app.id, app.userId, 'in_progress')}
                            >
                              Approve
                            </Button>
                          )}
                          
                          {app.status === 'in_progress' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                              onClick={() => handleStatusChange(app.id, app.userId, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          
                          {(app.status === 'pending' || app.status === 'in_progress') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              onClick={() => handleStatusChange(app.id, app.userId, 'rejected')}
                            >
                              Reject
                            </Button>
                          )}
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
      
      {/* Application Details Modal */}
      {showDetails && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="relative">
              <CardTitle>Application Details</CardTitle>
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
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Application ID</h3>
                  <p className="text-white">{selectedApp.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                  <span 
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedApp.status === 'pending' 
                        ? 'bg-yellow-500/10 text-yellow-500' 
                        : selectedApp.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-500'
                          : selectedApp.status === 'completed'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {selectedApp.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Submitted On</h3>
                  <p className="text-white">
                    {selectedApp.createdAt ? formatDate(selectedApp.createdAt.toDate()) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Last Updated</h3>
                  <p className="text-white">
                    {selectedApp.updatedAt ? formatDate(selectedApp.updatedAt.toDate()) : 'Not updated'}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">User Information</h3>
                <div className="bg-dark-900 p-4 rounded-lg">
                  <p className="text-white">{selectedApp.user?.name || 'Unknown'}</p>
                  <p className="text-gray-400">{selectedApp.user?.email || 'No email'}</p>
                  <p className="text-gray-400 mt-1">{selectedApp.user?.phone || 'No phone'}</p>
                  <p className="text-gray-400 mt-1">{selectedApp.user?.address || 'No address'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Application Details</h3>
                <div className="bg-dark-900 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Business Name</p>
                      <p className="text-white">{selectedApp.businessName || 'Personal Account'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Purpose</p>
                      <p className="text-white">{selectedApp.purpose}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Show bank details if available */}
              {selectedApp.bankDetails && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Bank Details</h3>
                  <div className="bg-dark-900 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Bank Name</p>
                        <p className="text-white">{selectedApp.bankDetails.bankName}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Account Type</p>
                        <p className="text-white capitalize">{selectedApp.bankDetails.accountType}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Account Owner</p>
                        <p className="text-white">{selectedApp.bankDetails.accountOwner}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Account Number</p>
                        <p className="text-white">
                          {"•".repeat(selectedApp.bankDetails.accountNumber.length - 4)}
                          {selectedApp.bankDetails.accountNumber.slice(-4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Routing Number</p>
                        <p className="text-white">{selectedApp.bankDetails.routingNumber}</p>
                      </div>
                      {selectedApp.bankDetails.swiftCode && (
                        <div>
                          <p className="text-gray-400 text-sm">SWIFT Code</p>
                          <p className="text-white">{selectedApp.bankDetails.swiftCode}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-400 text-sm">Bank Address</p>
                      <p className="text-white">{selectedApp.bankDetails.bankAddress}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show admin notes if available */}
              {selectedApp.adminNotes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Admin Notes</h3>
                  <div className="bg-dark-900 p-4 rounded-lg">
                    <p className="text-white">{selectedApp.adminNotes}</p>
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
                
                {selectedApp.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => {
                        setShowDetails(false);
                        handleStatusChange(selectedApp.id, selectedApp.userId, 'in_progress');
                      }}
                      leftIcon={<Check size={16} />}
                    >
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => {
                        handleStatusChange(selectedApp.id, selectedApp.userId, 'rejected');
                      }}
                      leftIcon={<X size={16} />}
                    >
                      Reject
                    </Button>
                  </>
                )}
                
                {selectedApp.status === 'in_progress' && (
                  <Button 
                    variant="primary"
                    onClick={() => {
                      setShowDetails(false);
                      handleStatusChange(selectedApp.id, selectedApp.userId, 'completed');
                    }}
                    leftIcon={<Check size={16} />}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* ACH Approval Form Modal */}
      {showApprovalForm && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ACHApprovalForm
              applicationId={selectedApp.id}
              userId={selectedApp.userId}
              initialStatus={selectedApp.status}
              initialData={selectedApp.bankDetails}
              onSuccess={handleApprovalSuccess}
              onCancel={() => setShowApprovalForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}