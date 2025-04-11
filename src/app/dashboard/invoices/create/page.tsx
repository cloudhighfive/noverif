// src/app/dashboard/invoices/create/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { useAuth } from '@/hooks/useAuth';
import { createInvoice } from '@/lib/firebase';
import { InvoiceItem } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { ChevronLeft, Trash, Plus, Upload, ArrowLeft, Eye, Download } from 'lucide-react';

export default function CreateInvoicePage() {
  const { isAuthenticated, loading, user, userData, isSuspended } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, price: 0, amount: 0 }
  ]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [confirmNotOwnFunds, setConfirmNotOwnFunds] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Generate invoice number
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
  }, []);

  // Calculate subtotal, tax, and total
  const subtotal = items.reduce((acc, item) => acc + item.amount, 0);
  const tax = 0; // You can implement tax calculation if needed
  const total = subtotal + tax;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        price: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount when quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updatedItem.quantity = typeof updatedItem.quantity === 'string' 
            ? parseFloat(updatedItem.quantity) || 0 
            : updatedItem.quantity;
            
          updatedItem.price = typeof updatedItem.price === 'string' 
            ? parseFloat(updatedItem.price) || 0 
            : updatedItem.price;
            
          updatedItem.amount = updatedItem.quantity * updatedItem.price;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    if (isSuspended) {
      alert('Your account is suspended. You cannot create invoices at this time.');
      return;
    }
    
    if (!clientName) {
      alert('Please select a client');
      return;
    }
    
    if (items.some(item => !item.description || item.quantity <= 0)) {
      alert('Please fill in all line items with valid descriptions and quantities');
      return;
    }
    
    if (total <= 0) {
      alert('Invoice total must be greater than zero');
      return;
    }
    
    if (isRecurring && !confirmNotOwnFunds) {
      alert('Please confirm that funds are not coming from your own account');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const invoiceData = {
        invoiceNumber,
        clientName,
        clientEmail,
        clientAddress,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        notes,
        items,
        subtotal,
        tax,
        total,
        status: 'draft' as const,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined
      };
      
      const invoiceId = await createInvoice(user.uid, invoiceData);
      
      setIsSubmitting(false);
      alert('Invoice created successfully!');
      router.push(`/dashboard/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      setIsSubmitting(false);
      alert('Failed to create invoice. Please try again.');
    }
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/dashboard/invoices');
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
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/invoices')}
              leftIcon={<ArrowLeft size={16} />}
              className="mr-4"
            >
              Back
            </Button>
            <h1 className="text-3xl font-display font-bold">
              {previewMode ? 'Preview Invoice' : 'Create Invoice'}
            </h1>
          </div>
          
          {previewMode ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between mb-10">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Invoice</h2>
                      <p className="text-gray-400">#{invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Invoice date: {issueDate}</p>
                      <p className="text-gray-400">Payment due date: {dueDate}</p>
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
                      <p className="text-white">{clientName}</p>
                      {clientEmail && <p className="text-gray-400">{clientEmail}</p>}
                      {clientAddress && <p className="text-gray-400">{clientAddress}</p>}
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
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-dark-700">
                          <td className="py-3 text-white">{item.description || 'Item description'}</td>
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
                        <span className="text-white">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-t border-dark-700 font-semibold">
                        <span className="text-gray-400">Total amount</span>
                        <span className="text-white">{formatCurrency(total)} USD</span>
                      </div>
                    </div>
                  </div>
                  
                  {notes && (
                    <div className="mt-10">
                      <h3 className="text-lg font-semibold mb-2">Notes</h3>
                      <p className="text-gray-400">{notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold mb-2">ACH Instructions</h3>
                    <div className="bg-dark-900 p-4 rounded-lg">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="py-2 text-gray-400">Bank</td>
                            <td className="py-2 text-white">{userData?.bankDetails?.bankName || 'Your Bank Name'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-gray-400">Address</td>
                            <td className="py-2 text-white">{userData?.bankDetails?.bankAddress || '123 Bank Street, New York, NY 10001'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-gray-400">Account owner</td>
                            <td className="py-2 text-white">{userData?.bankDetails?.accountOwner || userData?.name || user?.displayName || 'Your Business'}</td>
                          </tr>
                          <tr>
                            <td className="py-2 text-gray-400">Account Type</td>
                            <td className="py-2 text-white">
                              {userData?.bankDetails?.accountType 
                                ? userData.bankDetails.accountType.charAt(0).toUpperCase() + userData.bankDetails.accountType.slice(1) 
                                : 'Checking'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-gray-400">Account Number</td>
                            <td className="py-2 text-white">
                              {userData?.bankDetails?.accountNumber 
                                ? "•".repeat(userData.bankDetails.accountNumber.length - 4) + userData.bankDetails.accountNumber.slice(-4) 
                                : '•••• •••• 1234'}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 text-gray-400">Routing/ABA Number</td>
                            <td className="py-2 text-white">{userData?.bankDetails?.routingNumber || '021000021'}</td>
                          </tr>
                        </tbody>
                      </table>
                      <p className="text-sm text-gray-400 mt-2">
                        * This is a {userData?.bankDetails?.accountType 
                          ? userData.bankDetails.accountType.charAt(0).toUpperCase() + userData.bankDetails.accountType.slice(1) 
                          : 'Checking'} account. Payments sent to Savings accounts may be rejected.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={handlePreview}
                  leftIcon={<ArrowLeft size={16} />}
                >
                  Back to Edit
                </Button>
                <div className="space-x-3">
                  <Button 
                    variant="secondary"
                    leftIcon={<Download size={16} />}
                  >
                    Download
                  </Button>
                  <Button 
                    type="submit"
                    onClick={handleSubmit}
                    isLoading={isSubmitting}
                  >
                    Create Invoice
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Select the client that you want to invoice</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      label="Select client"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                      required
                    />
                    <Input
                      label="Client email (optional)"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="client@example.com"
                    />
                    <Input
                      label="Client address (optional)"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      placeholder="Enter client address"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Invoice details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Input
                        label="Invoice number"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end items-center">
                      <Button
                        type="button"
                        variant="outline"
                        leftIcon={<Upload size={16} />}
                      >
                        Upload your logo (optional)
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Dropdown
                      label="Frequency"
                      options={[
                        { value: 'one-time', label: 'One time' },
                        { value: 'recurring', label: 'Recurring' }
                      ]}
                      value={isRecurring ? 'recurring' : 'one-time'}
                      onChange={(value) => setIsRecurring(value === 'recurring')}
                    />
                  </div>

                  {isRecurring && (
                    <div className="mt-4">
                      <Dropdown
                        label="Recurring frequency"
                        options={[
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'quarterly', label: 'Quarterly' },
                          { value: 'yearly', label: 'Yearly' }
                        ]}
                        value={recurringFrequency}
                        onChange={(value) => setRecurringFrequency(value as 'monthly' | 'quarterly' | 'yearly')}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Input
                      label="Invoice date"
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      required
                    />
                    <Input
                      label="Payment due date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Message or additional notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="block w-full rounded-lg border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:border-primary-500 focus:ring-primary-500"
                      rows={4}
                      placeholder="Optional"
                    ></textarea>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Line items</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead className="bg-dark-900">
                      <tr>
                        <th className="text-left p-2 text-sm font-medium text-gray-400">Description</th>
                        <th className="text-left p-2 text-sm font-medium text-gray-400 w-24">Quantity</th>
                        <th className="text-left p-2 text-sm font-medium text-gray-400 w-32">Price</th>
                        <th className="text-left p-2 text-sm font-medium text-gray-400 w-32">Amount</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-dark-800">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              className="w-full rounded-lg border-dark-700 bg-dark-800 text-white focus:border-primary-500 focus:ring-primary-500"
                              placeholder="Enter item description"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-lg border-dark-700 bg-dark-800 text-white focus:border-primary-500 focus:ring-primary-500"
                              min="1"
                              step="1"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-lg border-dark-700 bg-dark-800 text-white focus:border-primary-500 focus:ring-primary-500"
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="p-2">
                            <div className="w-full rounded-lg border border-dark-700 bg-dark-800 text-white px-3 py-2">
                              {formatCurrency(item.amount)}
                            </div>
                          </td>
                          <td className="p-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-400"
                              disabled={items.length <= 1}
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddItem}
                      leftIcon={<Plus size={16} />}
                      fullWidth
                    >
                      Add an item
                    </Button>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <div className="w-80">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="text-white">{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-400">Tax</span>
                        <span className="text-white">{formatCurrency(tax)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-t border-dark-700 font-semibold">
                        <span className="text-gray-400">Total amount</span>
                        <span className="text-white">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isRecurring && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="confirmFunds"
                        checked={confirmNotOwnFunds}
                        onChange={(e) => setConfirmNotOwnFunds(e.target.checked)}
                        className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-600 rounded"
                      />
                      <label htmlFor="confirmFunds" className="ml-2 text-white">
                        I confirm funds are not coming from my own account
                      </label>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <div className="space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    leftIcon={<Eye size={16} />}
                  >
                    Preview
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Create Invoice
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}