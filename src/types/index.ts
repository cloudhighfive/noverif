// src/types/index.ts
import { Timestamp } from 'firebase/firestore';

export interface ACHBankDetails {
  bankName: string;
  bankAddress: string;
  accountOwner: string;
  accountType: string; // 'checking' | 'savings'
  accountNumber: string;
  routingNumber: string; // ABA number
  swiftCode?: string; // Optional for international transfers
}

export interface ACHApplication {
  id: string;
  userId: string;
  businessName?: string;
  purpose: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  approvedAt?: Date | Timestamp;
  completedAt?: Date | Timestamp;
  rejectedAt?: Date | Timestamp;
  adminNotes?: string;
  bankDetails?: ACHBankDetails;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date | Timestamp;  // Using imported Timestamp type
  updatedAt?: Date | Timestamp;
  virtualBankStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  virtualBankCreatedAt?: Date | Timestamp;
  virtualBankCompletedAt?: Date | Timestamp;
  wallets: WalletInfo[];
  bankDetails?: ACHBankDetails;
  suspended?: boolean;
  applications?: any[];
}

export interface WalletInfo {
  type: string;
  address: string;
  name: string;
  connectedAt?: Date | Timestamp;
}

export interface Transaction {
  id: string;
  userId: string;
  date: Date | Timestamp;
  amount: number;
  fromSource: string;
  toDestination: string;
  purpose: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'crypto' | 'ach' | 'bank';
  cryptoType?: string; // For crypto transactions (BTC, ETH, etc.)
  transactionHash?: string; // Add this for blockchain transaction hash
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  notes?: string; // Admin notes (not visible to user)
}

export interface TransactionFilter {
  status?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// New Notification interface
export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'transaction' | 'ach' | 'system';
  read: boolean;
  createdAt: Date | Timestamp;
  relatedId?: string; // ID of related transaction or application
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  userId: string;
  user?: any; // For admin views
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  issueDate: Date | Timestamp;
  dueDate: Date | Timestamp;
  items: InvoiceItem[];
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
}