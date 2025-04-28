// src/app/dashboard/invoices/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getInvoiceById, deleteInvoice } from '@/lib/firebase';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ArrowLeft, Download, Trash, Send, MoreHorizontal } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function InvoiceDetailPage() {
  const { isAuthenticated, loading, user, userData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);
  const [deletingInvoice, setDeletingInvoice] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated && user && params?.id) {
      fetchInvoice(params.id as string);
    }
  }, [isAuthenticated, user, params]);

  const fetchInvoice = async (invoiceId: string) => {
    try {
      setLoadingInvoice(true);
      const fetchedInvoice = await getInvoiceById(invoiceId);
      
      if (!fetchedInvoice || fetchedInvoice.userId !== user?.uid) {
        alert('Invoice not found or you do not have permission to view it');
        router.push('/dashboard/invoices');
        return;
      }
      
      setInvoice(fetchedInvoice);
      setLoadingInvoice(false);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setLoadingInvoice(false);
      alert('Failed to load invoice details');
      router.push('/dashboard/invoices');
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoice) return;
    
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        setDeletingInvoice(true);
        await deleteInvoice(invoice.id);
        setDeletingInvoice(false);
        alert('Invoice deleted successfully');
        router.push('/dashboard/invoices');
      } catch (error) {
        console.error('Error deleting invoice:', error);
        setDeletingInvoice(false);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    
    try {
      setDownloadingPdf(true);
      
      // Create PDF document
      const pdf = new jsPDF();
      
      // Add invoice content
      pdf.setFontSize(20);
      pdf.text("INVOICE", 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      // Use user's name instead of "Your Company Name"
      pdf.text(userData?.name || user?.displayName || 'Your Business', 20, 30);
      pdf.text("123 Business St.", 20, 37);
      pdf.text("New York, NY 10001", 20, 44);
      
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
      
      // Notes
      if (invoice.notes) {
        y += 20;
        pdf.setFontSize(12);
        pdf.text("Notes:", 20, y);
        pdf.text(invoice.notes, 20, y + 7);
      }
      
      // Save PDF
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
      
      setDownloadingPdf(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setDownloadingPdf(false);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handleSendInvoice = () => {
    alert('Send invoice functionality would be implemented here');
  };

  if (loading || !isAuthenticated || loadingInvoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Invoice Not Found</h2>
          <p className="text-gray-400 mb-4">The invoice you're looking for does not exist or has been deleted.</p>
          <Button onClick={() => router.push('/dashboard/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  // Get ACH information from user data
  const bankDetails = userData?.bankDetails || null;

  return (
    <div className="min-h-screen bg-dark-950">
      <DashboardSidebar />
      <DashboardHeader />
      
      <main className="pt-24 pb-12 pl-64">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard/invoices')}
                leftIcon={<ArrowLeft size={16} />}
                className="mr-4"
              >
                Back
              </Button>
              <h1 className="text-3xl font-display font-bold">Invoice {invoice.invoiceNumber}</h1>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                leftIcon={<Send size={16} />}
                onClick={handleSendInvoice}
              >
                Send
              </Button>
              <Button 
                variant="outline" 
                leftIcon={<Download size={16} />}
                onClick={handleDownloadPdf}
                isLoading={downloadingPdf}
              >
                Download
              </Button>
              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                leftIcon={<Trash size={16} />}
                onClick={handleDeleteInvoice}
                isLoading={deletingInvoice}
              >
                Delete
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Invoice</h2>
                    <p className="text-gray-400">#{invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400">Invoice date: {formatDate(invoice.issueDate as Date)}</p>
                    <p className="text-gray-400">Payment due date: {formatDate(invoice.dueDate as Date)}</p>
                    {invoice.isRecurring && (
                      <p className="text-primary-500 mt-2">
                        Recurring {invoice.recurringFrequency}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-10 mb-10">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">From</h3>
                    <p className="text-white">{userData?.name || user?.displayName || 'Your Business'}</p>
                    <p className="text-gray-400">{user?.email}</p>
                    <p className="text-gray-400">123 Business St.</p>
                    <p className="text-gray-400">New York, NY 10001</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Bill To</h3>
                    <p className="text-white">{invoice.clientName}</p>
                    {invoice.clientEmail && <p className="text-gray-400">{invoice.clientEmail}</p>}
                    {invoice.clientAddress && <p className="text-gray-400">{invoice.clientAddress}</p>}
                  </div>
                </div>
                
                <table className="w-full mb-10">
                  <thead className="border-t border-b border-dark-700">
                    <tr>
                      <th className="text-left py-3 text-gray-400">Description</th>
                      <th className="text-center py-3 text-gray-400">Quantity</th>
                      <th className="text-center py-3 text-gray-400">Price</th>
                      <th className="text-right py-3 text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-dark-700">
                        <td className="py-3 text-white">{item.description}</td>
                        <td className="py-3 text-center text-white">{item.quantity}</td>
                        <td className="py-3 text-center text-white">{formatCurrency(item.price)}</td>
                        <td className="py-3 text-right text-white">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="flex justify-end">
                  <div className="w-80">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Tax</span>
                      <span className="text-white">{formatCurrency(invoice.tax)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-dark-700 font-semibold">
                      <span className="text-gray-400">Total amount</span>
                      <span className="text-white">{formatCurrency(invoice.total)} USD</span>
                    </div>
                  </div>
                </div>
                
                {invoice.notes && (
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p className="text-gray-400">{invoice.notes}</p>
                  </div>
                )}
                
                <div className="mt-10">
                  <h3 className="text-lg font-semibold mb-2">ACH Instructions</h3>
                  <div className="bg-dark-900 p-4 rounded-lg">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-2 text-gray-400">Bank</td>
                          <td className="py-2 text-white">{bankDetails?.bankName || 'Your Bank Name'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-400">Address</td>
                          <td className="py-2 text-white">{bankDetails?.bankAddress || '123 Bank Street, New York, NY 10001'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-400">Account owner</td>
                          <td className="py-2 text-white">{bankDetails?.accountOwner || userData?.name || user?.displayName || 'Your Business'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-400">Account Type</td>
                          <td className="py-2 text-white">{bankDetails?.accountType ? bankDetails.accountType.charAt(0).toUpperCase() + bankDetails.accountType.slice(1) : 'Checking'}</td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-400">Account Number</td>
                          <td className="py-2 text-white">
                            {bankDetails?.accountNumber 
                              ? "•".repeat(bankDetails.accountNumber.length - 4) + bankDetails.accountNumber.slice(-4) 
                              : '•••• •••• 1234'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-gray-400">Routing/ABA Number</td>
                          <td className="py-2 text-white">{bankDetails?.routingNumber || '021000021'}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-sm text-gray-400 mt-2">
                      * This is a {bankDetails?.accountType ? (bankDetails.accountType.charAt(0).toUpperCase() + bankDetails.accountType.slice(1)) : 'Checking'} account. Payments sent to Savings accounts may be rejected.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}