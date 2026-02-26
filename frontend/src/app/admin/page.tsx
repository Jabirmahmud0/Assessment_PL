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
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">📊</span>
          Admin Dashboard
        </h1>
        <button
          onClick={downloadReport}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <span>📥</span> Download Report
        </button>
      </div>

      <div className="flex overflow-x-auto space-x-2 mb-8 border-b border-emerald-500/10 pb-2 custom-scrollbar">
        {['reports', 'products', 'orders', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2.5 rounded-full capitalize font-bold transition-all whitespace-nowrap ${activeTab === tab
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
        <div className="glossy-card p-8">
          {activeTab === 'reports' && summary && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-emerald-500/5 p-8 rounded-2xl border border-emerald-500/10">
                  <p className="text-gray-500 mb-2">Total Revenue</p>
                  <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-500">${summary.totalRevenue}</p>
                </div>
                <div className="bg-emerald-500/5 p-8 rounded-2xl border border-emerald-500/10">
                  <p className="text-gray-500 mb-2">Total Orders</p>
                  <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-500">{summary.totalOrders}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6">Top 3 Best Sellers</h3>
                <div className="space-y-4">
                  {summary.topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center justify-between p-4 bg-white dark:bg-charcoal border border-emerald-500/10 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-emerald-500 text-white rounded-full font-bold">{i + 1}</span>
                        <span className="font-semibold">{p.name}</span>
                      </div>
                      <span className="text-emerald-600 font-bold">{p.totalQuantity} sold</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Product Management</h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                >
                  <span>➕</span> Add Product
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-emerald-500/10">
                      <th className="pb-4">Name</th>
                      <th className="pb-4">Price</th>
                      <th className="pb-4">Stock</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} className="border-b border-emerald-500/5 last:border-0">
                        <td className="py-4">{p.name}</td>
                        <td className="py-4">${p.price}</td>
                        <td className="py-4">{p.stock}</td>
                        <td className="py-4">
                          <button onClick={() => startEdit(p)} className="text-emerald-600 mr-4 font-semibold hover:underline">Edit</button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="text-red-500 font-semibold hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-emerald-500/10">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Customer</th>
                    <th className="pb-4">Total</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} className="border-b border-emerald-500/5 last:border-0">
                      <td className="py-4 text-xs font-mono">{o._id}</td>
                      <td className="py-4">{(o.user as any)?.name || 'Unknown'}</td>
                      <td className="py-4">${o.totalAmount}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' :
                          o.status === 'cancelled' ? 'bg-red-500/10 text-red-600' :
                            'bg-amber-500/10 text-amber-600'
                          }`}>
                          {o.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        {o.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateOrderStatus(o._id, 'completed')}
                              className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded hover:bg-emerald-600 transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateOrderStatus(o._id, 'cancelled')}
                              className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors"
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
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-emerald-500/10">
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-emerald-500/5 last:border-0">
                      <td className="py-4">{u.name}</td>
                      <td className="py-4">{u.email}</td>
                      <td className="py-4 capitalize">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingProduct(null)}></div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
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
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingProduct(null)} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl relative z-10 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Product Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="e.g., Premium Watch"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={addForm.description}
                  onChange={e => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  placeholder="Describe the product..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={addForm.price}
                    onChange={e => setAddForm({ ...addForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
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
                    className="w-full px-4 py-3 border border-emerald-500/20 rounded-xl bg-emerald-500/5 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                    min="0"
                    placeholder="50"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
