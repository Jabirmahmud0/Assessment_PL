'use client';

import Link from 'next/link';
import { Product } from '../types';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [localStock, setLocalStock] = useState(product.stock);
  const { addToast } = useToast();

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await api.post('/cart', { productId: product._id, quantity: 1 });
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setLocalStock(prev => prev - 1);
      addToast('Added to cart!', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    }
  };

  return (
    <Link href={`/products/${product._id}`} className="glossy-card group overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-emerald-500/5 flex items-center justify-center w-full">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <span className="text-4xl">📦</span>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg group-hover:text-emerald-600 transition-colors">{product.name}</h3>
          <span className={`whitespace-nowrap text-xs px-2 py-1 rounded-full ${localStock > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
            {localStock > 0 ? `${localStock} in stock` : 'Out of Stock'}
          </span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-500">${product.price}</span>
          <button
            onClick={addToCart}
            disabled={localStock === 0}
            className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛒
          </button>
        </div>
      </div>
    </Link>
  );
}
