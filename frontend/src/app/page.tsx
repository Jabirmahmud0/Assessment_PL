'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/products?limit=4');
        setFeatured(data.products);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 bg-emerald-gradient opacity-80"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-gold/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">Elevate Your Style</h1>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Discover our curated collection of premium products designed for those who appreciate the finer things in life.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products" className="btn-emerald px-10 py-4 text-lg">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-12 bg-cream-warm dark:bg-charcoal-card border-y border-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-4">💎</span>
            <h3 className="font-bold mb-2">Quality Products</h3>
            <p className="text-sm text-gray-500">Handpicked for excellence</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-4">🏷️</span>
            <h3 className="font-bold mb-2">Best Prices</h3>
            <p className="text-sm text-gray-500">Luxury made accessible</p>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-4">🚚</span>
            <h3 className="font-bold mb-2">Fast Delivery</h3>
            <p className="text-sm text-gray-500">Worldwide shipping available</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 max-w-7xl mx-auto px-4 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-gray-500">Our most popular items this week</p>
          </div>
          <Link href="/products" className="text-emerald-600 font-semibold hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featured.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto glossy-card bg-emerald-gradient p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Summer Sale is Live!</h2>
          <p className="text-xl text-emerald-100 mb-8">Get up to 40% off on selected premium items. Limited time offer.</p>
          <Link href="/products" className="bg-white text-emerald-900 px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all">
            Claim Discount
          </Link>
        </div>
      </section>
    </div>
  );
}
