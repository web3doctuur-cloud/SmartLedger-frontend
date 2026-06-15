'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#000000', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
    if (!isLoading && !isAdmin) router.push('/');
  }, [isLoading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchAnalytics();
  }, [isAuthenticated, isAdmin]);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/Products');
      const products = response.data;

      const categoryMap = new Map();
      products.forEach((p: any) => {
        if (p.category && p.totalCost > 0) {
          categoryMap.set(p.category, (categoryMap.get(p.category) || 0) + p.totalCost);
        }
      });
      setCategoryData(Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })));

      const revenueRaw = products.filter((p: any) => p.expectedRevenue > 0).map((p: any) => ({ name: p.name, value: p.expectedRevenue })).sort((a: any, b: any) => b.value - a.value);
      const top5 = revenueRaw.slice(0, 5);
      const others = revenueRaw.slice(5).reduce((sum: number, p: any) => sum + p.value, 0);
      if (others > 0) top5.push({ name: 'Others', value: others });
      setRevenueData(top5);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold text-gray-900">Analytics</h1><p className="text-gray-600 mt-1">Visual insights (Admin only)</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Inventory by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">{categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} /><Legend /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Revenue by Product</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={revenueData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">{revenueData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(v: any) => `$${v.toLocaleString()}`} /><Legend /></PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}