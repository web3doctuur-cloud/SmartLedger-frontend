'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  expectedRevenue: number;
  isLowStock: boolean;
  lowStockThreshold: number;
  isActive: boolean;
}

export default function ProductsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    lowStockThreshold: 10,
  });
  const [quantityUpdate, setQuantityUpdate] = useState({ id: 0, quantity: 0, notes: '' });
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantityAction, setQuantityAction] = useState<'increase' | 'decrease'>('increase');
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await api.get('/Products');
      setProducts(response.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      startTransition(() => {
        fetchProducts();
      });
    }
  }, [isAuthenticated, fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/Products/${editingProduct.id}`, formData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/Products', formData);
        toast.success('Product created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/Products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleQuantityUpdate = async () => {
    try {
      const endpoint = quantityAction === 'increase' 
        ? `/Products/${quantityUpdate.id}/increase-quantity`
        : `/Products/${quantityUpdate.id}/decrease-quantity`;
      
      await api.patch(endpoint, {
        quantity: quantityUpdate.quantity,
        notes: quantityUpdate.notes || undefined,
      });
      
      toast.success(`Stock ${quantityAction === 'increase' ? 'increased' : 'decreased'} successfully`);
      setShowQuantityModal(false);
      setQuantityUpdate({ id: 0, quantity: 0, notes: '' });
      fetchProducts();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      quantity: 0,
      costPrice: 0,
      sellingPrice: 0,
      lowStockThreshold: 10,
    });
    setEditingProduct(null);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      quantity: product.quantity,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      lowStockThreshold: product.lowStockThreshold,
    });
    setShowModal(true);
  };

  const openQuantityModal = (id: number, action: 'increase' | 'decrease') => {
    setQuantityAction(action);
    setQuantityUpdate({ id, quantity: 0, notes: '' });
    setShowQuantityModal(true);
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 border-l-2 border-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your inventory and products</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-yellow-500 hover:text-black transition-colors w-full sm:w-auto"
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr><th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Cost</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Selling</th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">{product.category || '-'}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${product.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.quantity}
                    </span>
                    {product.isLowStock && <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">Low</span>}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm hidden md:table-cell">${product.costPrice}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm hidden md:table-cell">${product.sellingPrice}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600 hidden lg:table-cell">${product.expectedRevenue.toLocaleString()}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm space-x-1 sm:space-x-2">
                    <button onClick={() => openQuantityModal(product.id, 'increase')} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"><PlusIcon className="h-5 w-5 inline" /></button>
                    <button onClick={() => openQuantityModal(product.id, 'decrease')} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"><MinusIcon className="h-5 w-5 inline" /></button>
                    <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"><PencilIcon className="h-5 w-5 inline" /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"><TrashIcon className="h-5 w-5 inline" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" required />
              <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" rows={2} />
              <input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                <input type="number" placeholder="Low Stock Threshold" value={formData.lowStockThreshold} onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value) || 10})} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Cost Price" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
                <input type="number" step="0.01" placeholder="Selling Price" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-yellow-500 hover:text-black transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quantity Modal */}
      {showQuantityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-gray-900">{quantityAction === 'increase' ? 'Add Stock' : 'Remove Stock'}</h2>
            <input type="number" placeholder="Quantity" value={quantityUpdate.quantity} onChange={(e) => setQuantityUpdate({...quantityUpdate, quantity: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
            <input type="text" placeholder="Notes (optional)" value={quantityUpdate.notes} onChange={(e) => setQuantityUpdate({...quantityUpdate, notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowQuantityModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleQuantityUpdate} className={`px-4 py-2 rounded-lg text-white ${quantityAction === 'increase' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} transition-colors`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}