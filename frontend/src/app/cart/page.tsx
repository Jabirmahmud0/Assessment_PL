'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '../../lib/api';
import { Cart } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');

      // Filter out items where the product is null (deleted from database during reseeding)
      if (data && data.items) {
        data.items = data.items.filter((item: any) => item.product !== null);
      }
      setCart(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: string, currentQty: number, change: number, stock: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > stock) {
      addToast(`Only ${stock} items available in stock!`, 'error');
      return;
    }

    try {
      setCart(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item =>
            item.product._id === productId ? { ...item, quantity: newQty } : item
          )
        };
      });
      await api.post('/cart', { productId, quantity: change });
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update quantity', 'error');
      fetchCart();
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/cart/${productId}`);
      fetchCart();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  const placeOrder = async () => {
    try {
      await api.post('/orders');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      addToast('Order placed successfully!', 'success');
      router.push('/profile');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  const total = cart?.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <span className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-600">🛒</span>
          Your Shopping Cart
        </h1>
        {cart && cart.items.length > 0 && (
          <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300">
            {cart.items.reduce((acc, item) => acc + item.quantity, 0)} Items
          </span>
        )}
      </div>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-20 glossy-card border-dashed border-2">
          <div className="text-6xl mb-6">🛍️</div>
          <h2 className="text-2xl font-bold mb-3">Your cart feels a little empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Explore our awesome products!</p>
          <button onClick={() => router.push('/products')} className="btn-emerald px-10 py-4 text-lg font-bold">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div key={item._id} className="glossy-card p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-xl transition-all duration-300">
                {/* Product Image */}
                <div onClick={() => router.push(`/products/${item.product._id}`)} className="relative w-full sm:w-32 h-32 bg-emerald-500/5 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-grow flex flex-col justify-between h-full w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 onClick={() => router.push(`/products/${item.product._id}`)} className="font-bold text-lg hover:text-emerald-500 cursor-pointer transition-colors line-clamp-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${item.product.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border-2 border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity, -1, item.product.stock)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-lg"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-sm select-none">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity, 1, item.product.stock)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-lg"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Subtotal</p>
                      <span className="font-black text-xl text-gray-900 dark:text-white">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glossy-card p-6 sm:p-8 sticky top-6 border-2 border-emerald-500/10">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cart.items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Shipping limit</span>
                  <span className="text-emerald-500">Free</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-500 uppercase font-bold">Total</p>
                  <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">${total.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={placeOrder}
                className="w-full btn-emerald py-4 text-lg font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all"
              >
                Checkout Securely
              </button>

              <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
                <span className="text-emerald-500">🔒</span> Secured & Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
