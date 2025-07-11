# Design Consistency Guide

## Overview
This guide outlines strategies to maintain design consistency between the main TooHot website (`toohot.kitchen`) and the ordering project, even though they are decoupled systems.

## 🎯 **Current Status**
- ✅ **Menu Data**: Successfully integrated real menu from `menu.json`
- ✅ **Tax Calculation**: Updated to Massachusetts 7.00% (6.25% state + 0.75% local)
- ✅ **Bilingual Support**: English/Chinese toggle working
- ✅ **Real Categories**: Dynamic categories from actual menu data
- ✅ **Design Tokens**: Created shared design system

## 🚀 **Recommended Strategies**

### **1. Shared Design System (Recommended)**

**Implementation:**
```typescript
// src/lib/design-tokens.ts - Already created!
import { designTokens } from '@/lib/design-tokens';

// Use consistent colors, typography, spacing across both sites
const { colors, typography, spacing } = designTokens;
```

**Benefits:**
- ✅ Single source of truth for design decisions
- ✅ Easy to update both sites simultaneously
- ✅ Type-safe design tokens
- ✅ Can be published as NPM package for main site

**Implementation Steps:**
1. Extract main site's current design tokens
2. Update both projects to use shared tokens
3. Create shared component library (optional)

### **2. API-Driven Content Sync**

**Current Implementation:**
```typescript
// Already loading real menu data from JSON
const response = await fetch('/menu.json');
const menuData = await response.json();
```

**Enhancement Options:**
```typescript
// Option A: Direct API integration with main site
const menuData = await fetch('https://toohot.kitchen/api/menu');

// Option B: Scheduled sync job
// Use GitHub Actions or cron job to sync menu.json from main site

// Option C: Webhook-based updates
// Main site triggers webhook when menu changes
```

### **3. Shared Asset Management**

**Recommended Structure:**
```
shared-assets/
├── fonts/
│   ├── CormorantGaramond-Regular.woff2
│   └── Inter-Variable.woff2
├── images/
│   ├── logos/
│   └── menu-items/
└── icons/
    └── spice-levels/
```

**Implementation:**
- Host assets on CDN (Cloudflare, AWS CloudFront)
- Use same asset URLs in both projects
- Version assets to prevent cache issues

### **4. Component Consistency Patterns**

**Shared Component Patterns:**
```typescript
// Button component following main site patterns
export const Button = ({ variant = 'primary', children, ...props }) => {
  const styles = {
    primary: designTokens.components.button.primary,
    secondary: designTokens.components.button.secondary,
  };
  
  return (
    <button 
      className={buttonStyles[variant]}
      {...props}
    >
      {children}
    </button>
  );
};
```

### **5. Brand Guidelines Documentation**

**Create Shared Documentation:**
```markdown
## TooHot Brand Guidelines

### Colors
- Primary Copper: #B87333 (signature brand color)
- Ink Black: #1C1C1C (primary text)
- Spice Red: #DC2626 (spice indicators)

### Typography
- Headings: Cormorant Garamond (elegant, restaurant feel)
- Body: Inter (clean, readable)
- Accent: Use copper color for CTAs

### Voice & Tone
- Warm and welcoming
- Authentic Sichuan cuisine focus
- Bilingual (English/Chinese) support
```

## 🔧 **Implementation Priorities**

### **Phase 1: Immediate (Week 1)**
1. ✅ **Design Tokens** - Already implemented!
2. ✅ **Real Menu Data** - Already integrated!
3. 🔄 **Update Colors** - Apply copper branding to ordering site
4. 🔄 **Typography** - Match main site fonts

### **Phase 2: Short-term (Week 2-3)**
1. **Shared Components** - Create reusable button, card, input components
2. **Asset Sync** - Set up shared image/logo hosting
3. **Layout Consistency** - Match header/footer patterns

### **Phase 3: Long-term (Month 1-2)**
1. **API Integration** - Direct menu sync with main site
2. **Design System Package** - Publish shared design tokens
3. **Automated Testing** - Visual regression tests
4. **Documentation** - Complete brand guidelines

## 📋 **Practical Next Steps**

### **1. Audit Main Site**
```bash
# Extract design tokens from main site
# Document current:
# - Color palette
# - Typography stack
# - Component patterns
# - Layout grids
# - Spacing system
```

### **2. Update Ordering Site Branding**
```css
/* Apply TooHot copper branding */
:root {
  --primary-copper: #B87333;
  --ink-black: #1C1C1C;
  --spice-red: #DC2626;
}

/* Update buttons to use copper */
.btn-primary {
  background-color: var(--primary-copper);
  color: white;
}
```

### **3. Create Shared Repository (Optional)**
```
toohot-design-system/
├── tokens/
├── components/
├── assets/
└── documentation/
```

### **4. Set Up Monitoring**
- Visual regression testing (Percy, Chromatic)
- Design token diff checking
- Asset sync verification

## 🎨 **Visual Consistency Checklist**

- [ ] **Colors** match exactly
- [ ] **Typography** uses same font stack
- [ ] **Spacing** follows same scale
- [ ] **Button styles** are identical
- [ ] **Card layouts** match patterns
- [ ] **Navigation** feels cohesive
- [ ] **Language toggle** works consistently
- [ ] **Spice indicators** use same system
- [ ] **Price formatting** matches
- [ ] **Loading states** are consistent

## 🔄 **Maintenance Workflow**

### **When Main Site Updates:**
1. Update design tokens if colors/fonts change
2. Sync new menu items to `menu.json`
3. Update shared assets if needed
4. Test ordering site for visual consistency
5. Deploy updates

### **When Ordering Site Updates:**
1. Check against design tokens
2. Ensure no brand guidelines violations
3. Test bilingual support
4. Verify responsive design
5. Update documentation if needed

## 📞 **Getting Started Today**

1. **Extract main site colors/fonts** and update design tokens
2. **Apply copper branding** to ordering site buttons/headers
3. **Set up menu sync process** (manual or automated)
4. **Document differences** between sites for future alignment
5. **Create shared asset hosting** strategy

This approach ensures your ordering project feels like a natural extension of the main TooHot website while maintaining the flexibility of decoupled systems. 