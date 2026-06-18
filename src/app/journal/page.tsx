'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TrashIcon, PlusIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Account, CreateJournalEntryDto, EntryType, JournalEntry } from '../../types';

interface FormLine {
  accountId: number;
  type: EntryType;
  amount: number;
}

export default function JournalPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<JournalEntry | null>(null);
  const [formData, setFormData] = useState<{
    entryDate: string;
    description: string;
    lines: FormLine[];
  }>({
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    lines: [],
  });
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    try {
      const [entriesRes, accountsRes] = await Promise.all([
        api.get<JournalEntry[]>('/JournalEntries'),
        api.get<Account[]>('/Accounts'),
      ]);
      setEntries(entriesRes.data);
      setAccounts(accountsRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startTransition(() => {
        fetchData();
      });
    }
  }, [isAuthenticated, fetchData]);

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        accountId: accounts[0]?.id || 0,
        type: 'DEBIT',
        amount: 0,
      }],
    }));
  };

  const updateLine = (index: number, field: keyof FormLine, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      ),
    }));
  };

  const removeLine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const totalDebits = formData.lines
    .filter(l => l.type === 'DEBIT')
    .reduce((sum, l) => sum + l.amount, 0);
  const totalCredits = formData.lines
    .filter(l => l.type === 'CREDIT')
    .reduce((sum, l) => sum + l.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.lines.length < 2) {
      toast.error('Journal entry must have at least 2 lines');
      return;
    }

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast.error('Debits and credits must be equal');
      return;
    }

    const payload: CreateJournalEntryDto = {
      entryDate: formData.entryDate,
      description: formData.description,
      lines: formData.lines.map(line => ({
        accountId: line.accountId,
        debit: line.type === 'DEBIT' ? line.amount : 0,
        credit: line.type === 'CREDIT' ? line.amount : 0,
      })),
    };

    try {
      await api.post('/JournalEntries', payload);
      toast.success('Journal entry created successfully');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch {
      toast.error('Failed to save journal entry');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/JournalEntries/${id}/approve`);
      toast.success('Journal entry approved successfully');
      fetchData();
    } catch {
      toast.error('Failed to approve journal entry');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await api.delete(`/JournalEntries/${id}`);
        toast.success('Journal entry deleted successfully');
        fetchData();
      } catch {
        toast.error('Failed to delete journal entry');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      entryDate: new Date().toISOString().split('T')[0],
      description: '',
      lines: [],
    });
  };

  const getEntryTypeColor = (type: EntryType) => {
    return type === 'DEBIT' ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';
  };

  const getLineType = (line: JournalEntry['lines'][0]): EntryType =>
    line.debit > 0 ? 'DEBIT' : 'CREDIT';

  const getLineAmount = (line: JournalEntry['lines'][0]): number =>
    line.debit > 0 ? line.debit : line.credit;

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600 mt-1">Record and manage financial transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Journal Entry
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        {entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No journal entries yet. Click &quot;Add Journal Entry&quot; to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Entry #</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(entry.entryDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm font-mono text-gray-500">{entry.entryNumber}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.description || 'No description'}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${entry.isApproved ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                        {entry.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center text-sm space-x-2">
                      <button
                        onClick={() => setShowDetailsModal(entry)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                      >
                        <EyeIcon className="h-5 w-5 inline" />
                      </button>
                      {!entry.isApproved && (
                        <button
                          onClick={() => handleApprove(entry.id)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                        >
                          <CheckCircleIcon className="h-5 w-5 inline" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Add Journal Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="What is this transaction for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows={2}
                  required
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Entry Lines</h3>
                  <button
                    type="button"
                    onClick={addLine}
                    disabled={accounts.length === 0}
                    className="bg-black text-white px-3 py-1 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-4 w-4 inline mr-1" />
                    Add Line
                  </button>
                </div>

                {accounts.length === 0 && (
                  <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    Create accounts first before adding journal entries.
                  </p>
                )}

                <div className="space-y-3">
                  {formData.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <label className="block text-xs text-gray-500 mb-1">Account</label>
                        <select
                          value={line.accountId}
                          onChange={(e) => updateLine(index, 'accountId', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.accountCode} - {acc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select
                          value={line.type}
                          onChange={(e) => updateLine(index, 'type', e.target.value as EntryType)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                        >
                          <option value="DEBIT">Debit</option>
                          <option value="CREDIT">Credit</option>
                        </select>
                      </div>
                      <div className="col-span-4">
                        <label className="block text-xs text-gray-500 mb-1">Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.amount}
                          onChange={(e) => updateLine(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="w-full px-2 py-1 border border-gray-300 rounded-lg text-red-600 hover:bg-red-50 text-sm"
                        >
                          <TrashIcon className="h-4 w-4 inline" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.lines.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Debits:</span>
                      <span className="font-medium">${totalDebits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Credits:</span>
                      <span className="font-medium">${totalCredits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold">
                      <span>Difference:</span>
                      <span className={Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(totalDebits - totalCredits).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accounts.length === 0}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Journal Entry Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Entry #:</span>
                <span className="font-mono">{showDetailsModal.entryNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Date:</span>
                <span>{new Date(showDetailsModal.entryDate).toLocaleDateString()}</span>
              </div>
              {showDetailsModal.description && (
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Description:</span>
                  <span>{showDetailsModal.description}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${showDetailsModal.isApproved ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                  {showDetailsModal.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Entry Lines</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {showDetailsModal.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {line.accountCode} - {line.accountName}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getEntryTypeColor(getLineType(line))}`}>
                            {getLineType(line)}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <span className="text-sm font-medium text-gray-900">${getLineAmount(line).toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t mt-4">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
