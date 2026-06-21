'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

interface Account {
  id: number;
  accountCode: string;
  name: string;
  type: string;
  normalSide: string;
  parentAccountId: number | null;
  parentAccountName: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

interface CreateAccountDto {
  accountCode: string;
  name: string;
  type: string;
  normalSide: string;
  parentAccountId: number | null;
}

const accountTypes = [
  'Asset',
  'Liability',
  'Equity',
  'Income',
  'Expense',
];

const normalSides = ['DEBIT', 'CREDIT'];

export default function AccountsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<CreateAccountDto>({
    accountCode: '',
    name: '',
    type: 'Asset',
    normalSide: 'DEBIT',
    parentAccountId: null,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/Accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await api.put(`/Accounts/${editingAccount.id}`, formData);
        toast.success('Account updated successfully');
      } else {
        await api.post('/Accounts', formData);
        toast.success('Account created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Failed to save account:', error);
      toast.error('Failed to save account');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this account?')) {
      try {
        await api.delete(`/Accounts/${id}`);
        toast.success('Account deleted successfully');
        fetchAccounts();
      } catch (error) {
        console.error('Failed to delete account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      accountCode: '',
      name: '',
      type: 'Asset',
      normalSide: 'DEBIT',
      parentAccountId: null,
    });
    setEditingAccount(null);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      accountCode: account.accountCode,
      name: account.name,
      type: account.type,
      normalSide: account.normalSide as 'DEBIT' | 'CREDIT',
      parentAccountId: account.parentAccountId,
    });
    setShowModal(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Asset':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Liability':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Equity':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Income':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Expense':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSideColor = (side: string) => {
    return side === 'DEBIT' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
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
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 sm:p-5">
        <h3 className="font-bold text-purple-800 mb-2">📒 How to use the Chart of Accounts</h3>
        <ul className="text-sm text-purple-700 space-y-1.5">
          <li>• Add new accounts using "Add Account" button</li>
          <li>• Edit existing accounts by clicking the pencil icon</li>
          <li>• Delete accounts with the trash icon</li>
          <li>• Accounts are organized by type (Asset, Liability, Equity, Income, Expense)</li>
          <li>• View current balances for each account</li>
        </ul>
      </div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your business accounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors w-full sm:w-auto flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Normal Side</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Balance</th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.sort((a, b) => a.accountCode.localeCompare(b.accountCode)).map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-medium text-gray-900">{account.accountCode}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{account.name}</div>
                    {account.parentAccountName && (
                      <div className="text-xs text-gray-500">Sub-account of {account.parentAccountName}</div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className={`text-sm font-medium ${account.normalSide === 'DEBIT' ? 'text-blue-600' : 'text-orange-600'}`}>
                      {account.normalSide}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right hidden lg:table-cell">
                    <span className="text-sm font-medium text-gray-900">${account.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm space-x-2">
                    <button
                      onClick={() => openEditModal(account)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No accounts found. Click "Add Account" to get started.</p>
          </div>
        )}
      </div>

      {/* Account Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAccount ? 'Edit Account' : 'Add Account'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Code *</label>
                <input
                  type="text"
                  value={formData.accountCode}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., 1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Cash"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  {accountTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Normal Side</label>
                <select
                  value={formData.normalSide}
                  onChange={(e) => setFormData({ ...formData, normalSide: e.target.value as 'DEBIT' | 'CREDIT' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  {normalSides.map(side => (
                    <option key={side} value={side}>{side}</option>
                  ))}
                </select>
              </div>
              {accounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Account (Optional)</label>
                  <select
                    value={formData.parentAccountId || ''}
                    onChange={(e) => setFormData({ ...formData, parentAccountId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  >
                    <option value="">None</option>
                    {accounts
                      .filter(acc => !editingAccount || acc.id !== editingAccount.id)
                      .map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.accountCode} - {acc.name}</option>
                      ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors"
                >
                  {editingAccount ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}