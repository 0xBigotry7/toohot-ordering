import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createAdminSupabase();
    
    // Fetch menu items from the database
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch menu items',
          details: process.env.NODE_ENV === 'development' ? error : undefined
        },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedItems = menuItems?.map(item => ({
      id: item.id,
      name: {
        en: item.name_en,
        zh: item.name_zh
      },
      description: {
        en: item.description_en,
        zh: item.description_zh
      },
      category: item.category,
      priceCents: item.price_cents,
      spicyLevel: item.spice_level,
      isVegetarian: item.is_vegetarian,
      isVegan: item.is_vegan,
      isPopular: item.is_popular,
      image: item.image_url,
      isAvailable: item.is_available,
      allergens: item.allergens,
      prepTimeMinutes: item.prep_time_minutes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];

    return NextResponse.json({
      success: true,
      items: transformedItems
    });

  } catch (error) {
    console.error('Error in menu API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
} 