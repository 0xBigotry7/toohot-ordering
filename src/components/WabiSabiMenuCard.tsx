'use client';

import { MenuItem } from '@/types';
import { useOrderTracking } from '@/hooks/useAnalytics';

interface WabiSabiMenuCardProps {
  item: MenuItem;
  language: 'en' | 'zh';
  onAddToCart: (item: MenuItem) => void;
  showFeedback?: boolean;
  cartQuantity: number;
}

export default function WabiSabiMenuCard({ 
  item, 
  language, 
  onAddToCart, 
  showFeedback,
  cartQuantity 
}: WabiSabiMenuCardProps) {
  const orderTracking = useOrderTracking();

  // Handle item view tracking
  const handleItemClick = () => {
    orderTracking.trackItemView({
      id: item.id,
      name: item.name[language],
      category: item.category,
      price: parseFloat(item.price.replace('$', '')) * 100,
      language
    });
  };

  // Handle add to cart with analytics
  const handleAddToCart = () => {
    onAddToCart(item);
    
    // Track in analytics
    orderTracking.trackCartAddition({
      id: item.id,
      name: item.name[language],
      category: item.category,
      price: parseFloat(item.price.replace('$', '')) * 100,
      quantity: 1,
      language
    });
  };

  return (
    <div 
      onClick={handleItemClick}
      className="group cursor-pointer rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:scale-[1.005] relative"
      style={{ 
        backgroundColor: '#FAF7F2',
        border: '1px solid rgba(190, 170, 150, 0.15)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
      }}
    >
      {/* Title and Price Row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2">
            <h3 
              className="text-lg font-medium leading-tight tracking-wide"
              style={{ 
                color: '#2A2A2A',
                fontFamily: 'Georgia, "Times New Roman", serif'
              }}
            >
              {item.name[language]}
            </h3>
            {/* Subtle vegetarian indicator */}
            {(item.isVegetarian || item.isVegan) && (
              <span 
                className="text-sm opacity-70"
                title={item.isVegan ? 'Vegan' : 'Vegetarian'}
                style={{ color: '#6B8E23' }}
              >
                🌿
              </span>
            )}
          </div>
          
          {/* Subtle secondary language */}
          {language === 'en' && item.name.zh && (
            <p 
              className="text-sm mt-1 opacity-60"
              style={{ color: '#666' }}
            >
              {item.name.zh}
            </p>
          )}
          {language === 'zh' && item.name.en && (
            <p 
              className="text-sm mt-1 opacity-60"
              style={{ color: '#666' }}
            >
              {item.name.en}
            </p>
          )}
        </div>
        
        {/* Clean price display */}
        <span 
          className="text-xl font-medium shrink-0"
          style={{ color: '#CD853F' }}
        >
          {item.price}
        </span>
      </div>

      {/* Minimal character accent */}
      <div className="mb-4">
        <span className="text-base opacity-50">🐼</span>
      </div>

      {/* Clean description with generous spacing */}
      <p 
        className="text-sm leading-relaxed mb-8"
        style={{ 
          color: '#5A5A5A',
          lineHeight: '1.7',
          letterSpacing: '0.01em'
        }}
      >
        {item.description[language]}
      </p>

             {/* Bottom metadata - elegantly spaced */}
      <div className="flex justify-between items-end text-xs" style={{ color: '#999' }}>
        {/* Left side: Spice level */}
        <div className="flex items-center gap-1.5">
          {item.spiceLevel && item.spiceLevel > 0 && (
            <>
              <span className="opacity-80">Spice:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: item.spiceLevel }, (_, i) => (
                  <span key={i} className="text-xs opacity-90">🌶️</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right side: Allergens */}
        <div className="text-right">
          {item.allergens && item.allergens.length > 0 && (
            <span className="opacity-80">Contains: {item.allergens.join(', ')}</span>
          )}
        </div>
      </div>

             {/* Subtle interaction overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(135deg, rgba(205, 133, 63, 0.03), rgba(205, 133, 63, 0.06))',
          backdropFilter: 'blur(0.5px)'
        }}
      >
        {/* Cart quantity indicator */}
        {cartQuantity > 0 && (
          <div className="absolute top-4 right-4">
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: 'rgba(205, 133, 63, 0.1)', 
                color: '#CD853F',
                border: '1px solid rgba(205, 133, 63, 0.2)'
              }}
            >
              {cartQuantity} in cart
            </span>
          </div>
        )}

        {/* Add to cart button - appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
            showFeedback ? 'animate-pulse scale-110' : ''
          }`}
          style={{ 
            backgroundColor: showFeedback ? '#6B8E23' : '#CD853F',
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {showFeedback ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
} 