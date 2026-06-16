'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CubeIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
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

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await api.get('/Dashboard/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Unable to load dashboard data. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startTransition(() => {
        fetchDashboardStats();
      });
    }
  }, [isAuthenticated, fetchDashboardStats]);

  const statCards = [
    { title: 'Total Products', value: stats?.inventory.totalProducts || 0, icon: CubeIcon, color: 'bg-yellow-500' },
    { title: 'Inventory Value', value: `$${stats?.inventory.totalInventoryValue?.toLocaleString() || 0}`, icon: CurrencyDollarIcon, color: 'bg-black' },
    { title: 'Expected Revenue', value: `$${stats?.inventory.totalExpectedRevenue?.toLocaleString() || 0}`, icon: ChartBarIcon, color: 'bg-gray-800' },
    { title: 'Pending Tasks', value: stats?.tasks.pending || 0, icon: CheckCircleIcon, color: 'bg-gray-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back to SmartLedger</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Income (30 days)</span>
              <span className="font-semibold text-green-600">${stats?.accounting.income?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Expenses (30 days)</span>
              <span className="font-semibold text-red-600">${stats?.accounting.expenses?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Net Profit</span>
              <span className={`font-semibold ${(stats?.accounting.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats?.accounting.netProfit?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-semibold text-yellow-600">{stats?.accounting.profitMargin || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Low Stock Alerts</h2>
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
          </div>
          {stats?.inventory.lowStockProducts?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No low stock products</p>
          ) : (
            <div className="space-y-3">
              {stats?.inventory.lowStockProducts?.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">Stock: {product.quantity} / {product.lowStockThreshold}</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Low Stock</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}