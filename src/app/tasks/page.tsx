'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Task {
  id: number;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
  isOverdue: boolean;
}

export default function TasksPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  const [, startTransition] = useTransition();

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get('/Todo');
      setTasks(response.data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      startTransition(() => {
        fetchTasks();
      });
    }
  }, [isAuthenticated, fetchTasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/Todo/${editingTask.id}`, formData);
        toast.success('Task updated');
      } else {
        await api.post('/Todo', formData);
        toast.success('Task created');
      }
      setShowModal(false);
      resetForm();
      fetchTasks();
    } catch {
      toast.error('Failed to save task');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this task?')) {
      await api.delete(`/Todo/${id}`);
      toast.success('Task deleted');
      fetchTasks();
    }
  };

  const handleComplete = async (id: number) => {
    await api.patch(`/Todo/${id}/complete`);
    toast.success('Task completed!');
    fetchTasks();
  };

  const handleInProgress = async (id: number) => {
    await api.patch(`/Todo/${id}/in-progress`);
    toast.success('Task in progress');
    fetchTasks();
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
    setEditingTask(null);
  };

  const getPriorityColor = (p: string) => {
    if (p === 'HIGH') return 'text-red-600 bg-red-50';
    if (p === 'MEDIUM') return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusColor = (s: string) => {
    if (s === 'COMPLETED') return 'text-green-600 bg-green-50';
    if (s === 'IN_PROGRESS') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  if (isLoading || loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-2 border-yellow-500 border-t-transparent"></div></div>;

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

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
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 sm:p-5">
        <h3 className="font-bold text-indigo-800 mb-2">✅ How to use Tasks</h3>
        <ul className="text-sm text-indigo-700 space-y-1.5">
          <li>• Add new tasks using "+ Add Task" button</li>
          <li>• Edit tasks by clicking the pencil icon</li>
          <li>• Mark tasks as in-progress with the clock icon</li>
          <li>• Complete tasks with the check circle icon</li>
          <li>• Delete tasks with the trash icon</li>
        </ul>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-3xl font-bold text-gray-900">Tasks</h1><p className="text-gray-600 mt-1">Manage your to-do list</p></div>
        <button onClick={() => setShowModal(true)} className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors w-full sm:w-auto">+ Add Task</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Total Tasks</p><p className="text-2xl font-bold">{tasks.length}</p></div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</p></div>
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{completedTasks.length}</p></div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Tasks</h2>
        {pendingTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">No pending tasks. Click &quot;+ Add Task&quot; to create one.</p>
          </div>
        ) : pendingTasks.map(task => (
          <div key={task.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                  {task.isOverdue && <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Overdue</span>}
                </div>
                {task.description && <p className="text-gray-600 mt-2">{task.description}</p>}
                {task.dueDate && <p className="text-sm text-gray-500 mt-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
              </div>
              <div className="flex space-x-2">
                {task.status === 'PENDING' && <button onClick={() => handleInProgress(task.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><ClockIcon className="h-5 w-5" /></button>}
                {task.status !== 'COMPLETED' && <button onClick={() => handleComplete(task.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircleIcon className="h-5 w-5" /></button>}
                <button onClick={() => { setEditingTask(task); setFormData({ title: task.title, description: task.description || '', priority: task.priority, dueDate: task.dueDate?.split('T')[0] || '' }); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><PencilIcon className="h-5 w-5" /></button>
                <button onClick={() => handleDelete(task.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><TrashIcon className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" required />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" rows={2} />
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
                <option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option>
              </select>
              <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}