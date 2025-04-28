// src/app/admin/invoices/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Search, Filter, Download, Trash, Eye } from 'lucide-react';
import { collection, getDocs, doc, getDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Invoice } from '@/types';
import { jsPDF } from 'jspdf';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
  ];
  
  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);
  
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // Create query
      let invoicesQuery = collection(db, "invoices");
      
      // Add filters if needed
      const queryConstraints = [];
      
      if (statusFilter !== 'all') {
        queryConstraints.push(where('status', '==', statusFilter));
      }
      
      // Add ordering
      queryConstraints.push(orderBy('createdAt', 'desc'));
      
      // Execute query
      const q = query(invoicesQuery, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      // Process results
      const invoicesData = await Promise.all(querySnapshot.docs.map(async (document) => {
        const data = { id: document.id, ...document.data() } as Invoice;
        
        // Get user info
        if (data.userId) {
          const userDocRef = doc(db, 'users', data.userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            data.user = { id: userDocSnap.id, ...userDocSnap.data() };
          }
        }
        
        return data;
      }));
      
      setInvoices(invoicesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setLoading(false);
    }
  };
  
  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      // Create PDF document
      const pdf = new jsPDF();
      
      // Add invoice content
      pdf.setFontSize(20);
      pdf.text("INVOICE", 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.text(invoice.user?.name || "Client", 20, 30);
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
      
      // Save PDF
      pdf.save(`invoice-${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to download invoice. Please try again.");
    }
  };
  
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, "invoices", invoiceId));
        
        // Update local state
        setInvoices(invoices.filter(inv => inv.id !== invoiceId));
        
        if (selectedInvoice?.id === invoiceId) {
          setSelectedInvoice(null);
          setShowDetails(false);
        }
        
        alert('Invoice deleted successfully');
      } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice. Please try again.");
      }
    }
  };
  
  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };
  
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      (invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (invoice.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (invoice.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    return matchesSearch;
  });

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-6">Invoice Management</h1>
      
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search invoices..." 
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
              onClick={fetchInvoices}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading invoices...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-lg">
          <p className="text-gray-400">No invoices found</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-700">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Invoice #</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">User</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Client</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400 w-36">Amount</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-400 w-48">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-dark-800">
                      <td className="p-4 text-sm text-gray-300">
                        {formatDate(invoice.issueDate as Date)}
                      </td>
                      <td className="p-4 text-sm text-white">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-white">{invoice.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{invoice.user?.email || 'No email'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-white">
                        {invoice.clientName}
                      </td>
                      <td className="p-4 text-sm font-medium text-white text-right">
                        {formatCurrency(invoice.total)} USD
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => viewInvoiceDetails(invoice)}
                            leftIcon={<Eye size={14} />}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
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
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative">
              <CardTitle>Invoice Details</CardTitle>
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                onClick={() => setShowDetails(false)}
              >
                &times;
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Invoice</h2>
                  <p className="text-gray-400">#{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400">Invoice date: {formatDate(selectedInvoice.issueDate as Date)}</p>
                  <p className="text-gray-400">Payment due date: {formatDate(selectedInvoice.dueDate as Date)}</p>
                  {selectedInvoice.isRecurring && (
                    <p className="text-primary-500 mt-2">
                      Recurring {selectedInvoice.recurringFrequency}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-10 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">From</h3>
                  <p className="text-white">{selectedInvoice.user?.name || 'Unknown User'}</p>
                  <p className="text-gray-400">{selectedInvoice.user?.email || 'No email'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Bill To</h3>
                  <p className="text-white">{selectedInvoice.clientName}</p>
                  {selectedInvoice.clientEmail && <p className="text-gray-400">{selectedInvoice.clientEmail}</p>}
                  {selectedInvoice.clientAddress && <p className="text-gray-400">{selectedInvoice.clientAddress}</p>}
                </div>
              </div>
              
              <table className="w-full mb-6">
                <thead className="border-t border-b border-dark-700">
                  <tr>
                    <th className="text-left py-3 text-gray-400">Description</th>
                    <th className="text-center py-3 text-gray-400">Quantity</th>
                    <th className="text-center py-3 text-gray-400">Price</th>
                    <th className="text-right py-3 text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item) => (
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
                    <span className="text-white">{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Tax</span>
                    <span className="text-white">{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-dark-700 font-semibold">
                    <span className="text-gray-400">Total amount</span>
                    <span className="text-white">{formatCurrency(selectedInvoice.total)} USD</span>
                  </div>
                </div>
              </div>
              
              {selectedInvoice.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-gray-400">{selectedInvoice.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <div className="space-x-3">
                  <Button
                    variant="outline"
                    leftIcon={<Download size={16} />}
                    onClick={() => handleDownloadInvoice(selectedInvoice)}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    leftIcon={<Trash size={16} />}
                    onClick={() => {
                      handleDeleteInvoice(selectedInvoice.id);
                      setShowDetails(false);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}