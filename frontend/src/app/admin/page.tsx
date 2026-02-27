'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { Product, Order, User, Summary } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'reports'>('reports');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: 0, stock: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', description: '', price: 0, stock: 0 });

  const startEdit = (p: Product) => {
    setEditingProduct(p);
    setEditForm({ name: p.name, price: p.price, stock: p.stock });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/products');
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      if (activeTab === 'products') {
        const { data } = await api.get(`/products?limit=100&t=${timestamp}`);
        setProducts(data.products);
      } else if (activeTab === 'orders') {
        const { data } = await api.get(`/orders?t=${timestamp}`);
        setOrders(data);
      } else if (activeTab === 'users') {
        const { data } = await api.get(`/users?t=${timestamp}`);
        setUsers(data);
      } else if (activeTab === 'reports') {
        const { data } = await api.get(`/reports/summary?t=${timestamp}`);
        setSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { addToast } = useToast();

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      addToast(`Order marked as ${newStatus}`, 'success');
      fetchData(); // Refresh table
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update order', 'error');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${productId}`);
      addToast('Product deleted successfully', 'success');
      fetchData();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await api.put(`/products/${editingProduct._id}`, editForm);
      addToast('Product updated successfully', 'success');
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update product', 'error');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Adding product:', addForm);
      const { data } = await api.post('/products', addForm);
      console.log('Product added:', data);
      addToast('Product added successfully', 'success');
      setShowAddModal(false);
      setAddForm({ name: '', description: '', price: 0, stock: 0 });
      fetchData();
    } catch (err: any) {
      console.error('Add product error:', err.response?.data || err);
      addToast(err.response?.data?.message || 'Failed to add product', 'error');
    }
  };

  const downloadReport = () => {
    // ... rest of code, replacing the end of fetchData and mapping order status buttons below

    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `${activeTab}_report.csv`;

    if (activeTab === 'reports' && summary) {
      csvContent += "Metric,Value\n";
      csvContent += `Total Revenue,$${summary.totalRevenue}\n`;
      csvContent += `Total Orders,${summary.totalOrders}\n`;
      csvContent += "\nTop Selling Products,Quantity Sold\n";
      summary.topProducts.forEach((p, i) => {
        csvContent += `"${i + 1}. ${p.name.replace(/"/g, '""')}",${p.totalQuantity}\n`;
      });
    } else if (activeTab === 'products') {
      csvContent += "Name,Price,Stock\n";
      products.forEach(p => {
        csvContent += `"${p.name.replace(/"/g, '""')}",${p.price},${p.stock}\n`;
      });
    } else if (activeTab === 'orders') {
      csvContent += "Order ID,Customer Name,Total Amount,Status\n";
      orders.forEach(o => {
        csvContent += `"${o._id}","${(o.user as any)?.name || 'Unknown'}","${o.totalAmount}","${o.status}"\n`;
      });
    } else if (activeTab === 'users') {
      csvContent += "Name,Email,Role\n";
      users.forEach(u => {
        csvContent += `"${u.name.replace(/"/g, '""')}","${u.email}","${u.role}"\n`;
      });
    } else {
      return;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
          <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 text-xl sm:text-2xl">📊</span>
          <span className="break-words">Admin Dashboard</span>
        </h1>
        <button
          onClick={downloadReport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
        >
          <span>📥</span> <span className="hidden sm:inline">Download Report</span><span className="sm:hidden">Report</span>
        </button>
      </div>

      <div className="flex overflow-x-auto space-x-2 sm:space-x-3 mb-6 sm:mb-8 border-b border-emerald-500/10 pb-2 custom-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
        {['reports', 'products', 'orders', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 rounded-full capitalize font-bold transition-all whitespace-nowrap text-xs sm:text-sm ${activeTab === tab
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-emerald-500/5'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="glossy-card p-4 sm:p-6 lg:p-8">
          {activeTab === 'reports' && summary && (
            <div className="space-y-8 sm:space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="bg-emerald-500/5 p-4 sm:p-6 lg:p-8 rounded-2xl border border-emerald-500/10">
                  <p className="text-gray-500 mb-2 text-sm sm:text-base">Total Revenue</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-700 dark:text-emerald-500 break-all">${summary.totalRevenue}</p>
                </div>
                <div className="bg-emerald-500/5 p-4 sm:p-6 lg:p-8 rounded-2xl border border-emerald-500/10">
                  <p className="text-gray-500 mb-2 text-sm sm:text-base">Total Orders</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-700 dark:text-emerald-500">{summary.totalOrders}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Top 3 Best Sellers</h3>
                <div className="space-y-3 sm:space-y-4">
                  {summary.topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-charcoal border border-emerald-500/10 rounded-xl">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-emerald-500 text-white rounded-full font-bold text-xs sm:text-sm flex-shrink-0">{i + 1}</span>
                        <span className="font-semibold text-sm sm:text-base truncate">{p.name}</span>
                      </div>
                      <span className="text-emerald-600 font-bold text-xs sm:text-sm flex-shrink-0 ml-2">{p.totalQuantity} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <h3 className="text-lg sm:text-xl font-bold">Product Management</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <span>➕</span> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
                </button>
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-emerald-500/10">
                        <th className="pb-4 text-xs sm:text-sm font-semibold">Name</th>
                        <th className="pb-4 text-xs sm:text-sm font-semibold">Price</th>
                        <th className="pb-4 text-xs sm:text-sm font-semibold">Stock</th>
                        <th className="pb-4 text-xs sm:text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id} className="border-b border-emerald-500/5 last:border-0">
                          <td className="py-3 sm:py-4 text-xs sm:text-sm max-w-[150px] sm:max-w-none truncate">{p.name}</td>
                          <td className="py-3 sm:py-4 text-xs sm:text-sm">${p.price}</td>
                          <td className="py-3 sm:py-4 text-xs sm:text-sm">{p.stock}</td>
                          <td className="py-3 sm:py-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button onClick={() => startEdit(p)} className="text-emerald-600 text-xs sm:text-sm font-semibold hover:underline whitespace-nowrap">Edit</button>
                              <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 text-xs sm:text-sm font-semibold hover:underline whitespace-nowrap">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-emerald-500/10">
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Order ID</th>
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Customer</th>
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Total</th>
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Status</th>
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o._id} className="border-b border-emerald-500/5 last:border-0">
                        <td className="py-3 sm:py-4 text-xs font-mono break-all sm:whitespace-nowrap">{o._id}</td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">{(o.user as any)?.name || 'Unknown'}</td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm">${o.totalAmount}</td>
                        <td className="py-3 sm:py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${o.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                            o.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                              'bg-amber-500/10 text-amber-600'
                            }`}>
                            {o.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 sm:py-4">
                          {o.status === 'pending' && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => updateOrderStatus(o._id, 'completed')}
                                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded hover:bg-emerald-600 transition-colors whitespace-nowrap"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateOrderStatus(o._id, 'cancelled')}
                                className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors whitespace-nowrap"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-emerald-500/10">
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Name</th>
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Email</th>
                      <th className="pb-4 text-xs sm:text-sm font-semibold">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-emerald-500/5 last:border-0">
                        <td className="py-3 sm:py-4 text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">{u.name}</td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm max-w-[150px] sm:max-w-none truncate">{u.email}</td>
                        <td className="py-3 sm:py-4 text-xs sm:text-sm capitalize">{u.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm sm:text-base"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm sm:text-base"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Stock Limit</label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={e => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm sm:text-base"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm sm:text-base">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 text-sm sm:text-base">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl relative z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm sm:text-base"
                  placeholder="e.g., Premium Watch"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm sm:text-base"
                  placeholder="Describe the product..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={e => setAddForm({ ...addForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm sm:text-base"
                    min="0"
                    step="0.01"
                    placeholder="99.99"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={addForm.stock}
                    onChange={e => setAddForm({ ...addForm, stock: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium text-sm sm:text-base"
                    min="0"
                    placeholder="50"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm sm:text-base">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 text-sm sm:text-base">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
