'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from 'recharts';
import { Product } from '../../types';

const COLORS = ['#000000', '#F59E0B', '#1F2937', '#374151', '#4B5563', '#6B7280'];

interface ChartData {
  name: string;
  value: number;
  percent?: number;
}

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await api.get<Product[]>('/Products');
      const products = response.data;

      // Inventory by Category
      const categoryMap = new Map<string, number>();
      products.forEach((p) => {
        if (p.category && p.totalCost > 0) {
          categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + p.totalCost);
        }
      });
      setCategoryData(Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })));

      // Revenue by Product (Top 5 + Others)
      const revenueRaw = products
        .filter((p) => p.expectedRevenue > 0)
        .map((p) => ({ name: p.name, value: p.expectedRevenue }))
        .sort((a, b) => b.value - a.value);
      
      const top5 = revenueRaw.slice(0, 5);
      const others = revenueRaw.slice(5).reduce((sum, p) => sum + p.value, 0);
      if (others > 0) top5.push({ name: 'Others', value: others });
      setRevenueData(top5);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startTransition(() => {
        fetchAnalytics();
      });
    }
  }, [isAuthenticated, fetchAnalytics]);

  // Custom label formatter to fix TypeScript error
  const renderLabel = (props: PieLabelRenderProps) => {
    const { name, percent } = props as { name?: string; percent?: number };
    if (name === undefined) return '';
    if (percent === undefined) return name;
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-500 border-t-transparent"></div>
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
      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 sm:p-5">
        <h3 className="font-bold text-pink-800 mb-2">📊 How to use Analytics</h3>
        <ul className="text-sm text-pink-700 space-y-1.5">
          <li>• View pie chart of inventory by category</li>
          <li>• See expected revenue breakdown by product</li>
          <li>• Identify top-performing products quickly</li>
        </ul>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Visual insights into your business performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Inventory by Category */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Inventory by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => value ? `$${Number(value).toLocaleString()}` : ''} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No category data available</div>
          )}
        </div>

        {/* Revenue by Product */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-4">Expected Revenue by Product</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderLabel}
                  outerRadius={100}
                  dataKey="value"
                >
                  {revenueData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: unknown) => value ? `$${Number(value).toLocaleString()}` : ''} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No product data available</div>
          )}
        </div>
      </div>
    </div>
  );
}