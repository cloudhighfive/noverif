// src/app/dashboard/invoices/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { getUserInvoices, deleteInvoice } from '@/lib/firebase';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Search, Plus, Download, Trash, Eye } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function InvoicesPage() {
  const { isAuthenticated, loading, user, userData, isSuspended } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('history');
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchInvoices();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = invoices.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInvoices(filtered);
    } else {
      setFilteredInvoices(invoices);
    }
  }, [searchTerm, invoices]);

  const fetchInvoices = async () => {
    try {
      if (!user) return;
      
      setLoadingInvoices(true);
      const fetchedInvoices = await getUserInvoices(user.uid);
      setInvoices(fetchedInvoices);
      setFilteredInvoices(fetchedInvoices);
      setLoadingInvoices(false);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setLoadingInvoices(false);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to invoice details
    try {
      // Create PDF document (implementation omitted for brevity)
      alert('PDF download functionality would be implemented here');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleCreateInvoice = () => {
    router.push('/dashboard/invoices/create');
  };

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  const handleDeleteInvoice = async (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation to invoice details
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteInvoice(invoiceId);
        // Remove from local state
        setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
        alert('Invoice deleted successfully');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const getRecurringInvoices = () => {
    return filteredInvoices.filter(invoice => invoice.isRecurring);
  };

  const getNonRecurringInvoices = () => {
    return filteredInvoices.filter(invoice => !invoice.isRecurring);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/10 text-gray-500';
      case 'sent':
        return 'bg-blue-500/10 text-blue-500';
      case 'paid':
        return 'bg-green-500/10 text-green-500';
      case 'overdue':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
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
      
      <main className="pt-20 pb-16 md:pt-24 md:pb-12 md:pl-64 px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl md:text-3xl font-display font-bold">Invoices</h1>
            <Button 
              onClick={handleCreateInvoice}
              leftIcon={<Plus size={16} />}
              disabled={isSuspended}
            >
              Create Invoice
            </Button>
          </div>
          
          <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 w-full overflow-x-auto flex-nowrap">
              <TabsTrigger value="history" className="flex-1">Invoice History</TabsTrigger>
              <TabsTrigger value="recurring" className="flex-1">Recurring Invoices</TabsTrigger>
            </TabsList>
            
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search by invoice number or client..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <TabsContent value="history">
              {loadingInvoices ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading invoices...</p>
                </div>
              ) : getNonRecurringInvoices().length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <h3 className="text-xl font-medium text-white mb-2">No Invoices Found</h3>
                    <p className="text-gray-400">
                      {invoices.length === 0 
                        ? "You haven't created any invoices yet."
                        : "No invoices match your search criteria."}
                    </p>
                    <Button 
                      onClick={handleCreateInvoice} 
                      className="mt-6"
                      disabled={isSuspended}
                    >
                      Create Your First Invoice
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <Card>
                    <div className="min-w-full divide-y divide-dark-700">
                      <div className="bg-dark-800 hidden md:flex">
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Date</div>
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Number</div>
                        <div className="px-4 py-3 flex-1 text-left text-sm font-medium text-gray-400">Client</div>
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Total</div>
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Status</div>
                        <div className="px-4 py-3 w-40 text-right text-sm font-medium text-gray-400">Actions</div>
                      </div>
                      
                      <div className="divide-y divide-dark-700">
                        {getNonRecurringInvoices().map((invoice) => (
                          <div 
                            key={invoice.id} 
                            className="hover:bg-dark-800 cursor-pointer flex flex-wrap md:flex-nowrap"
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            {/* Mobile view - card style */}
                            <div className="p-4 md:hidden w-full">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="text-white font-medium">{invoice.invoiceNumber}</span>
                                  <span 
                                    className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                                  >
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                  </span>
                                </div>
                                <span className="text-white font-medium">{formatCurrency(invoice.total)}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Client: {invoice.clientName}</span>
                                <span className="text-gray-400">{formatDate(invoice.issueDate as Date)}</span>
                              </div>
                              <div className="flex justify-end space-x-2 mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => handleDownloadInvoice(invoice, e)}
                                  leftIcon={<Download size={14} />}
                                >
                                  Download
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                                  leftIcon={<Trash size={14} />}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            
                            {/* Desktop view - table row */}
                            <div className="hidden md:block px-4 py-4 w-32 text-sm text-gray-300">
                              {formatDate(invoice.issueDate as Date)}
                            </div>
                            <div className="hidden md:block px-4 py-4 w-32 text-sm text-white">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="hidden md:block px-4 py-4 flex-1 text-sm text-white">
                              {invoice.clientName}
                            </div>
                            <div className="hidden md:block px-4 py-4 w-32 text-sm font-medium text-white">
                              {formatCurrency(invoice.total)}
                            </div>
                            <div className="hidden md:block px-4 py-4 w-32">
                              <span 
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                              >
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </div>
                            <div className="hidden md:flex px-4 py-4 w-40 justify-end items-center space-x-2" onClick={e => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => handleDownloadInvoice(invoice, e)}
                                leftIcon={<Download size={14} />}
                              >
                                Download
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                                leftIcon={<Trash size={14} />}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recurring">
              {loadingInvoices ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading invoices...</p>
                </div>
              ) : getRecurringInvoices().length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <h3 className="text-xl font-medium text-white mb-2">No Recurring Invoices</h3>
                    <p className="text-gray-400">
                      You haven't set up any recurring invoices yet.
                    </p>
                    <Button 
                      onClick={handleCreateInvoice} 
                      className="mt-6"
                      disabled={isSuspended}
                    >
                      Create Recurring Invoice
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="overflow-x-auto">
                  <Card>
                    <div className="min-w-full divide-y divide-dark-700">
                      <div className="bg-dark-800 hidden md:flex">
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Frequency</div>
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Number</div>
                        <div className="px-4 py-3 flex-1 text-left text-sm font-medium text-gray-400">Client</div>
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Amount</div>
                        <div className="px-4 py-3 w-32 text-left text-sm font-medium text-gray-400">Next Date</div>
                        <div className="px-4 py-3 w-40 text-right text-sm font-medium text-gray-400">Actions</div>
                      </div>
                      
                      <div className="divide-y divide-dark-700">
                        {getRecurringInvoices().map((invoice) => (
                          <div 
                            key={invoice.id} 
                            className="hover:bg-dark-800 cursor-pointer flex flex-wrap md:flex-nowrap"
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            {/* Mobile view - card style */}
                            <div className="p-4 md:hidden w-full">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <span className="text-white font-medium">{invoice.invoiceNumber}</span>
                                  <span className="ml-2 text-primary-500 text-xs uppercase font-medium">
                                    {invoice.recurringFrequency}
                                  </span>
                                </div>
                                <span className="text-white font-medium">{formatCurrency(invoice.total)}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-400">Client: {invoice.clientName}</span>
                                <span className="text-gray-400">Next: {formatDate(invoice.dueDate as Date)}</span>
                              </div>
                              <div className="flex justify-end space-x-2 mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => handleDownloadInvoice(invoice, e)}
                                  leftIcon={<Download size={14} />}
                                >
                                  Download
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                                  leftIcon={<Trash size={14} />}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                            
                            {/* Desktop view - table row */}
                            <div className="hidden md:block px-4 py-4 w-32 text-sm text-gray-300 capitalize">
                              {invoice.recurringFrequency}
                            </div>
                            <div className="hidden md:block px-4 py-4 w-32 text-sm text-white">
                              {invoice.invoiceNumber}
                            </div>
                            <div className="hidden md:block px-4 py-4 flex-1 text-sm text-white">
                              {invoice.clientName}
                            </div>
                            <div className="hidden md:block px-4 py-4 w-32 text-sm font-medium text-white">
                              {formatCurrency(invoice.total)}
                            </div>
                            <div className="hidden md:block px-4 py-4 w-32 text-sm text-gray-300">
                              {formatDate(invoice.dueDate as Date)}
                            </div>
                            <div className="hidden md:flex px-4 py-4 w-40 justify-end items-center space-x-2" onClick={e => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => handleDownloadInvoice(invoice, e)}
                                leftIcon={<Download size={14} />}
                              >
                                Download
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                onClick={(e) => handleDeleteInvoice(invoice.id, e)}
                                leftIcon={<Trash size={14} />}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}