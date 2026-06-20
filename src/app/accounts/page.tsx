'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';
<<<<<<< HEAD
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

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
=======
import { TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Account, CreateAccountDto } from '../../types';

const accountTypes = [
  'Asset',
  'Liability',
  'Equity',
  'Income',
  'Expense',
];

const normalSides = ['DEBIT', 'CREDIT'];
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)

export default function AccountsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
<<<<<<< HEAD
  const [formData, setFormData] = useState({
=======
  const [formData, setFormData] = useState<CreateAccountDto>({
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
    accountCode: '',
    name: '',
    type: 'Asset',
    normalSide: 'DEBIT',
<<<<<<< HEAD
    parentAccountId: null as number | null,
=======
    parentAccountId: null,
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
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
<<<<<<< HEAD
      console.error('Error fetching accounts:', error);
=======
      console.error('Failed to load accounts:', error);
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
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
<<<<<<< HEAD
    } catch (error: any) {
      console.error('Error saving account:', error);
      toast.error(error.response?.data?.message || 'Failed to save account');
=======
    } catch (error) {
      console.error('Failed to save account:', error);
      toast.error('Failed to save account');
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
    }
  };

  const handleDelete = async (id: number) => {
<<<<<<< HEAD
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await api.delete(`/Accounts/${id}`);
      toast.success('Account deleted successfully');
      fetchAccounts();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
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

=======
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

>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      accountCode: account.accountCode,
      name: account.name,
      type: account.type,
<<<<<<< HEAD
      normalSide: account.normalSide,
=======
      normalSide: account.normalSide as 'DEBIT' | 'CREDIT',
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
      parentAccountId: account.parentAccountId,
    });
    setShowModal(true);
  };

<<<<<<< HEAD
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Asset': return 'text-green-600 bg-green-50';
      case 'Liability': return 'text-red-600 bg-red-50';
      case 'Equity': return 'text-blue-600 bg-blue-50';
      case 'Income': return 'text-purple-600 bg-purple-50';
      case 'Expense': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
=======
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
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
<<<<<<< HEAD
          <p className="text-gray-600 mt-1">Manage your financial accounts</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors flex items-center space-x-2"
=======
          <p className="text-gray-600 mt-1">Manage your business accounts</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors w-full sm:w-auto"
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
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
<<<<<<< HEAD
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Normal Side</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-900">{account.accountCode}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{account.name}</div>
                    {account.parentAccountName && (
                      <div className="text-xs text-gray-400">Parent: {account.parentAccountName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSideColor(account.normalSide)}`}>
                      {account.normalSide}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(account.balance).toLocaleString()}
                      {account.balance < 0 ? ' DR' : ' CR'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
=======
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
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
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
<<<<<<< HEAD
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </h2>
=======
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
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Code *</label>
                <input
                  type="text"
<<<<<<< HEAD
=======
                  value={formData.accountCode}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., 1000"
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
                  required
                  value={formData.accountCode}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                <input
                  type="text"
<<<<<<< HEAD
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="e.g., Cash"
=======
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Cash"
                  required
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
<<<<<<< HEAD
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Normal Side *</label>
                <select
                  value={formData.normalSide}
                  onChange={(e) => setFormData({ ...formData, normalSide: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="DEBIT">Debit</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Account (Optional)</label>
                <select
                  value={formData.parentAccountId || ''}
                  onChange={(e) => setFormData({ ...formData, parentAccountId: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">None</option>
                  {accounts.filter(a => a.id !== editingAccount?.id).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountCode} - {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
=======
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
>>>>>>> 8732f45 (Update frontend: add accounts and journal pages, improve auth context)
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