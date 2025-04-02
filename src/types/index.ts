// src/types/index.ts
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
  createdAt: Date;
  updatedAt?: Date;
  approvedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  adminNotes?: string;
  bankDetails?: ACHBankDetails;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt?: Date;
  virtualBankStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  virtualBankCreatedAt?: Date;
  virtualBankCompletedAt?: Date;
  wallets: WalletInfo[];
  bankDetails?: ACHBankDetails;
}

export interface WalletInfo {
  type: string;
  address: string;
  name: string;
  connectedAt?: Date;
}


export interface Transaction {
  id: string;
  userId: string;
  date: Date;
  amount: number;
  fromSource: string;
  toDestination: string;
  purpose: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'crypto' | 'ach' | 'bank';
  cryptoType?: string; // For crypto transactions (BTC, ETH, etc.)
  createdAt: Date;
  updatedAt?: Date;
  notes?: string; // Admin notes (not visible to user)
}

export interface TransactionFilter {
  status?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
}