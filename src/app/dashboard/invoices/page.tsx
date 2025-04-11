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
import { Search, Plus, Download, Trash, MoreHorizontal } from 'lucide-react';
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
      // Create PDF document
      const pdf = new jsPDF();
      
      // Add invoice content
      pdf.setFontSize(20);
      pdf.text("INVOICE", 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(userData?.name || 'Your Business', 20, 30); // Use user's name
      pdf.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 30);
      pdf.text(`Date: ${formatDate(invoice.issueDate as Date)}`, 140, 37);
      pdf.text(`Due: ${formatDate(invoice.dueDate as Date)}`, 140, 44);
      
      pdf.text("Bill To:", 20, 60);
      pdf.text(`${invoice.clientName}`, 20, 67);
      if (invoice.clientEmail) pdf.text(`${invoice.clientEmail}`, 20, 74);
      if (invoice.clientAddress) pdf.text(`${invoice.clientAddress}`, 20, 81);
      
      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(20, 95, 170, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.text("Description", 25, 102);
      pdf.text("Quantity", 100, 102);
      pdf.text("Price", 130, 102);
      pdf.text("Amount", 160, 102);
      
      // Table content
      let y = 115;
      invoice.items.forEach(item => {
        pdf.text(item.description, 25, y);
        pdf.text(item.quantity.toString(), 100, y);
        pdf.text(`$${item.price.toFixed(2)}`, 130, y);
        pdf.text(`$${item.amount.toFixed(2)}`, 160, y);
        y += 10;
      });
      
      // Totals
      y += 10;
      pdf.text("Subtotal:", 130, y);
      pdf.text(`$${invoice.subtotal.toFixed(2)}`, 160, y);
      
      y += 7;
      pdf.text("Tax:", 130, y);
      pdf.text(`$${invoice.tax.toFixed(2)}`, 160, y);
      
      y += 7;
      pdf.line(130, y, 170, y);
      
      y += 7;
      pdf.setFontSize(14);
      pdf.text("Total:", 130, y);
      pdf.text(`$${invoice.total.toFixed(2)}`, 160, y);
      
      // Save PDF
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
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

  const handleDeleteInvoice = async (invoiceId: string) => {
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
      
      <main className="pt-24 pb-12 pl-64">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-display font-bold">Invoices</h1>
            <Button 
              onClick={handleCreateInvoice}
              leftIcon={<Plus size={16} />}
              disabled={isSuspended}
            >
              Create Invoice
            </Button>
          </div>
          
          <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="history">Invoice History</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Invoices</TabsTrigger>
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
                <Card>
                  <table className="w-full">
                    <thead className="border-b border-dark-700">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Number</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Total</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
                        <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                      {getNonRecurringInvoices().map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-dark-800 cursor-pointer" onClick={() => handleViewInvoice(invoice.id)}>
                          <td className="p-4 text-sm text-gray-300">
                            {formatDate(invoice.issueDate as Date)}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {invoice.clientName}
                          </td>
                          <td className="p-4 text-sm font-medium text-white">
                            {formatCurrency(invoice.total)} USD
                          </td>
                          <td className="p-4">
                            <span 
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
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
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                leftIcon={<Trash size={14} />}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
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
                <Card>
                  <table className="w-full">
                    <thead className="border-b border-dark-700">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Frequency</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Number</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-400">Next Date</th>
                        <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                      {getRecurringInvoices().map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-dark-800 cursor-pointer" onClick={() => handleViewInvoice(invoice.id)}>
                          <td className="p-4 text-sm text-gray-300 capitalize">
                            {invoice.recurringFrequency}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="p-4 text-sm text-white">
                            {invoice.clientName}
                          </td>
                          <td className="p-4 text-sm font-medium text-white">
                            {formatCurrency(invoice.total)} USD
                          </td>
                          <td className="p-4 text-sm text-gray-300">
                            {formatDate(invoice.dueDate as Date)}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end space-x-2" onClick={e => e.stopPropagation()}>
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
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                leftIcon={<Trash size={14} />}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}