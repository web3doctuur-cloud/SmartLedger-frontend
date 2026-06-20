'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CubeIcon, CurrencyDollarIcon, CheckCircleIcon, ExclamationTriangleIcon, ChartBarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { DashboardSummaryDto } from '../types';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardSummaryDto | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await api.get('/Dashboard/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Unable to load dashboard data. Please try again later.');
    } finally {
      setLoadingStats(false);
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
    { 
      title: 'Total Products', 
      value: stats?.inventory.totalProducts || 0, 
      icon: CubeIcon, 
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-400',
      textColor: 'text-black'
    },
    { 
      title: 'Inventory Value', 
      value: `$${stats?.inventory.totalInventoryValue?.toLocaleString() || 0}`, 
      icon: CurrencyDollarIcon, 
      color: 'bg-gradient-to-br from-gray-900 to-black',
      textColor: 'text-white'
    },
    { 
      title: 'Expected Revenue', 
      value: `$${stats?.inventory.totalExpectedRevenue?.toLocaleString() || 0}`, 
      icon: ChartBarIcon, 
      color: 'bg-gradient-to-br from-gray-800 to-gray-700',
      textColor: 'text-white'
    },
    { 
      title: 'Pending Tasks', 
      value: stats?.tasks.pending || 0, 
      icon: CheckCircleIcon, 
      color: 'bg-gradient-to-br from-gray-700 to-gray-600',
      textColor: 'text-white'
    },
  ];

  if (isLoading || loadingStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-14 w-14 border-2 border-yellow-500 border-t-transparent"></div>
        <p className="text-gray-500 text-lg font-medium animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome back, here is what is happening with your business today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 sm:p-7 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.color} p-4 rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className={`h-7 w-7 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-7 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Financial Summary</h2>
              <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-gray-700 font-medium">Income</span>
              </div>
              <span className="text-xl font-extrabold text-green-600">${stats?.accounting.income?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-gray-700 font-medium">Expenses</span>
              </div>
              <span className="text-xl font-extrabold text-red-600">${stats?.accounting.expenses?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-700 font-medium">Net Profit</span>
              </div>
              <span className={`text-xl font-extrabold ${(stats?.accounting.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${stats?.accounting.netProfit?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-3">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700 font-medium">Profit Margin</span>
              </div>
              <span className="text-xl font-extrabold text-yellow-600">{stats?.accounting.profitMargin || 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-7 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
              <p className="text-sm text-gray-500 mt-1">Products that need restocking</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          {stats && stats.inventory.lowStockProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <CheckCircleIcon className="h-14 w-14 mx-auto text-green-500 mb-4" />
              <p className="text-gray-700 font-medium text-lg">No low stock products</p>
              <p className="text-gray-500 text-sm mt-1">Great job keeping inventory levels healthy!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {stats?.inventory.lowStockProducts?.slice(0, 5).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-4 bg-yellow-50/70 rounded-xl border border-yellow-100 hover:bg-yellow-50 transition-colors duration-200">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-yellow-700">
                      Stock: {product.quantity} / {product.lowStockThreshold}
                    </p>
                  </div>
                  <span className="px-3 py-1.5 bg-yellow-600 text-white text-xs font-bold rounded-full">
                    Low Stock
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
