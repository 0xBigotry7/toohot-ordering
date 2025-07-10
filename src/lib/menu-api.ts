import { createClientSupabase, createSupabaseClient } from '@/lib/supabase';
import { MenuItem } from '@/types';
import { Database } from '@/lib/supabase';

type SupabaseMenuItem = Database['public']['Tables']['menu_items']['Row'];

// Test database connection
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing database connection...');
    const supabase = createClientSupabase();
    
    const queryPromise = supabase
      .from('menu_items')
      .select('count')
      .limit(1);
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Connection test timeout after 5 seconds'));
      }, 5000);
    });
    
    console.log('⏱️ Connection test started with 5-second timeout...');
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    console.log('✅ Connection test query completed');
    
    if (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }
    
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test exception:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('❌ Connection test timed out - this indicates a connection issue');
    }
    return false;
  }
}

// Convert Supabase menu item to our MenuItem type
function convertSupabaseMenuItem(item: SupabaseMenuItem): MenuItem {
  return {
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
  };
}

// Load menu items from Supabase
export async function loadMenuItems(): Promise<MenuItem[]> {
  try {
    console.log('🔍 Loading menu items from Supabase...');
    const supabase = createClientSupabase();
    
    console.log('📊 Executing query to menu_items table...');
    
    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('category')
      .order('name_en');
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 10 seconds'));
      }, 10000);
    });
    
    console.log('⏱️ Query started with 10-second timeout...');
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    console.log('✅ Query completed successfully');
    
    if (error) {
      console.error('❌ Error loading menu items:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }
    
    console.log(`✅ Successfully loaded ${data?.length || 0} menu items`);
    return data.map(convertSupabaseMenuItem);
  } catch (error) {
    console.error('❌ Exception loading menu items:', error);
    if (error instanceof Error && error.message.includes('timeout')) {
      console.error('❌ Query timed out - this indicates a connection issue');
    }
    return [];
  }
}

// Load menu items with real-time subscription
export function subscribeToMenuItems(
  onMenuUpdate: (items: MenuItem[]) => void,
  onError?: (error: any) => void
) {
  console.log('🔄 Setting up menu subscription...');
  const supabase = createClientSupabase();
  
  // Initial load with proper error handling
  console.log('📥 Starting initial menu load...');
  loadMenuItems()
    .then(items => {
      console.log('✅ Initial menu load successful:', items.length, 'items');
      onMenuUpdate(items);
    })
    .catch(error => {
      console.error('❌ Error in initial menu load:', error);
      // Still call onMenuUpdate with empty array to stop loading state
      onMenuUpdate([]);
      onError?.(error);
    });
  
  // Set up real-time subscription
  console.log('📡 Setting up real-time subscription...');
  const subscription = supabase
    .channel('menu-items-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'menu_items'
      },
      async (payload) => {
        console.log('🔄 Menu item changed:', payload);
        
        // Reload all menu items when there's a change
        try {
          const updatedItems = await loadMenuItems();
          console.log('🔄 Reloaded menu items:', updatedItems.length);
          onMenuUpdate(updatedItems);
        } catch (error) {
          console.error('❌ Error reloading menu after change:', error);
          onError?.(error);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Menu subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time menu updates enabled');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Real-time subscription failed');
        onError?.(new Error('Real-time subscription failed'));
      }
    });
  
  // Return unsubscribe function
  return () => {
    console.log('🔌 Unsubscribing from menu updates...');
    subscription.unsubscribe();
  };
}

// Get categories from menu items
export function getCategoriesFromMenuItems(menuItems: MenuItem[]): Array<{id: string, name: { en: string; zh: string }}> {
  const categoryMap = new Map<string, {id: string, name: { en: string; zh: string }}>();
  
  // Always include "all" category
  categoryMap.set('all', { 
    id: 'all', 
    name: { en: 'All Items', zh: '全部菜品' } 
  });
  
  // Extract unique categories from menu items
  for (const item of menuItems) {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, {
        id: item.category,
        name: {
          en: getCategoryNameEn(item.category),
          zh: getCategoryNameZh(item.category)
        }
      });
    }
  }
  
  return Array.from(categoryMap.values());
}

// Helper functions to get category names in different languages
function getCategoryNameEn(category: string): string {
  const categoryNames: Record<string, string> = {
    'appetite-awakener': 'Appetite Awakeners',
    'protein-chicken': 'Chicken Dishes',
    'protein-beef': 'Beef Dishes',
    'protein-pork': 'Pork Dishes',
    'protein-seafood': 'Seafood Dishes',
    'carbs': 'Rice & Noodles',
    'cold-beverages': 'Cold Beverages',
    'greens-vegetarian': 'Vegetarian Dishes',
    'entree-specials': 'House Specials',
    'tapas-sides': 'Small Plates & Sides'
  };
  
  return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
}

function getCategoryNameZh(category: string): string {
  const categoryNames: Record<string, string> = {
    'appetite-awakener': '开胃小菜',
    'protein-chicken': '鸡肉类',
    'protein-beef': '牛肉类',
    'protein-pork': '猪肉类',
    'protein-seafood': '海鲜类',
    'carbs': '主食类',
    'cold-beverages': '冷饮',
    'greens-vegetarian': '素食类',
    'entree-specials': '招牌菜',
    'tapas-sides': '小食配菜'
  };
  
  return categoryNames[category] || category;
}

// Admin functions for managing menu items (requires service role)
export async function createMenuItem(item: Omit<SupabaseMenuItem, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create menu item: ${error.message}`);
  }
  
  return convertSupabaseMenuItem(data);
}

export async function updateMenuItem(id: string, updates: Partial<SupabaseMenuItem>) {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update menu item: ${error.message}`);
  }
  
  return convertSupabaseMenuItem(data);
}

export async function deleteMenuItem(id: string) {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Failed to delete menu item: ${error.message}`);
  }
}

// Toggle availability of a menu item
export async function toggleMenuItemAvailability(id: string, isAvailable: boolean) {
  return updateMenuItem(id, { is_available: isAvailable });
} 