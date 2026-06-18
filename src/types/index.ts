export interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  expectedRevenue: number;
  totalCost: number;
  potentialProfit: number;
  profitMargin: number;
  isLowStock: boolean;
  lowStockThreshold: number;
  imageUrl?: string | null;
  sku?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  isOverdue: boolean;
}

export interface DashboardStats {
  inventory: {
    totalProducts: number;
    totalInventoryValue: number;
    totalExpectedRevenue: number;
    lowStockCount: number;
    lowStockProducts: Array<{ id: number; name: string; quantity: number; lowStockThreshold: number }>;
  };
  tasks: {
    pending: number;
    completed: number;
    completionRate: number;
  };
  accounting: {
    income: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
  };
}

export interface IncomeStatement {
  period: { from: string; to: string };
  income: { total: number; details: Array<{ accountName: string; amount: number }> };
  expenses: { total: number; details: Array<{ accountName: string; amount: number }> };
  netProfit: number;
  isProfit: boolean;
  profitMargin: number;
}

export interface BalanceSheet {
  asOfDate: string;
  assets: { total: number; details: Array<{ accountName: string; balance: number }> };
  liabilities: { total: number; details: Array<{ accountName: string; balance: number }> };
  equity: { total: number; details: Array<{ accountName: string; balance: number }> };
  isBalanced: boolean;
  totalLiabilitiesAndEquity?: number;
}

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
export type EntryType = 'DEBIT' | 'CREDIT';

export interface Account {
  id: number;
  accountCode: string;
  name: string;
  type: string;
  normalSide: 'DEBIT' | 'CREDIT' | string;
  parentAccountId?: number | null;
  parentAccountName?: string | null;
  balance: number;
  createdAt: string;
  isActive: boolean;
  updatedAt?: string | null;
}

export interface JournalEntryLine {
  id: number;
  accountId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  lineDescription?: string | null;
  referenceNumber?: string | null;
  taxAmount: number;
  totalAmount: number;
}

export interface JournalEntry {
  id: number;
  entryNumber: string;
  entryDate: string;
  description?: string;
  lines: JournalEntryLine[];
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
}

export interface CreateJournalEntryDto {
  entryDate: string;
  description: string;
  lines: Array<{
    accountId: number;
    debit: number;
    credit: number;
    lineDescription?: string;
    referenceNumber?: string;
    taxAmount?: number;
  }>;
}
