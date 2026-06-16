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
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
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
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
export type EntryType = 'DEBIT' | 'CREDIT';

export interface Account {
  id: number;
  name: string;
  code: string;
  type: AccountType;
  description?: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JournalEntryLine {
  id: number;
  accountId: number;
  accountName?: string;
  type: EntryType;
  amount: number;
}

export interface JournalEntry {
  id: number;
  date: string;
  description?: string;
  reference?: string;
  lines: JournalEntryLine[];
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateJournalEntryDto {
  date: string;
  description?: string;
  reference?: string;
  lines: Array<{
    accountId: number;
    type: EntryType;
    amount: number;
  }>;
}