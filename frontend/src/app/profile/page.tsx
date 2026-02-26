'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { Order, User } from '../../types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Update State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEditName(parsedUser.name);
    setEditEmail(parsedUser.email);
    fetchOrders();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateMessage('');
    try {
      const { data } = await api.put('/users/profile', {
        name: editName,
        email: editEmail
      });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setIsEditing(false);
      setUpdateMessage('Profile updated successfully! ✨');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err: any) {
      setUpdateMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    router.push('/login');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  // Dynamic Stats
  const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      {updateMessage && (
        <div className={`fixed top-24 right-8 px-6 py-3 rounded-xl shadow-lg transform transition-all z-50 font-medium ${updateMessage.includes('Failed') ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'}`}>
          {updateMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glossy-card p-8 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>

            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-5xl text-white font-bold shadow-xl shadow-emerald-500/20 mb-6 ring-4 ring-white dark:ring-gray-800">
                {user?.name.charAt(0).toUpperCase()}
              </div>

              <h1 className="text-2xl font-bold mb-1">{user?.name}</h1>
              <p className="text-gray-500 text-sm mb-4">{user?.email}</p>

              <div className="inline-flex m-1 px-4 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">
                {user?.role} Role
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold transition-colors"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Dynamic Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glossy-card p-4 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Spent</p>
              <p className="text-2xl font-black text-emerald-600">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="glossy-card p-4 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Orders</p>
              <p className="text-2xl font-black">{orders.length}</p>
            </div>
            <div className="glossy-card p-4 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Completed</p>
              <p className="text-2xl font-black text-green-500">{completedOrders}</p>
            </div>
            <div className="glossy-card p-4 text-center">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pending</p>
              <p className="text-2xl font-black text-yellow-500">{pendingOrders}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">

          {/* Edit Profile Form */}
          {isEditing && (
            <div className="glossy-card p-8 animate-fade-in border-2 border-emerald-500/20">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-emerald-500">⚙️</span> Profile Settings
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updateLoading}
                    className="btn-emerald px-8 py-3 w-full md:w-auto text-sm"
                  >
                    {updateLoading ? 'Saving changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Orders Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">🛍️</span>
              Order History
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="glossy-card p-16 text-center border-dashed border-2">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Looks like you haven't made your first purchase.</p>
              <button onClick={() => router.push('/products')} className="btn-emerald px-8 font-medium">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="glossy-card overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  <div className="p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-800/20 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${order.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {order.status === 'completed' ? '✓' : order.status === 'cancelled' ? '✕' : '⏳'}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order #{order._id.slice(-8)}</p>
                        <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto w-full mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-gray-800">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold text-right mb-1">Total</p>
                        <p className="font-black text-xl text-emerald-600 dark:text-emerald-400">${order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Ordered Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                              {item.quantity}x
                            </span>
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-gray-600 dark:text-gray-300">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
