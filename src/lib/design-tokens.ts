// Shared design tokens between main site and ordering project
// These should match your main website's design system

export const designTokens = {
  // Brand Colors (matching toohot.kitchen exactly from screenshot)
  colors: {
    primary: {
      copper: '#B87333',      // TooHot signature copper for buttons/prices
      ink: '#2D1B12',         // Deep brown for text (from screenshot)
      charcoal: '#2D2D2D',    // Charcoal gray
      warmCream: '#F5F1EB',   // Warm cream background (from screenshot)
      cardCream: '#F9F6F2',   // Slightly warmer cream for cards
    },
    accent: {
      spiceRed: '#DC2626',    // For spice indicators
      goldYellow: '#D4AF37',  // For signature dishes (crown icon)
      warmGray: '#E8E1D9',    // Warm gray for subtle elements
      vegetarianGreen: '#22C55E', // For vegetarian indicators
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B', 
      error: '#EF4444',
      info: '#3B82F6',
    }
  },
  
  // Typography (should match main site fonts)
  typography: {
    fontFamily: {
      primary: 'Cormorant Garamond, serif',  // Elegant serif for headings
      secondary: 'Inter, sans-serif',        // Clean sans-serif for body
      mono: 'JetBrains Mono, monospace',     // For code/prices
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  
  // Spacing (consistent with main site)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Component styles
  components: {
    button: {
      primary: {
        bg: '#B87333',
        color: '#FEFEFE',
        hover: '#9A6129',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        fontWeight: 500,
      },
      secondary: {
        bg: '#F3F4F6',
        color: '#1C1C1C',
        hover: '#E5E7EB',
        border: '1px solid #D1D5DB',
      }
    },
    card: {
      bg: '#FEFEFE',
      border: '1px solid #E5E7EB',
      borderRadius: '0.75rem',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      hoverShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    }
  },
  
  // Layout
  layout: {
    maxWidth: '1280px',    // Max container width
    containerPadding: '1rem',
    sectionSpacing: '4rem',
  }
} as const;

// Helper function to get CSS custom properties
export const getCSSVariables = () => {
  const vars: Record<string, string> = {};
  
  // Colors
  Object.entries(designTokens.colors.primary).forEach(([key, value]) => {
    vars[`--color-primary-${key}`] = value;
  });
  
  Object.entries(designTokens.colors.accent).forEach(([key, value]) => {
    vars[`--color-accent-${key}`] = value;
  });
  
  // Typography
  Object.entries(designTokens.typography.fontFamily).forEach(([key, value]) => {
    vars[`--font-${key}`] = value;
  });
  
  return vars;
};

// Export individual token categories for easy importing
export const { colors, typography, spacing, components, layout } = designTokens; 