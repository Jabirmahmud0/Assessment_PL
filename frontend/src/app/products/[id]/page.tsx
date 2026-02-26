'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { Product } from '../../../types';

import { useToast } from '../../../context/ToastContext';
import Image from 'next/image';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await api.post('/cart', { productId: id, quantity });

      // Optistic UI update for stock
      setProduct(prev => prev ? { ...prev, stock: prev.stock - quantity } : null);

      addToast('Added to cart!', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to add to cart', 'error');
    }
  };

  if (loading) return <div className="p-12 text-center">Loading product...</div>;
  if (error || !product) return <div className="p-12 text-center text-red-500">{error || 'Product not found'}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="glossy-card relative aspect-square bg-emerald-500/5 flex items-center justify-center overflow-hidden rounded-2xl w-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <span className="text-9xl">📦</span>
          )}
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-500 mb-6">${product.price}</p>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{product.description}</p>

          <div className="mb-8">
            <p className="text-sm font-medium mb-4">Availability:
              <span className={product.stock > 0 ? 'text-emerald-600 ml-2' : 'text-red-600 ml-2'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </p>

            {product.stock > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-emerald-500/20 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-4 py-2 hover:bg-emerald-500/10 transition-colors"
                  >-</button>
                  <span className="px-4 py-2 font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-4 py-2 hover:bg-emerald-500/10 transition-colors"
                  >+</button>
                </div>
                <button onClick={addToCart} className="btn-emerald flex-grow">Add to Cart</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
