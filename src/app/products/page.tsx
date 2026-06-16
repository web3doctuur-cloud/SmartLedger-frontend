'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PencilIcon, TrashIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      quantity: product.quantity ?? 0,
      costPrice: product.costPrice ?? 0,
      sellingPrice: product.sellingPrice ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 10,
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-14 w-14 border-b-3 border-l-3 border-yellow-500 border-transparent"></div>
        <p className="text-gray-500 text-lg font-medium animate-pulse">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Products</h1>
          <p className="text-gray-600 mt-2 text-lg">Manage your inventory and product catalog</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Cost</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Selling</th>
                <th className="px-4 sm:px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                <th className="px-4 sm:px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 sm:px-6 py-5 whitespace-nowrap">
                    <div className="text-base font-semibold text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-5 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                    {product.category || '-'}
                  </td>
                  <td className="px-4 sm:px-6 py-5 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`text-base font-bold ${product.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.quantity}
                      </span>
                      {product.isLowStock && (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                          Low
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-5 whitespace-nowrap text-right text-sm font-medium text-gray-700 hidden md:table-cell">
                    ${product.costPrice.toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-5 whitespace-nowrap text-right text-sm font-medium text-gray-700 hidden md:table-cell">
                    ${product.sellingPrice.toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-5 whitespace-nowrap text-right text-sm font-bold text-green-600 hidden lg:table-cell">
                    ${product.expectedRevenue.toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => openQuantityModal(product.id, 'increase')} 
                        className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-xl transition-all duration-200"
                      >
                        <PlusIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => openQuantityModal(product.id, 'decrease')} 
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <MinusIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => openEditModal(product)} 
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)} 
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-xl transition-all duration-200"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button 
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input 
                  type="text" 
                  placeholder="Enter product name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  placeholder="Enter product description" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base resize-none" 
                  rows={3} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input 
                  type="text" 
                  placeholder="Enter category" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Low Stock Threshold</label>
                  <input 
                    type="number" 
                    placeholder="10" 
                    value={formData.lowStockThreshold} 
                    onChange={(e) => setFormData({...formData, lowStockThreshold: parseInt(e.target.value) || 10})} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cost Price</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={formData.costPrice} 
                    onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Selling Price</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={formData.sellingPrice} 
                    onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); resetForm(); }} 
                  className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quantity Modal */}
      {showQuantityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-7 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {quantityAction === 'increase' ? 'Add Stock' : 'Remove Stock'}
              </h2>
              <button 
                onClick={() => setShowQuantityModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input 
                  type="number" 
                  placeholder="0" 
                  value={quantityUpdate.quantity} 
                  onChange={(e) => setQuantityUpdate({...quantityUpdate, quantity: parseInt(e.target.value) || 0})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (optional)</label>
                <input 
                  type="text" 
                  placeholder="Add notes about this change" 
                  value={quantityUpdate.notes} 
                  onChange={(e) => setQuantityUpdate({...quantityUpdate, notes: e.target.value})} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 text-base" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowQuantityModal(false)} 
                  className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleQuantityUpdate} 
                  className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 shadow-md hover:shadow-lg ${
                    quantityAction === 'increase' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
