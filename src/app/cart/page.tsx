'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/stripe';

export default function CartPage() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const { cart, updateQuantity, removeItem, clearCart, getTotalAmount, getTaxAmount, getGrandTotal } = useCart();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F1EB' }}>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ 
                    color: '#6B5B4D',
                    backgroundColor: '#E8E1D9'
                  }}
                >
                  ← Back to Menu
                </Link>
                <h1 
                  className="text-2xl font-bold"
                  style={{ 
                    color: '#2D1B12',
                    fontFamily: 'Cormorant Garamond, serif'
                  }}
                >
                  Cart
                </h1>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link
              href="/"
              className="px-6 py-3 rounded-md text-lg font-medium transition-colors"
              style={{ 
                backgroundColor: '#B87333',
                color: 'white'
              }}
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Menu
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Cart ({cart.itemCount} items)
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                {language === 'en' ? '中文' : 'English'}
              </button>
              <button
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-800 px-3 py-2 rounded-md text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {item.menuItem.name[language]}
                        </h4>
                        <p className="text-gray-600 mt-1">
                          {item.menuItem.description[language]}
                        </p>
                        <p className="text-gray-900 font-semibold mt-2">
                          {formatCurrency(item.unitPrice)} each
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-3">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(item.totalPrice)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(getTotalAmount())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (7.00% MA)</span>
                  <span className="font-semibold">{formatCurrency(getTaxAmount())}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(getGrandTotal())}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full py-3 rounded-md text-white font-medium transition-colors text-center block"
                  style={{ backgroundColor: '#B87333' }}
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/"
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 