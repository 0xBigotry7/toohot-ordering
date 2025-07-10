import { MenuItem } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Simple fetch-based menu loader that bypasses Supabase client
export async function loadMenuItemsWithFetch(): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?select=*&is_available=eq.true&order=category,name_en`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    // Valid categories from the proper menu schema
    const validCategories = [
      'appetite-awakener',
      'protein-chicken',
      'protein-beef', 
      'protein-pork',
      'protein-seafood',
      'carbs',
      'cold-beverages',
      'greens-vegetarian',
      'entree-specials',
      'tapas-sides'
    ];
    
    // Filter out items with invalid categories (like test data)
    const validItems = data.filter((item: any) => {
      return validCategories.includes(item.category);
    });
    
    // Convert to our MenuItem format
    return validItems.map((item: any): MenuItem => ({
      id: item.id,
      name: {
        en: item.name_en,
        zh: item.name_zh
      },
      description: {
        en: item.description_en || '',
        zh: item.description_zh || ''
      },
      price: `$${(item.price_cents / 100).toFixed(2)}`,
      category: item.category,
      isPopular: item.is_popular || false,
      isVegetarian: item.is_vegetarian || false,
      isVegan: item.is_vegan || false,
      spiceLevel: item.spice_level || 0,
      allergens: item.allergens || [],
      imageUrl: item.image_url,
      prepTimeMinutes: item.prep_time_minutes
    }));
    
  } catch (error) {
    return [];
  }
}

// Test database connection with fetch
export async function testDatabaseConnectionWithFetch(): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?select=count&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    return false;
  }
} 