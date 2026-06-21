'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeReport, setActiveReport] = useState<string>('income-statement');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateFilters, setDateFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const fetchReport = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      let endpoint = '';
      let params: any = {};
      
      switch (activeReport) {
        case 'income-statement':
          endpoint = '/api/reports/income-statement';
          params = { startDate: dateFilters.startDate, endDate: dateFilters.endDate };
          break;
        case 'balance-sheet':
          endpoint = '/api/reports/balance-sheet';
          params = { asOfDate: dateFilters.endDate };
          break;
        case 'trial-balance':
          endpoint = '/api/reports/trial-balance';
          params = { asOfDate: dateFilters.endDate };
          break;
        case 'inventory-summary':
          endpoint = '/api/reports/inventory-summary';
          break;
      }
      
      const response = await api.get(endpoint, { params });
      setReportData(response.data);
    } catch (error) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeReport, dateFilters]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const renderIncomeStatement = () => {
    if (!reportData) return null;
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Income Statement</h2>
        <p className="text-gray-600 mb-4">
          Period: {new Date(reportData.Period.From).toLocaleDateString()} - {new Date(reportData.Period.To).toLocaleDateString()}
        </p>
        
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-green-600 mb-2">Revenue</h3>
          <table className="w-full mb-4">
            <tbody>
              {reportData.Income.Details.map((item: any) => (
                <tr key={item.AccountId}>
                  <td className="py-2">{item.AccountName}</td>
                  <td className="text-right py-2">${item.Amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total Revenue</span>
            <span>${reportData.Income.Total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Expenses</h3>
          <table className="w-full mb-4">
            <tbody>
              {reportData.Expenses.Details.map((item: any) => (
                <tr key={item.AccountId}>
                  <td className="py-2">{item.AccountName}</td>
                  <td className="text-right py-2">${item.Amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total Expenses</span>
            <span>${reportData.Expenses.Total.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl">
          <div className="flex justify-between text-2xl font-bold">
            <span>Net {reportData.IsProfit ? 'Profit' : 'Loss'}</span>
            <span className={reportData.IsProfit ? 'text-green-600' : 'text-red-600'}>
              ${reportData.NetProfit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Profit Margin</span>
            <span>{reportData.ProfitMargin}%</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!reportData) return null;
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Balance Sheet</h2>
        <p className="text-gray-600 mb-4">
          As of: {new Date(reportData.AsOfDate).toLocaleDateString()}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Assets</h3>
            <table className="w-full">
              <tbody>
                {reportData.Assets.Details.map((item: any) => (
                  <tr key={item.Id}>
                    <td className="py-2">{item.AccountName}</td>
                    <td className="text-right py-2">${item.Balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total Assets</span>
              <span>${reportData.Assets.Total.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-orange-600 mb-4">Liabilities</h3>
            <table className="w-full">
              <tbody>
                {reportData.Liabilities.Details.map((item: any) => (
                  <tr key={item.Id}>
                    <td className="py-2">{item.AccountName}</td>
                    <td className="text-right py-2">${item.Balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total Liabilities</span>
              <span>${reportData.Liabilities.Total.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-purple-600 mb-4">Equity</h3>
            <table className="w-full">
              <tbody>
                {reportData.Equity.Details.map((item: any) => (
                  <tr key={item.Id}>
                    <td className="py-2">{item.AccountName}</td>
                    <td className="text-right py-2">${item.Balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total Equity</span>
              <span>${reportData.Equity.Total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`mt-6 p-4 rounded-xl ${reportData.IsBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex justify-between font-bold">
            <span>Total Assets</span>
            <span>${reportData.Assets.Total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Liabilities + Equity</span>
            <span>${reportData.TotalLiabilitiesAndEquity.toLocaleString()}</span>
          </div>
          <div className="text-center mt-2 font-semibold">
            {reportData.IsBalanced ? '✅ Balance Sheet is balanced!' : '❌ Balance Sheet is not balanced!'}
          </div>
        </div>
      </div>
    );
  };

  const renderTrialBalance = () => {
    if (!reportData) return null;
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Trial Balance</h2>
        <p className="text-gray-600 mb-4">
          As of: {new Date(reportData.AsOfDate).toLocaleDateString()}
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4">Account</th>
                <th className="text-right py-3 px-4">Debits</th>
                <th className="text-right py-3 px-4">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from(reportData.Accounts).map((item: any) => (
                <tr key={item.Account}>
                  <td className="py-3 px-4">{item.Account}</td>
                  <td className="text-right py-3 px-4">${item.Debit.toLocaleString()}</td>
                  <td className="text-right py-3 px-4">${item.Credit.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td className="py-3 px-4">Total</td>
                <td className="text-right py-3 px-4">${reportData.Totals.Debits.toLocaleString()}</td>
                <td className="text-right py-3 px-4">${reportData.Totals.Credits.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className={`mt-6 p-4 rounded-xl ${reportData.Totals.IsBalanced ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="text-center font-semibold">
            {reportData.Totals.IsBalanced ? '✅ Trial Balance is balanced!' : '❌ Trial Balance is not balanced!'}
          </div>
        </div>
      </div>
    );
  };

  const renderInventorySummary = () => {
    if (!reportData) return null;
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Inventory Summary</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-2xl font-bold">{reportData.Summary.TotalProducts}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm">Total Quantity</p>
            <p className="text-2xl font-bold">{reportData.Summary.TotalQuantity.toLocaleString()}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm">Inventory Value</p>
            <p className="text-2xl font-bold">${reportData.Summary.TotalInventoryValue.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-gray-600 text-sm">Potential Profit</p>
            <p className="text-2xl font-bold text-purple-600">${reportData.Summary.TotalPotentialProfit.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Top Products by Potential Profit</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-right py-3 px-4">Quantity</th>
                  <th className="text-right py-3 px-4">Cost Price</th>
                  <th className="text-right py-3 px-4">Selling Price</th>
                  <th className="text-right py-3 px-4">Potential Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.TopProducts.map((product: any) => (
                  <tr key={product.Id}>
                    <td className="py-3 px-4">{product.Name}</td>
                    <td className="text-right py-3 px-4">{product.Quantity.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">${product.CostPrice.toFixed(2)}</td>
                    <td className="text-right py-3 px-4">${product.SellingPrice.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-bold text-green-600">${product.PotentialProfit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {reportData.LowStockProducts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-red-600">Low Stock Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-right py-3 px-4">Current Stock</th>
                    <th className="text-right py-3 px-4">Threshold</th>
                    <th className="text-right py-3 px-4">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.LowStockProducts.map((product: any) => (
                    <tr key={product.Id} className="bg-red-50">
                      <td className="py-3 px-4">{product.Name}</td>
                      <td className="text-right py-3 px-4 text-red-600 font-bold">{product.Quantity}</td>
                      <td className="text-right py-3 px-4">{product.LowStockThreshold}</td>
                      <td className="text-right py-3 px-4">${product.SellingPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 border-l-2 border-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-200 rounded-full">
            <svg className="h-6 w-6 text-yellow-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-800">Application in Progress</h3>
            <p className="text-yellow-700">We're constantly improving SmartLedger! New features are being added regularly.</p>
          </div>
        </div>
      </div>
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 sm:p-5">
        <h3 className="font-bold text-teal-800 mb-2">📈 How to use Reports</h3>
        <ul className="text-sm text-teal-700 space-y-1.5">
          <li>• Switch between different report types using the buttons at the top</li>
          <li>• Set custom date ranges for Income Statement, Balance Sheet, and Trial Balance</li>
          <li>• Refresh reports at any time with "Refresh Report" button</li>
          <li>• View Inventory Summary for stock levels and top products</li>
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">View your business reports and financial statements</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveReport('income-statement')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${activeReport === 'income-statement' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Income Statement
          </button>
          <button
            onClick={() => setActiveReport('balance-sheet')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${activeReport === 'balance-sheet' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Balance Sheet
          </button>
          <button
            onClick={() => setActiveReport('trial-balance')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${activeReport === 'trial-balance' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Trial Balance
          </button>
          <button
            onClick={() => setActiveReport('inventory-summary')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${activeReport === 'inventory-summary' ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Inventory Summary
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 flex gap-4 flex-wrap">
        {activeReport !== 'inventory-summary' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateFilters.startDate}
                onChange={(e) => setDateFilters({ ...dateFilters, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateFilters.endDate}
                onChange={(e) => setDateFilters({ ...dateFilters, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </>
        )}
        <div className="self-end">
          <button
            onClick={fetchReport}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Report'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 border-l-2 border-transparent"></div>
        </div>
      ) : (
        <div>
          {activeReport === 'income-statement' && renderIncomeStatement()}
          {activeReport === 'balance-sheet' && renderBalanceSheet()}
          {activeReport === 'trial-balance' && renderTrialBalance()}
          {activeReport === 'inventory-summary' && renderInventorySummary()}
        </div>
      )}
    </div>
  );
}
