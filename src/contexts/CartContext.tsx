'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, MenuItem, Cart } from '@/types';
import { calculateTotal } from '@/lib/stripe';

interface CartContextType {
  cart: Cart;
  addItem: (menuItem: MenuItem, quantity: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotalAmount: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { menuItem: MenuItem; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { items: CartItem[] } };

const CartContext = createContext<CartContextType | undefined>(undefined);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { menuItem, quantity } = action.payload;
      const unitPrice = Math.round(parseFloat(menuItem.price.replace('$', '')) * 100);
      
      const itemId = menuItem.id;
      const existingItemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        const existingItem = updatedItems[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          totalPrice: unitPrice * newQuantity,
        };
        
        return { ...state, items: updatedItems };
      } else {
        const newItem: CartItem = {
          id: itemId,
          menuItem,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
        
        return { ...state, items: [...state.items, newItem] };
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return { ...state, items: state.items.filter(item => item.id !== itemId) };
      }
      
      const updatedItems = state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
          : item
      );
      
      return { ...state, items: updatedItems };
    }
    
    case 'REMOVE_ITEM': {
      const { itemId } = action.payload;
      return { ...state, items: state.items.filter(item => item.id !== itemId) };
    }
    
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    
    case 'LOAD_CART': {
      const { items } = action.payload;
      return { ...state, items };
    }
    
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('toohot-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        
        // Check if cart data has old string IDs and clear if necessary
        const hasOldStringIds = parsedCart.items?.some((item: CartItem) => {
          // Check if ID is a string like "appetite-awakener-2" instead of UUID
          const isStringId = typeof item.id === 'string' && 
            item.id.includes('-') && 
            !item.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
          return isStringId;
        });
        
        if (hasOldStringIds) {
          console.log('Clearing cart with old incompatible IDs');
          localStorage.removeItem('toohot-cart');
          return; // Don't load the old cart data
        }
        
        dispatch({ type: 'LOAD_CART', payload: { items: parsedCart.items || [] } });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('toohot-cart'); // Clear corrupted data
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('toohot-cart', JSON.stringify({ items: state.items }));
  }, [state.items]);
  
  const addItem = (menuItem: MenuItem, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { menuItem, quantity } });
  };
  
  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };
  
  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };
  
  const getTotalAmount = () => {
    return state.items.reduce((total, item) => total + item.totalPrice, 0);
  };
  
  const getTaxAmount = () => {
    const subtotal = getTotalAmount();
    const { tax } = calculateTotal(subtotal);
    return tax;
  };
  
  const getGrandTotal = () => {
    const subtotal = getTotalAmount();
    const { total } = calculateTotal(subtotal);
    return total;
  };
  
  const cart: Cart = {
    items: state.items,
    total: getTotalAmount(),
    tax: getTaxAmount(),
    itemCount: getItemCount(),
  };
  
  const contextValue: CartContextType = {
    cart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getItemCount,
    getTotalAmount,
    getTaxAmount,
    getGrandTotal,
  };
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 