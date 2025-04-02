// src/lib/invoiceGenerator.ts
"use client";

import { jsPDF } from 'jspdf';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, collection, setDoc } from 'firebase/firestore';

export const generateInvoice = async (
  invoiceData = {
    items: [{ description: 'Service', quantity: 1, price: 100 }],
    subtotal: 100,
    tax: 0,
    total: 100,
    notes: 'Thank you for your business!'
  }
) => {
  // Get the current user
  const auth = useAuth();
  if (!auth.user) throw new Error("User not authenticated");
  
  const userId = auth.user.uid;
  const userData = auth.userData || {};
  
  // Create a new PDF document
  const pdf = new jsPDF();
  
  // Add invoice content
  pdf.setFontSize(20);
  pdf.text("INVOICE", 105, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text("SwiftPay Inc.", 20, 30);
  pdf.text("123 Crypto Street", 20, 37);
  pdf.text("San Francisco, CA 94105", 20, 44);
  
  pdf.text(`Invoice #: INV-${Date.now().toString().slice(-6)}`, 140, 30);
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 140, 37);
  
  pdf.text("Bill To:", 20, 60);
  pdf.text(`${userData.name || 'Client'}`, 20, 67);
  pdf.text(`${userData.email || ''}`, 20, 74);
  pdf.text(`${userData.address || ''}`, 20, 81);
  
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
  invoiceData.items.forEach(item => {
    pdf.text(item.description, 25, y);
    pdf.text(item.quantity.toString(), 100, y);
    pdf.text(`$${item.price.toFixed(2)}`, 130, y);
    pdf.text(`$${(item.quantity * item.price).toFixed(2)}`, 160, y);
    y += 10;
  });
  
  // Totals
  y += 10;
  pdf.text("Subtotal:", 130, y);
  pdf.text(`$${invoiceData.subtotal.toFixed(2)}`, 160, y);
  
  y += 7;
  pdf.text("Tax:", 130, y);
  pdf.text(`$${invoiceData.tax.toFixed(2)}`, 160, y);
  
  y += 7;
  pdf.line(130, y, 170, y);
  
  y += 7;
  pdf.setFontSize(14);
  pdf.text("Total:", 130, y);
  pdf.text(`$${invoiceData.total.toFixed(2)}`, 160, y);
  
  // Notes
  y += 20;
  pdf.setFontSize(12);
  pdf.text("Notes:", 20, y);
  pdf.text(invoiceData.notes, 20, y + 7);
  
  // Save invoice to Firestore
  const invoiceRef = doc(collection(db, "invoices"));
  await setDoc(invoiceRef, {
    userId,
    createdAt: new Date(),
    status: "pending",
    amount: invoiceData.total,
    items: invoiceData.items,
    notes: invoiceData.notes,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
  });
  
  // Save and download the PDF
  pdf.save(`invoice-${Date.now()}.pdf`);
  
  return {
    id: invoiceRef.id,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`
  };
};