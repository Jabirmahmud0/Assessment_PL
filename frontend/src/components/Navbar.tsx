'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchCartCount = async () => {
        try {
          const { data } = await api.get('/cart');
          const validItems = data.items?.filter((item: any) => item.product !== null) || [];
          const totalItems = validItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
          setCartCount(totalItems);
        } catch (err) {
          setCartCount(0);
        }
      };
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (user) {
        const fetchCartCount = async () => {
          try {
            const { data } = await api.get('/cart');
            const validItems = data.items?.filter((item: any) => item.product !== null) || [];
            const totalItems = validItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
            setCartCount(totalItems);
          } catch (err) {
            setCartCount(0);
          }
        };
        fetchCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, [user]);

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 dark:bg-charcoal/70 border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 mr-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-emerald-500 hover:bg-emerald-500/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <Link href="/" className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">
              EMERALD
            </Link>
          </div>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="hover:text-emerald-500 transition-colors">Home</Link>
            <Link href="/products" className="hover:text-emerald-500 transition-colors">Products</Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <Link href="/cart" className="p-2 rounded-full hover:bg-emerald-500/10 transition-colors relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-emerald-500/10 transition-colors">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {user ? (
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center p-2 rounded-full hover:bg-emerald-500/10 transition-colors focus:outline-none"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 glossy-card rounded-xl shadow-lg border border-emerald-500/20 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-emerald-gradient text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-charcoal border-b border-emerald-500/20">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              Products
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
