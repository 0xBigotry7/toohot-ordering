// Basic types for the TooHot ordering system

export interface MenuItem {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
  price: string;           // Format: "$15.99"
  category: string;
  isPopular?: boolean;
  isSignature?: boolean;
  isVegetarian?: boolean;
  isVegan?: boolean;
  spiceLevel?: number;     // 0-5, where 0 is no spice, 5 is very spicy
  allergens?: string[];    // Array of allergen strings like ["peanuts", "soy"]
  imageUrl?: string;       // URL to menu item image
  prepTimeMinutes?: number; // Estimated preparation time in minutes
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  unitPrice: number;       // in cents
  totalPrice: number;      // in cents
}

export interface Cart {
  items: CartItem[];
  total: number;           // in cents
  tax: number;             // in cents
  itemCount: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export type Language = 'en' | 'zh'; 