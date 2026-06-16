'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface IncomeStatement {
  period: { from: string; to: string };
  income: { total: number; details: Array<{ accountName: string; amount: number }> };
  expenses: { total: number; details: Array<{ accountName: string; amount: number }> };
  netProfit: number;
  profitMargin: number;
}

interface BalanceSheet {
  asOfDate: string;
  assets: { total: number; details: Array<{ accountName: string; balance: number }> };
  liabilities: { total: number; details: Array<{ accountName: string; balance: number }> };
  equity: { total: number; details: Array<{ accountName: string; balance: number }> };
  isBalanced: boolean;
}

export default function ReportsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'income' | 'balance'>('income');
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [asOfDate, setAsOfDate] = useState<string>('');
  const [, startTransition] = useTransition();

  const fetchIncomeStatement = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/Reports/income-statement', { params: dateRange });
      setIncomeStatement(response.data);
      setLoading(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Failed to load report:', error);
      toast.error(err.response?.data?.message || 'Unable to load report. Please try again later.');
      setLoading(false);
    }
  }, [dateRange]);

  const fetchBalanceSheet = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/Reports/balance-sheet', { params: { asOfDate } });
      setBalanceSheet(response.data);
      setLoading(false);
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error('Failed to load balance sheet:', error);
      toast.error(err.response?.data?.message || 'Unable to load balance sheet. Please try again later.');
      setLoading(false);
    }
  }, [asOfDate]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      startTransition(() => {
        setDateRange({ startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
        setAsOfDate(end.toISOString().split('T')[0]);
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && dateRange.startDate && dateRange.endDate && activeTab === 'income') {
      startTransition(() => {
        fetchIncomeStatement();
      });
    }
    if (isAuthenticated && asOfDate && activeTab === 'balance') {
      startTransition(() => {
        fetchBalanceSheet();
      });
    }
  }, [isAuthenticated, dateRange, activeTab, asOfDate, fetchIncomeStatement, fetchBalanceSheet]);

  const handleExport = async (type: string) => {
    try {
      const urls: Record<string, string> = {
        products: '/Export/products/excel',
        inventory: '/Export/inventory-summary/excel',
        sales: `/Export/sales/csv?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      };
      const response = await api.get(urls[type], { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.${type === 'sales' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch {
      toast.error('Export failed');
    }
  };

  if (isLoading || loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 border-l-2 border-transparent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-bold text-gray-900">Reports</h1><p className="text-gray-600 mt-1">Financial statements</p></div>
        <div className="flex space-x-2">
          <button onClick={() => handleExport('products')} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><DocumentArrowDownIcon className="h-5 w-5" /><span>Products</span></button>
          <button onClick={() => handleExport('inventory')} className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"><DocumentArrowDownIcon className="h-5 w-5" /><span>Inventory</span></button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('income')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'income' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Income Statement</button>
          <button onClick={() => setActiveTab('balance')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'balance' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Balance Sheet</button>
        </nav>
      </div>

      {activeTab === 'income' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-white p-4 rounded-lg shadow-sm">
            <label className="text-sm font-medium">Date Range:</label>
            <div className="flex items-center space-x-2">
              <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />
              <span>to</span>
              <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
            <button onClick={() => handleExport('sales')} className="ml-auto flex items-center space-x-2 px-3 py-1 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors">Export CSV</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Total Income</p><p className="text-2xl font-bold text-green-600">${incomeStatement?.income.total.toLocaleString() || 0}</p></div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Total Expenses</p><p className="text-2xl font-bold text-red-600">${incomeStatement?.expenses.total.toLocaleString() || 0}</p></div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Net Profit</p><p className="text-2xl font-bold text-yellow-600">${incomeStatement?.netProfit.toLocaleString() || 0}</p><p className="text-sm">Margin: {incomeStatement?.profitMargin || 0}%</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow">
              <div className="p-4 border-b bg-green-50"><h3 className="font-semibold text-green-800">Income</h3></div>
              <div className="divide-y">
                {incomeStatement?.income.details.map((item, i) => <div key={i} className="flex justify-between p-4"><span>{item.accountName}</span><span className="text-green-600">${item.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between p-4 bg-gray-50 font-semibold"><span>Total Income</span><span>${incomeStatement?.income.total.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow">
              <div className="p-4 border-b bg-red-50"><h3 className="font-semibold text-red-800">Expenses</h3></div>
              <div className="divide-y">
                {incomeStatement?.expenses.details.map((item, i) => <div key={i} className="flex justify-between p-4"><span>{item.accountName}</span><span className="text-red-600">${item.amount.toLocaleString()}</span></div>)}
                <div className="flex justify-between p-4 bg-gray-50 font-semibold"><span>Total Expenses</span><span>${incomeStatement?.expenses.total.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'balance' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-white p-4 rounded-lg shadow-sm">
            <label className="text-sm font-medium">As of Date:</label>
            <div className="flex items-center space-x-2">
              <input type="date" value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Total Assets</p><p className="text-2xl font-bold text-blue-600">${balanceSheet?.assets.total.toLocaleString() || 0}</p></div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Total Liabilities</p><p className="text-2xl font-bold text-orange-600">${balanceSheet?.liabilities.total.toLocaleString() || 0}</p></div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Total Equity</p><p className="text-2xl font-bold text-purple-600">${balanceSheet?.equity.total.toLocaleString() || 0}</p><p className={`text-sm ${balanceSheet?.isBalanced ? 'text-green-600' : 'text-red-600'}`}>{balanceSheet?.isBalanced ? 'Balanced' : 'Not Balanced'}</p></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow">
              <div className="p-4 border-b bg-blue-50"><h3 className="font-semibold text-blue-800">Assets</h3></div>
              <div className="divide-y">
                {balanceSheet?.assets.details.map((item, i) => <div key={i} className="flex justify-between p-4"><span>{item.accountName}</span><span className="text-blue-600">${item.balance.toLocaleString()}</span></div>)}
                <div className="flex justify-between p-4 bg-gray-50 font-semibold"><span>Total Assets</span><span>${balanceSheet?.assets.total.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow">
              <div className="p-4 border-b bg-orange-50"><h3 className="font-semibold text-orange-800">Liabilities</h3></div>
              <div className="divide-y">
                {balanceSheet?.liabilities.details.map((item, i) => <div key={i} className="flex justify-between p-4"><span>{item.accountName}</span><span className="text-orange-600">${item.balance.toLocaleString()}</span></div>)}
                <div className="flex justify-between p-4 bg-gray-50 font-semibold"><span>Total Liabilities</span><span>${balanceSheet?.liabilities.total.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow">
              <div className="p-4 border-b bg-purple-50"><h3 className="font-semibold text-purple-800">Equity</h3></div>
              <div className="divide-y">
                {balanceSheet?.equity.details.map((item, i) => <div key={i} className="flex justify-between p-4"><span>{item.accountName}</span><span className="text-purple-600">${item.balance.toLocaleString()}</span></div>)}
                <div className="flex justify-between p-4 bg-gray-50 font-semibold"><span>Total Equity</span><span>${balanceSheet?.equity.total.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}