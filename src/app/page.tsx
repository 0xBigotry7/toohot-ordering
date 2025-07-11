'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { MenuItem } from '@/types';
import { getCategoriesFromMenuItems } from '@/lib/menu-api';
import { loadMenuItemsWithFetch } from '@/lib/menu-api-fetch';
import AuthModal from '@/components/AuthModal';
import WabiSabiMenuCard from '@/components/WabiSabiMenuCard';
import { PageAnalytics } from '@/components/Analytics';
import { useMenuTracking } from '@/hooks/useAnalytics';

// This function is now handled by getCategoriesFromMenuItems in the API

// Legacy Menu Item Components for different view modes (kept for reference)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LegacyMenuItemCard = ({ 
  item, 
  language, 
  onAddToCart, 
  showFeedback,
  cartQuantity 
}: { 
  item: MenuItem, 
  language: 'en' | 'zh', 
  onAddToCart: (item: MenuItem) => void, 
  showFeedback?: boolean,
  cartQuantity: number
}) => (
  <div 
    className="rounded-xl shadow-sm overflow-hidden p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 backdrop-blur-sm"
    style={{ backgroundColor: 'rgba(249, 246, 242, 0.95)' }}
  >
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
      <div className="flex-1 mb-2 sm:mb-0">
        <h3 
          className="text-lg sm:text-xl font-bold mb-1 line-clamp-2"
          style={{ 
            color: '#2D1B12', 
            fontFamily: 'Cormorant Garamond, serif' 
          }}
        >
          {item.name[language]}
        </h3>
        {language === 'en' && item.name.zh && (
          <p className="text-sm sm:text-base mb-2 opacity-75" style={{ color: '#6B5B4D' }}>
            {item.name.zh}
          </p>
        )}
        {language === 'zh' && item.name.en && (
          <p className="text-sm sm:text-base mb-2 opacity-75" style={{ color: '#6B5B4D' }}>
            {item.name.en}
          </p>
        )}
      </div>
      <span 
        className="text-xl sm:text-2xl font-bold ml-0 sm:ml-4 self-start"
        style={{ color: '#B87333' }}
      >
        {item.price}
      </span>
    </div>
    
    <p className="text-sm mb-4 line-clamp-3" style={{ color: '#6B5B4D' }}>
      {item.description[language]}
    </p>
    
    {/* Attributes */}
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {item.spiceLevel && item.spiceLevel > 0 && (
        <span className="text-xs sm:text-sm flex items-center px-2 py-1 rounded-full"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
          <span className="mr-1">🌶️</span>
          <span>{'🌶️'.repeat(item.spiceLevel - 1)}</span>
        </span>
      )}
      {item.isSignature && (
        <span className="text-xs sm:text-sm flex items-center px-2 py-1 rounded-full"
              style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
          <span className="mr-1">👑</span>
          <span>{language === 'en' ? 'Signature' : '招牌'}</span>
        </span>
      )}
      {item.isVegetarian && (
        <span className="text-xs sm:text-sm flex items-center px-2 py-1 rounded-full"
              style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
          <span className="mr-1">🌱</span>
          <span>{language === 'en' ? 'Vegetarian' : '素食'}</span>
        </span>
      )}
      {item.isVegan && (
        <span className="text-xs sm:text-sm flex items-center px-2 py-1 rounded-full"
              style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
          <span className="mr-1">🌿</span>
          <span>{language === 'en' ? 'Vegan' : '纯素'}</span>
        </span>
      )}
    </div>
    
    {/* Add to Cart Section */}
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {cartQuantity > 0 && (
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium animate-pulse"
               style={{ backgroundColor: '#FEF3C7', color: '#B87333' }}>
            <span>🛒</span>
            <span>{cartQuantity} in cart</span>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onAddToCart(item)}
        className={`px-4 py-2 rounded-lg transition-all text-sm font-medium transform hover:scale-105 active:scale-95 ${
          showFeedback ? 'animate-bounce ring-2 ring-green-400' : ''
        }`}
        style={{ 
          backgroundColor: showFeedback ? '#22C55E' : '#B87333', 
          color: 'white',
          boxShadow: showFeedback ? '0 4px 12px rgba(34, 197, 94, 0.3)' : '0 2px 8px rgba(184, 115, 51, 0.3)'
        }}
        onMouseOver={(e) => {
          if (!showFeedback) {
            e.currentTarget.style.backgroundColor = '#A66929';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(166, 105, 41, 0.4)';
          }
        }}
        onMouseOut={(e) => {
          if (!showFeedback) {
            e.currentTarget.style.backgroundColor = '#B87333';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(184, 115, 51, 0.3)';
          }
        }}
      >
        <span className="flex items-center space-x-1">
          {showFeedback && <span>✅</span>}
          <span>{language === 'en' ? 'Add to Cart' : '加入购物车'}</span>
        </span>
      </button>
    </div>
    
    {item.allergens && item.allergens.length > 0 && (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs opacity-75" style={{ color: '#6B5B4D' }}>
          <span className="font-medium">Contains:</span> {item.allergens.join(', ')}
        </p>
      </div>
    )}
  </div>
);

const MenuItemList = ({ item, language, onAddToCart, showFeedback, cartQuantity }: { item: MenuItem, language: 'en' | 'zh', onAddToCart: (item: MenuItem) => void, showFeedback?: boolean, cartQuantity: number }) => (
  <div 
    className="rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
    style={{ backgroundColor: '#F9F6F2' }}
  >
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 
              className="text-xl font-bold"
              style={{ 
                color: '#2D1B12', 
                fontFamily: 'Cormorant Garamond, serif' 
              }}
            >
              {item.name[language]}
            </h3>
            {language === 'en' && item.name.zh && (
              <p className="text-base text-gray-600">{item.name.zh}</p>
            )}
            {language === 'zh' && item.name.en && (
              <p className="text-base text-gray-600">{item.name.en}</p>
            )}
          </div>
          <span 
            className="text-xl font-bold ml-4"
            style={{ color: '#B87333' }}
          >
            {item.price}
          </span>
        </div>
        
        <p className="text-sm mb-3" style={{ color: '#6B5B4D' }}>
          {item.description[language]}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {item.spiceLevel && item.spiceLevel > 0 && (
              <span className="text-sm flex items-center">
                <span style={{ color: '#6B5B4D' }}>Spice: </span>
                <span className="text-red-500 ml-1">
                  {'🌶️'.repeat(item.spiceLevel)}
                </span>
              </span>
            )}
            {item.isSignature && <span className="text-yellow-500 text-lg">👑</span>}
            {item.isVegetarian && <span className="text-green-500 text-lg">🌱</span>}
            {item.isVegan && <span className="text-green-600 text-lg">🌿</span>}
          </div>
          
          <div className="flex items-center space-x-4">
            {cartQuantity > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium"
                   style={{ backgroundColor: '#FEF3C7', color: '#B87333' }}>
                <span>🛒</span>
                <span>{cartQuantity} in cart</span>
              </div>
            )}
            <button
              onClick={() => onAddToCart(item)}
              className={`px-4 py-2 rounded-md transition-all text-sm font-medium ${
                showFeedback ? 'animate-pulse ring-2 ring-green-400' : ''
              }`}
              style={{ 
                backgroundColor: showFeedback ? '#22C55E' : '#B87333', 
                color: 'white' 
              }}
              onMouseOver={(e) => {
                if (!showFeedback) e.currentTarget.style.backgroundColor = '#A66929'
              }}
              onMouseOut={(e) => {
                if (!showFeedback) e.currentTarget.style.backgroundColor = '#B87333'
              }}
            >
              <span className="flex items-center space-x-1">
                {showFeedback && <span>✅</span>}
                <span>{language === 'en' ? 'Add to Cart' : '加入购物车'}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MenuItemGrid = ({ item, language, onAddToCart, showFeedback }: { item: MenuItem, language: 'en' | 'zh', onAddToCart: (item: MenuItem) => void, showFeedback?: boolean }) => (
  <div 
    className="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
    style={{ backgroundColor: '#F9F6F2' }}
  >
    <div className="text-center">
      <h3 
        className="text-lg font-bold mb-2"
        style={{ 
          color: '#2D1B12', 
          fontFamily: 'Cormorant Garamond, serif' 
        }}
      >
        {item.name[language]}
      </h3>
      
      <div className="flex justify-center items-center space-x-1 mb-2">
        {item.spiceLevel && item.spiceLevel > 0 && (
          <span className="text-red-500 text-sm">
            {'🌶️'.repeat(item.spiceLevel)}
          </span>
        )}
        {item.isSignature && <span className="text-yellow-500">👑</span>}
        {item.isVegetarian && <span className="text-green-500">🌱</span>}
        {item.isVegan && <span className="text-green-600">🌿</span>}
      </div>
      
      <span 
        className="text-lg font-bold block mb-3"
        style={{ color: '#B87333' }}
      >
        {item.price}
      </span>
      
      <button
        onClick={() => onAddToCart(item)}
        className={`w-full px-3 py-2 rounded-md transition-all text-sm font-medium ${
          showFeedback ? 'animate-pulse ring-2 ring-green-400' : ''
        }`}
        style={{ 
          backgroundColor: showFeedback ? '#22C55E' : '#B87333', 
          color: 'white' 
        }}
      >
        <span className="flex items-center justify-center space-x-1">
          {showFeedback && <span>✅</span>}
          <span>{language === 'en' ? 'Add' : '加入'}</span>
        </span>
      </button>
    </div>
  </div>
);

const MenuItemTable = ({ items, language, onAddToCart, showAddedToCartFeedback }: { items: MenuItem[], language: 'en' | 'zh', onAddToCart: (item: MenuItem) => void, showAddedToCartFeedback?: string | null }) => (
  <div 
    className="rounded-lg shadow-sm overflow-hidden"
    style={{ backgroundColor: '#F9F6F2' }}
  >
    <table className="w-full">
      <thead style={{ backgroundColor: '#E8E1D9' }}>
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#2D1B12' }}>
            {language === 'en' ? 'Name' : '名称'}
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#2D1B12' }}>
            {language === 'en' ? 'Description' : '描述'}
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#2D1B12' }}>
            {language === 'en' ? 'Price' : '价格'}
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#2D1B12' }}>
            {language === 'en' ? 'Spice' : '辣度'}
          </th>
          <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: '#2D1B12' }}>
            {language === 'en' ? 'Action' : '操作'}
          </th>
        </tr>
      </thead>
      <tbody className="divide-y" style={{ borderColor: '#E8E1D9' }}>
        {items.map((item) => (
          <tr 
            key={item.id} 
            className="transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <td className="px-6 py-4">
              <div>
                <div 
                  className="text-sm font-medium"
                  style={{ 
                    color: '#2D1B12', 
                    fontFamily: 'Cormorant Garamond, serif' 
                  }}
                >
                  {item.name[language]}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  {item.isSignature && <span className="text-yellow-500 text-xs">👑</span>}
                  {item.isVegetarian && <span className="text-green-500 text-xs">🌱</span>}
                  {item.isVegan && <span className="text-green-600 text-xs">🌿</span>}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm" style={{ color: '#6B5B4D' }}>
                {item.description[language]}
              </div>
            </td>
            <td className="px-6 py-4">
              <span 
                className="text-sm font-medium"
                style={{ color: '#B87333' }}
              >
                {item.price}
              </span>
            </td>
            <td className="px-6 py-4">
              {item.spiceLevel && item.spiceLevel > 0 && (
                <span className="text-red-500 text-sm">
                  {'🌶️'.repeat(item.spiceLevel)}
                </span>
              )}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onAddToCart(item)}
                className={`px-3 py-1 rounded-md transition-all text-sm font-medium ${
                  showAddedToCartFeedback === item.id ? 'animate-pulse ring-2 ring-green-400' : ''
                }`}
                style={{ 
                  backgroundColor: showAddedToCartFeedback === item.id ? '#22C55E' : '#B87333', 
                  color: 'white' 
                }}
                onMouseOver={(e) => {
                  if (showAddedToCartFeedback !== item.id) e.currentTarget.style.backgroundColor = '#A66929'
                }}
                onMouseOut={(e) => {
                  if (showAddedToCartFeedback !== item.id) e.currentTarget.style.backgroundColor = '#B87333'
                }}
              >
                <span className="flex items-center justify-center space-x-1">
                  {showAddedToCartFeedback === item.id && <span>✅</span>}
                  <span>{language === 'en' ? 'Add' : '加入'}</span>
                </span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Slide-out Cart Component
const SlideOutCart = ({ 
  isOpen, 
  onClose, 
  cart, 
  language, 
  updateQuantity, 
  removeItem, 
  clearCart, 
  getTotalAmount, 
  getTaxAmount, 
  getGrandTotal,
  formatCurrency,
  onCheckout
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: {
    items: Array<{
      id: string;
      quantity: number;
      menuItem: MenuItem;
      totalPrice: number;
    }>;
  };
  language: 'en' | 'zh';
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
  formatCurrency: (cents: number) => string;
  onCheckout: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-50 transition-opacity backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div 
        className="fixed right-0 top-0 h-full w-full sm:w-96 max-w-md shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col backdrop-blur-md"
        style={{ backgroundColor: 'rgba(249, 246, 242, 0.95)' }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b"
          style={{ borderBottomColor: '#E8E1D9' }}
        >
          <div className="flex items-center justify-between">
            <h2 
              className="text-xl font-bold"
              style={{ 
                color: '#2D1B12', 
                fontFamily: 'Cormorant Garamond, serif' 
              }}
            >
              {language === 'en' ? 'Your Order' : '您的订单'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{ 
                backgroundColor: '#E8E1D9',
                color: '#2D1B12'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D4C4B8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E8E1D9'}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p 
                className="text-lg mb-2"
                style={{ color: '#2D1B12' }}
              >
                {language === 'en' ? 'Your cart is empty' : '购物车为空'}
              </p>
              <p style={{ color: '#6B5B4D' }}>
                {language === 'en' ? 'Add some delicious dishes!' : '添加一些美味的菜品吧！'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-lg p-4 border"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E8E1D9'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 
                      className="font-medium flex-1"
                      style={{ color: '#2D1B12' }}
                    >
                      {item.menuItem.name[language]}
                    </h4>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
                        style={{ 
                          backgroundColor: '#E8E1D9',
                          color: '#2D1B12'
                        }}
                      >
                        −
                      </button>
                      <span 
                        className="w-10 text-center font-bold text-lg"
                        style={{ color: '#2D1B12' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95"
                        style={{ 
                          backgroundColor: '#E8E1D9',
                          color: '#2D1B12'
                        }}
                      >
                        +
                      </button>
                    </div>
                    <span 
                      className="font-medium"
                      style={{ color: '#B87333' }}
                    >
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with totals and checkout */}
        {cart.items.length > 0 && (
          <div 
            className="p-6 border-t"
            style={{ borderTopColor: '#E8E1D9' }}
          >
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span style={{ color: '#6B5B4D' }}>
                  {language === 'en' ? 'Subtotal' : '小计'}
                </span>
                <span style={{ color: '#2D1B12' }}>
                  {formatCurrency(getTotalAmount())}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#6B5B4D' }}>
                                        {language === 'en' ? 'Tax (7.00% MA)' : '税费 (7.00% MA)'}
                </span>
                <span style={{ color: '#2D1B12' }}>
                  {formatCurrency(getTaxAmount())}
                </span>
              </div>
              <div 
                className="flex justify-between text-lg font-bold pt-2 border-t"
                style={{ borderTopColor: '#E8E1D9' }}
              >
                <span style={{ color: '#2D1B12' }}>
                  {language === 'en' ? 'Total' : '总计'}
                </span>
                <span style={{ color: '#B87333' }}>
                  {formatCurrency(getGrandTotal())}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={onCheckout}
                className="w-full py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: '#B87333',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(184, 115, 51, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#A66929';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(166, 105, 41, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#B87333';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 115, 51, 0.3)';
                }}
              >
                🎯 {language === 'en' ? 'Proceed to Checkout' : '去结账'}
              </button>
              
              <button
                onClick={() => {
                  if (confirm(language === 'en' ? 'Clear cart?' : '清空购物车？')) {
                    clearCart();
                  }
                }}
                className="w-full py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 border"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#6B5B4D',
                  borderColor: '#E8E1D9'
                }}
              >
                🗑️ {language === 'en' ? 'Clear Cart' : '清空购物车'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Array<{id: string, name: { en: string; zh: string }}>>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'grid' | 'table'>('cards');
  const [showVegetarianOnly, setShowVegetarianOnly] = useState(false);
  const [spiceLevelFilter, setSpiceLevelFilter] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showAddedToCartFeedback, setShowAddedToCartFeedback] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ user_metadata?: { first_name?: string }; email?: string; id?: string } | null>(null);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [allergenFilters, setAllergenFilters] = useState<{
    nutFree: boolean;
    dairyFree: boolean;
    glutenFree: boolean;
    soyFree: boolean;
    eggFree: boolean;
  }>({
    nutFree: false,
    dairyFree: false,
    glutenFree: false,
    soyFree: false,
    eggFree: false,
  });
  const { addItem, getItemCount, getTotalAmount, cart, updateQuantity, removeItem, clearCart, getTaxAmount, getGrandTotal } = useCart();
  const router = useRouter();
  const menuTracking = useMenuTracking();

  // Load menu data on component mount - Database first, fallback if needed
  useEffect(() => {
    const loadData = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        );
        
        const menuItemsPromise = loadMenuItemsWithFetch();
        const menuItems = await Promise.race([menuItemsPromise, timeoutPromise]) as MenuItem[];
        
        if (menuItems && menuItems.length > 0) {
          setMenuData(menuItems);
          setCategories(getCategoriesFromMenuItems(menuItems));
        } else {
          setMenuData([]);
          setCategories([{ id: 'all', name: { en: 'All Items', zh: '全部菜品' } }]);
        }
        setIsMenuLoading(false);
      } catch {
        setMenuData([]);
        setCategories([{ id: 'all', name: { en: 'All Items', zh: '全部菜品' } }]);
        setIsMenuLoading(false);
      }
    };
    
    loadData();
  }, []);



  // Scroll tracking for category sidebar
  useEffect(() => {
    if (selectedCategory !== 'all') return;
    
    const handleScroll = () => {
      const sections = categories.filter(cat => cat.id !== 'all').map(cat => ({
        id: cat.id,
        element: document.getElementById(`section-${cat.id}`)
      })).filter(section => section.element);

      let currentSection = 'all';
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (const section of sections) {
        if (section.element && section.element.offsetTop <= scrollPosition) {
          currentSection = section.id;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories, selectedCategory]);

  const filteredItems = menuData.filter((item: MenuItem) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description[language].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVegetarian = !showVegetarianOnly || item.isVegetarian || item.isVegan;
    const matchesSpice = spiceLevelFilter === null || (item.spiceLevel || 0) <= spiceLevelFilter;
    
    // Allergen filtering
    const itemAllergens = item.allergens || [];
    const matchesAllergens = Object.entries(allergenFilters).every(([filterType, isActive]) => {
      if (!isActive) return true;
      
      switch (filterType) {
        case 'nutFree':
          return !itemAllergens.some(allergen => 
            allergen.toLowerCase().includes('nut') || 
            allergen.toLowerCase().includes('peanut') ||
            allergen.toLowerCase().includes('almond') ||
            allergen.toLowerCase().includes('walnut')
          );
        case 'dairyFree':
          return !itemAllergens.some(allergen => 
            allergen.toLowerCase().includes('dairy') || 
            allergen.toLowerCase().includes('milk') ||
            allergen.toLowerCase().includes('cheese') ||
            allergen.toLowerCase().includes('butter')
          );
        case 'glutenFree':
          return !itemAllergens.some(allergen => 
            allergen.toLowerCase().includes('gluten') || 
            allergen.toLowerCase().includes('wheat') ||
            allergen.toLowerCase().includes('flour')
          );
        case 'soyFree':
          return !itemAllergens.some(allergen => 
            allergen.toLowerCase().includes('soy') || 
            allergen.toLowerCase().includes('soya')
          );
        case 'eggFree':
          return !itemAllergens.some(allergen => 
            allergen.toLowerCase().includes('egg')
          );
        default:
          return true;
      }
    });
    
    return matchesCategory && matchesSearch && matchesVegetarian && matchesSpice && matchesAllergens;
  });



  // Group items by category for sectioned display
  const groupedItems = categories.reduce((acc, category) => {
    if (category.id === 'all') return acc;
    const categoryItems = menuData.filter(item => {
      const matchesCategory = item.category === category.id;
      const matchesSearch = searchQuery === '' || 
        item.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description[language].toLowerCase().includes(searchQuery.toLowerCase());
      const matchesVegetarian = !showVegetarianOnly || item.isVegetarian || item.isVegan;
      const matchesSpice = spiceLevelFilter === null || (item.spiceLevel || 0) <= spiceLevelFilter;
      
      // Allergen filtering (same logic as above)
      const itemAllergens = item.allergens || [];
      const matchesAllergens = Object.entries(allergenFilters).every(([filterType, isActive]) => {
        if (!isActive) return true;
        
        switch (filterType) {
          case 'nutFree':
            return !itemAllergens.some(allergen => 
              allergen.toLowerCase().includes('nut') || 
              allergen.toLowerCase().includes('peanut') ||
              allergen.toLowerCase().includes('almond') ||
              allergen.toLowerCase().includes('walnut')
            );
          case 'dairyFree':
            return !itemAllergens.some(allergen => 
              allergen.toLowerCase().includes('dairy') || 
              allergen.toLowerCase().includes('milk') ||
              allergen.toLowerCase().includes('cheese') ||
              allergen.toLowerCase().includes('butter')
            );
          case 'glutenFree':
            return !itemAllergens.some(allergen => 
              allergen.toLowerCase().includes('gluten') || 
              allergen.toLowerCase().includes('wheat') ||
              allergen.toLowerCase().includes('flour')
            );
          case 'soyFree':
            return !itemAllergens.some(allergen => 
              allergen.toLowerCase().includes('soy') || 
              allergen.toLowerCase().includes('soya')
            );
          case 'eggFree':
            return !itemAllergens.some(allergen => 
              allergen.toLowerCase().includes('egg')
            );
          default:
            return true;
        }
      });
      
      return matchesCategory && matchesSearch && matchesVegetarian && matchesSpice && matchesAllergens;
    });
    
    if (categoryItems.length > 0) {
      acc.push({
        category,
        items: categoryItems
      });
    }
    return acc;
  }, [] as Array<{category: {id: string, name: { en: string; zh: string }}, items: MenuItem[]}>);

  const handleAddToCart = (item: MenuItem) => {
    addItem(item, 1);
    // Show visual feedback
    setShowAddedToCartFeedback(item.id);
    setTimeout(() => setShowAddedToCartFeedback(null), 1500);
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.items?.find((item) => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleAuthSuccess = (user: { user_metadata?: { first_name?: string }; email?: string; id?: string }) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // You might want to also clear the session from Supabase here
  };



  // Show loading state to prevent hydration mismatch
  if (isMenuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundImage: 'url("/background_panda.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2D1B12' }}>
            Loading Menu...
          </h2>
          <p className="text-gray-600">
            Fetching the latest dishes for you
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundImage: 'url("/background_panda.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      {/* Analytics page tracking */}
      <PageAnalytics />
      
      {/* Header */}
      <header 
        className="shadow-sm sticky top-0 z-50 border-b backdrop-blur-md"
        style={{ 
          backgroundColor: 'rgba(249, 246, 242, 0.95)',
          borderBottomColor: '#E8E1D9'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center">
              <h1 className="text-lg md:text-2xl font-bold" style={{ color: '#2D1B12', fontFamily: 'Cormorant Garamond, serif' }}>
                <span className="hidden sm:inline">TooHot Online Ordering</span>
                <span className="sm:hidden">TooHot</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Link href="/admin" className="hidden sm:block">
                <button
                  className="px-3 py-1 rounded-md transition-colors text-sm"
                  style={{ 
                    backgroundColor: '#E8E1D9', 
                    color: '#2D1B12' 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D4C4B8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E8E1D9'}
                >
                  {language === 'en' ? '🔧 Admin' : '🔧 管理'}
                </button>
              </Link>
              
              <button
                onClick={() => {
                  const newLanguage = language === 'en' ? 'zh' : 'en';
                  menuTracking.trackLanguageChange(language, newLanguage);
                  setLanguage(newLanguage);
                }}
                className="px-3 py-1 rounded-md transition-colors text-sm"
                style={{ 
                  backgroundColor: '#E8E1D9', 
                  color: '#2D1B12' 
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D4C4B8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E8E1D9'}
              >
                {language === 'en' ? '中文' : 'English'}
              </button>
              
              {/* Authentication Button */}
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm hidden md:inline" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Welcome' : '欢迎'}, {currentUser.user_metadata?.first_name || currentUser.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1 rounded-md transition-colors text-sm"
                    style={{ 
                      backgroundColor: '#E8E1D9', 
                      color: '#2D1B12' 
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D4C4B8'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E8E1D9'}
                  >
                    {language === 'en' ? 'Logout' : '退出'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1 rounded-md transition-colors text-sm"
                  style={{ 
                    backgroundColor: '#B87333', 
                    color: 'white' 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#A66929'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#B87333'}
                >
                  {language === 'en' ? 'Login' : '登录'}
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(true)}
                className="px-2 md:px-4 py-2 rounded-md transition-all flex items-center space-x-1 md:space-x-2 relative transform hover:scale-105 active:scale-95"
                style={{ 
                  backgroundColor: '#B87333', 
                  color: 'white' 
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#A66929'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#B87333'}
              >
                <span className="text-lg">🛒</span>
                <span className="text-sm md:text-base">
                  <span className="hidden sm:inline">Cart ({getItemCount()})</span>
                  <span className="sm:hidden">({getItemCount()})</span>
                </span>
                {getTotalAmount() > 0 && (
                  <span 
                    className="hidden md:inline px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                  >
                    {formatCurrency(getTotalAmount())}
                  </span>
                )}
                {getItemCount() > 0 && (
                  <span 
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse"
                    style={{ backgroundColor: '#DC2626' }}
                  >
                    {getItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Title */}
      <div className="text-center py-8">
        <h1 
          className="text-5xl font-bold mb-2"
          style={{ 
            color: '#2D1B12', 
            fontFamily: 'Cormorant Garamond, serif' 
          }}
        >
          Our Menu
        </h1>
        <div 
          className="w-16 h-0.5 mx-auto"
          style={{ backgroundColor: '#B87333' }}
        ></div>
      </div>

      {/* Controls Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div 
          className="rounded-lg shadow-sm overflow-hidden"
          style={{ backgroundColor: '#F9F6F2' }}
        >
          {/* Top Row - Search and View Mode */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b border-gray-200">
            {/* Enhanced Search */}
            <div className="flex items-center space-x-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search dishes, ingredients, flavors...' : '搜索菜品、食材、口味...'}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  style={{ backgroundColor: '#FFFFFF', color: 'black' }}
                  value={searchQuery}
                  onChange={(e) => {
                    const newQuery = e.target.value;
                    setSearchQuery(newQuery);
                    
                    // Track search analytics (debounced)
                    if (newQuery.trim().length > 2) {
                      setTimeout(() => {
                        const results = menuData.filter(item => 
                          item.name[language].toLowerCase().includes(newQuery.toLowerCase()) ||
                          item.description[language].toLowerCase().includes(newQuery.toLowerCase())
                        );
                        menuTracking.trackSearch(newQuery, language, results.length);
                      }, 1000);
                    }
                  }}
                />
              </div>
              
              {/* Spice Level Selector */}
              <div className="relative">
                <select
                  value={spiceLevelFilter || ''}
                  onChange={(e) => {
                    const newLevel = e.target.value ? parseInt(e.target.value) : null;
                    setSpiceLevelFilter(newLevel);
                    
                    // Track filter usage
                    menuTracking.trackFilter('spice_level', newLevel ? newLevel.toString() : 'all', language);
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm appearance-none bg-white pr-8"
                  style={{ backgroundColor: '#FFFFFF', color: 'black' }}
                >
                  <option value="">🌶️ All Spice Levels</option>
                  <option value="1">🌶️ Mild</option>
                  <option value="2">🌶️🌶️ Medium</option>
                  <option value="3">🌶️🌶️🌶️ Hot</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium" style={{ color: '#2D1B12' }}>View:</span>
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {[
                  { mode: 'cards', icon: '⊞', label: 'Cards' },
                  { mode: 'list', icon: '☰', label: 'List' },
                  { mode: 'grid', icon: '⊡', label: 'Grid' },
                  { mode: 'table', icon: '⊟', label: 'Table' }
                ].map((view) => (
                  <button
                    key={view.mode}
                    onClick={() => setViewMode(view.mode as 'cards' | 'list' | 'grid' | 'table')}
                    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1 ${
                      viewMode === view.mode ? 'text-white' : 'text-gray-700'
                    }`}
                    style={{
                      backgroundColor: viewMode === view.mode ? '#B87333' : '#FFFFFF'
                    }}
                  >
                    <span>{view.icon}</span>
                    <span className="hidden sm:inline">{view.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row - Filters */}
          <div className="p-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium mr-2" style={{ color: '#2D1B12' }}>
                <span className="text-gray-400">🔍</span> Filters:
              </span>
              
              {/* Vegetarian Filter */}
              <button 
                onClick={() => setShowVegetarianOnly(!showVegetarianOnly)}
                className={`px-3 py-2 rounded-full text-sm transition-colors border ${
                  showVegetarianOnly ? 'text-white border-green-500' : 'text-gray-700 border-gray-300'
                }`}
                style={{ 
                  backgroundColor: showVegetarianOnly ? '#22C55E' : '#FFFFFF'
                }}
              >
                🌱 Vegetarian
              </button>
              
              {/* Allergen Filters */}
              {Object.entries({
                nutFree: { label: 'Nut-Free', icon: '🥜' },
                dairyFree: { label: 'Dairy-Free', icon: '🥛' },
                glutenFree: { label: 'Gluten-Free', icon: '🌾' },
                soyFree: { label: 'Soy-Free', icon: '🌱' },
                eggFree: { label: 'Egg-Free', icon: '🥚' }
              }).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  onClick={() => setAllergenFilters(prev => ({
                    ...prev,
                    [key]: !prev[key as keyof typeof prev]
                  }))}
                  className={`px-3 py-2 rounded-full text-sm transition-colors border ${
                    allergenFilters[key as keyof typeof allergenFilters] 
                      ? 'text-white border-orange-500' 
                      : 'text-gray-700 border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: allergenFilters[key as keyof typeof allergenFilters] 
                      ? '#B87333' 
                      : '#FFFFFF'
                  }}
                >
                  <span className="mr-1">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Category & Filter Controls */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setIsMobileCategoryOpen(true)}
            className="flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: '#B87333', 
              color: 'white' 
            }}
          >
            <span>📂</span>
            <span className="font-medium">
              {language === 'en' ? 'Categories' : '分类'}
            </span>
          </button>
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="flex-1 px-4 py-3 rounded-lg transition-all flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: '#E8E1D9', 
              color: '#2D1B12' 
            }}
          >
            <span>🔍</span>
            <span className="font-medium">
              {language === 'en' ? 'Filters' : '筛选'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
        {/* Desktop Category Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 h-fit">
          <div 
            className="rounded-lg shadow-sm p-6 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(249, 246, 242, 0.95)' }}
          >
            <h3 
              className="text-lg font-bold mb-4"
              style={{ 
                color: '#2D1B12', 
                fontFamily: 'Cormorant Garamond, serif' 
              }}
            >
              Categories
            </h3>
            <nav className="space-y-2">
              {categories.map((category) => {
                const categoryCount = menuData.filter(item => 
                  category.id === 'all' || item.category === category.id
                ).length;
                
                // For scroll tracking - highlight current section when viewing all
                const isCurrentSection = selectedCategory === 'all' 
                  ? activeSection === category.id 
                  : selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      // Track category selection analytics
                      const itemCount = menuData.filter(item => 
                        category.id === 'all' || item.category === category.id
                      ).length;
                      
                      menuTracking.trackCategorySelection(category.name[language], language, itemCount);
                      
                      setSelectedCategory(category.id);
                      if (category.id !== 'all') {
                        const element = document.getElementById(`section-${category.id}`);
                        element?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-between ${
                      isCurrentSection ? 'text-white shadow-lg' : 'text-gray-700'
                    }`}
                    style={{
                      backgroundColor: isCurrentSection ? '#B87333' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentSection) {
                        e.currentTarget.style.backgroundColor = '#E8E1D9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentSection) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span className="font-medium">{category.name[language]}</span>
                    <span className="text-sm opacity-75 bg-white bg-opacity-20 px-2 py-1 rounded-full">{categoryCount}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Menu Content */}
        <main className="flex-1">
          {selectedCategory === 'all' ? (
            // Show all categories in sections
            <div className="space-y-12">
              {groupedItems.map((group, index) => (
                <section 
                  key={group.category.id} 
                  id={`section-${group.category.id}`}
                  className="scroll-mt-20"
                >
                  {/* Category Header */}
                  <div className="mb-8">
                    <h2 
                      className="text-3xl font-bold mb-2"
                      style={{ 
                        color: '#2D1B12', 
                        fontFamily: 'Cormorant Garamond, serif' 
                      }}
                    >
                      {group.category.name[language]}
                    </h2>
                    <div 
                      className="w-12 h-0.5 mb-6"
                      style={{ backgroundColor: '#B87333' }}
                    ></div>
                    
                    {/* Items in selected view mode */}
                                         {viewMode === 'cards' && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                         {group.items.map((item) => (
                           <WabiSabiMenuCard 
                             key={item.id} 
                             item={item} 
                             language={language} 
                             onAddToCart={handleAddToCart}
                             showFeedback={showAddedToCartFeedback === item.id}
                             cartQuantity={getItemQuantityInCart(item.id)}
                           />
                         ))}
                       </div>
                     )}
                    
                                         {viewMode === 'list' && (
                       <div className="space-y-4">
                         {group.items.map((item) => (
                           <MenuItemList 
                             key={item.id} 
                             item={item} 
                             language={language} 
                             onAddToCart={handleAddToCart}
                             showFeedback={showAddedToCartFeedback === item.id}
                             cartQuantity={getItemQuantityInCart(item.id)}
                           />
                         ))}
                       </div>
                     )}
                     
                     {viewMode === 'grid' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {group.items.map((item) => (
                           <MenuItemGrid 
                             key={item.id} 
                             item={item} 
                             language={language} 
                             onAddToCart={handleAddToCart}
                             showFeedback={showAddedToCartFeedback === item.id}
                           />
                         ))}
                       </div>
                     )}
                     
                     {viewMode === 'table' && (
                       <MenuItemTable 
                         items={group.items} 
                         language={language} 
                         onAddToCart={handleAddToCart}
                         showAddedToCartFeedback={showAddedToCartFeedback}
                       />
                     )}
                  </div>
                  
                  {/* Divider between sections */}
                  {index < groupedItems.length - 1 && (
                    <div className="border-t border-gray-200 pt-8"></div>
                  )}
                </section>
              ))}
            </div>
          ) : (
            // Show filtered items for selected category
            <div>
                             {viewMode === 'cards' && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                   {filteredItems.map((item) => (
                     <WabiSabiMenuCard 
                       key={item.id} 
                       item={item} 
                       language={language} 
                       onAddToCart={handleAddToCart}
                       showFeedback={showAddedToCartFeedback === item.id}
                       cartQuantity={getItemQuantityInCart(item.id)}
                     />
                   ))}
                 </div>
               )}
              
                             {viewMode === 'list' && (
                 <div className="space-y-4">
                   {filteredItems.map((item) => (
                     <MenuItemList 
                       key={item.id} 
                       item={item} 
                       language={language} 
                       onAddToCart={handleAddToCart}
                       showFeedback={showAddedToCartFeedback === item.id}
                       cartQuantity={getItemQuantityInCart(item.id)}
                     />
                   ))}
                 </div>
               )}
               
               {viewMode === 'grid' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {filteredItems.map((item) => (
                     <MenuItemGrid 
                       key={item.id} 
                       item={item} 
                       language={language} 
                       onAddToCart={handleAddToCart}
                       showFeedback={showAddedToCartFeedback === item.id}
                     />
                   ))}
                 </div>
               )}
               
               {viewMode === 'table' && (
                 <MenuItemTable 
                   items={filteredItems} 
                   language={language} 
                   onAddToCart={handleAddToCart}
                   showAddedToCartFeedback={showAddedToCartFeedback}
                 />
               )}
            </div>
          )}
          
          {/* No menu items available */}
          {menuData.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#2D1B12' }}>
                  {language === 'en' ? 'Menu Currently Unavailable' : '菜单暂时不可用'}
                </h3>
                <p className="text-lg" style={{ color: '#6B5B4D' }}>
                  {language === 'en' 
                    ? 'We\'re having trouble loading our menu. Please try refreshing the page or contact us directly.' 
                    : '我们在加载菜单时遇到了问题。请尝试刷新页面或直接联系我们。'
                  }
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 rounded-lg text-white transition-colors"
                  style={{ backgroundColor: '#B87333' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#A66929'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#B87333'}
                >
                  {language === 'en' ? 'Refresh Page' : '刷新页面'}
                </button>
              </div>
            </div>
          )}
          
          {/* No items found matching search */}
          {menuData.length > 0 && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: '#6B5B4D' }}>
                {language === 'en' ? 'No items found matching your search.' : '没有找到匹配的菜品。'}
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Slide-out Cart */}
              <SlideOutCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          language={language}
          updateQuantity={updateQuantity}
          removeItem={removeItem}
          clearCart={clearCart}
          getTotalAmount={getTotalAmount}
          getTaxAmount={getTaxAmount}
          getGrandTotal={getGrandTotal}
          formatCurrency={formatCurrency}
          onCheckout={() => {
            setIsCartOpen(false);
            router.push('/checkout');
          }}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          language={language}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* Mobile Category Modal */}
        {isMobileCategoryOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div 
              className="w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto transform transition-all duration-300 ease-out"
              style={{ backgroundColor: '#F9F6F2' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-bold"
                  style={{ 
                    color: '#2D1B12', 
                    fontFamily: 'Cormorant Garamond, serif' 
                  }}
                >
                  {language === 'en' ? 'Categories' : '分类'}
                </h2>
                <button
                  onClick={() => setIsMobileCategoryOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ backgroundColor: '#E8E1D9' }}
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {categories.map((category) => {
                  const categoryCount = menuData.filter(item => 
                    category.id === 'all' || item.category === category.id
                  ).length;
                  
                  const isCurrentSection = selectedCategory === 'all' 
                    ? activeSection === category.id 
                    : selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        // Track category selection analytics
                        const itemCount = menuData.filter(item => 
                          category.id === 'all' || item.category === category.id
                        ).length;
                        
                        menuTracking.trackCategorySelection(category.name[language], language, itemCount);
                        
                        setSelectedCategory(category.id);
                        setIsMobileCategoryOpen(false);
                        if (category.id !== 'all') {
                          setTimeout(() => {
                            const element = document.getElementById(`section-${category.id}`);
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-between ${
                        isCurrentSection ? 'text-white shadow-lg' : 'text-gray-700'
                      }`}
                      style={{
                        backgroundColor: isCurrentSection ? '#B87333' : '#FFFFFF'
                      }}
                    >
                      <span className="font-medium text-lg">{category.name[language]}</span>
                      <span className="text-sm opacity-75 bg-black bg-opacity-10 px-3 py-1 rounded-full">
                        {categoryCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Filters Modal */}
        {isFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div 
              className="w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto transform transition-all duration-300 ease-out"
              style={{ backgroundColor: '#F9F6F2' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 
                  className="text-2xl font-bold"
                  style={{ 
                    color: '#2D1B12', 
                    fontFamily: 'Cormorant Garamond, serif' 
                  }}
                >
                  {language === 'en' ? 'Filters & Search' : '筛选和搜索'}
                </h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ backgroundColor: '#E8E1D9' }}
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Search' : '搜索'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">🔍</span>
                    </div>
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Search dishes, ingredients, flavors...' : '搜索菜品、食材、口味...'}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      style={{ backgroundColor: '#FFFFFF', color: 'black' }}
                      value={searchQuery}
                      onChange={(e) => {
                        const newQuery = e.target.value;
                        setSearchQuery(newQuery);
                        
                        // Track search analytics (debounced)
                        if (newQuery.trim().length > 2) {
                          setTimeout(() => {
                            const results = menuData.filter(item => 
                              item.name[language].toLowerCase().includes(newQuery.toLowerCase()) ||
                              item.description[language].toLowerCase().includes(newQuery.toLowerCase())
                            );
                            menuTracking.trackSearch(newQuery, language, results.length);
                          }, 1000);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Spice Level */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Spice Level' : '辣度'}
                  </label>
                  <select
                    value={spiceLevelFilter || ''}
                    onChange={(e) => setSpiceLevelFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    style={{ backgroundColor: '#FFFFFF', color: 'black' }}
                  >
                    <option value="">🌶️ All Spice Levels</option>
                    <option value="1">🌶️ Mild</option>
                    <option value="2">🌶️🌶️ Medium</option>
                    <option value="3">🌶️🌶️🌶️ Hot</option>
                  </select>
                </div>

                {/* Dietary Filters */}
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Dietary Preferences' : '饮食偏好'}
                  </label>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowVegetarianOnly(!showVegetarianOnly)}
                      className={`w-full p-3 rounded-lg text-left transition-all transform hover:scale-105 active:scale-95 border ${
                        showVegetarianOnly ? 'text-white border-green-500' : 'text-gray-700 border-gray-300'
                      }`}
                      style={{ 
                        backgroundColor: showVegetarianOnly ? '#22C55E' : '#FFFFFF'
                      }}
                    >
                      🌱 {language === 'en' ? 'Vegetarian Only' : '仅素食'}
                    </button>
                    
                    {Object.entries({
                      nutFree: { label: language === 'en' ? 'Nut-Free' : '无坚果', icon: '🥜' },
                      dairyFree: { label: language === 'en' ? 'Dairy-Free' : '无乳制品', icon: '🥛' },
                      glutenFree: { label: language === 'en' ? 'Gluten-Free' : '无麸质', icon: '🌾' },
                      soyFree: { label: language === 'en' ? 'Soy-Free' : '无大豆', icon: '🌱' },
                      eggFree: { label: language === 'en' ? 'Egg-Free' : '无鸡蛋', icon: '🥚' }
                    }).map(([key, { label, icon }]) => (
                      <button
                        key={key}
                        onClick={() => setAllergenFilters(prev => ({
                          ...prev,
                          [key]: !prev[key as keyof typeof prev]
                        }))}
                        className={`w-full p-3 rounded-lg text-left transition-all transform hover:scale-105 active:scale-95 border ${
                          allergenFilters[key as keyof typeof allergenFilters] 
                            ? 'text-white border-orange-500' 
                            : 'text-gray-700 border-gray-300'
                        }`}
                        style={{ 
                          backgroundColor: allergenFilters[key as keyof typeof allergenFilters] 
                            ? '#B87333' 
                            : '#FFFFFF'
                        }}
                      >
                        <span className="mr-2">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSpiceLevelFilter(null);
                    setShowVegetarianOnly(false);
                    setAllergenFilters({
                      nutFree: false,
                      dairyFree: false,
                      glutenFree: false,
                      soyFree: false,
                      eggFree: false
                    });
                  }}
                  className="w-full p-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 text-center"
                  style={{ 
                    backgroundColor: '#E8E1D9',
                    color: '#2D1B12'
                  }}
                >
                  {language === 'en' ? 'Clear All Filters' : '清除所有筛选'}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Mobile Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col space-y-3 lg:hidden">
        {/* Floating Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center relative"
          style={{ 
            backgroundColor: '#B87333',
            boxShadow: '0 4px 12px rgba(184, 115, 51, 0.4)'
          }}
        >
          <span className="text-white text-xl">🛒</span>
          {getItemCount() > 0 && (
            <span 
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-bold animate-bounce"
              style={{ backgroundColor: '#DC2626' }}
            >
              {getItemCount()}
            </span>
          )}
        </button>

        {/* Floating Category Button */}
        <button
          onClick={() => setIsMobileCategoryOpen(true)}
          className="w-12 h-12 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ 
            backgroundColor: '#E8E1D9',
            color: '#2D1B12'
          }}
        >
          <span className="text-lg">📂</span>
        </button>

        {/* Floating Filter Button */}
        <button
          onClick={() => setIsFiltersOpen(true)}
          className="w-12 h-12 rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ 
            backgroundColor: '#E8E1D9',
            color: '#2D1B12'
          }}
        >
          <span className="text-lg">🔍</span>
        </button>
      </div>

      {/* Added to Cart Feedback Toast */}
      {showAddedToCartFeedback && (
        <div 
          className="fixed top-24 right-4 p-4 rounded-lg shadow-lg z-40 transform transition-all duration-500 ease-in-out"
          style={{ backgroundColor: '#22C55E' }}
        >
          <div className="flex items-center space-x-2 text-white">
            <span>✅</span>
            <span className="font-medium">
              {language === 'en' ? 'Added to cart!' : '已加入购物车！'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
