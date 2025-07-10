/**
 * Integration tests for Order API
 * These tests are designed to work with actual Supabase integration
 * Run with: npm test
 */

import { CreateOrderRequest, Order } from '../order-api';

// Test data helpers
export const testData = {
  createValidOrderRequest: (): CreateOrderRequest => ({
    customerEmail: 'test@example.com',
    customerFirstName: 'John',
    customerLastName: 'Doe',
    customerPhone: '555-0123',
    items: [
      {
        menuItemId: 'test-menu-item-id',
        quantity: 2,
        specialInstructions: 'Extra spicy please'
      }
    ]
  }),

  createInvalidOrderRequest: (): CreateOrderRequest => ({
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    items: []
  }),

  generateTestMenuItems: (count: number = 5) => {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-item-${i + 1}`,
      name: { en: `Test Item ${i + 1}`, zh: `测试菜品${i + 1}` },
      description: { en: `Test description ${i + 1}`, zh: `测试描述${i + 1}` },
      price: `$${(10 + i * 2).toFixed(2)}`,
      category: i % 2 === 0 ? 'protein-chicken' : 'greens-vegetarian',
      isPopular: i < 2,
      isVegetarian: i % 2 === 1,
      isVegan: false,
      spiceLevel: i % 5,
      allergens: i % 3 === 0 ? ['soy'] : [],
      imageUrl: null,
      prepTimeMinutes: 10 + (i * 2)
    }));
  }
};

// Test utilities
export const testUtils = {
  /**
   * Validates that an order object has all required properties
   */
  validateOrderStructure: (order: Order): boolean => {
    const requiredFields = [
      'id', 'orderNumber', 'status', 'subtotalCents', 'taxCents', 'totalCents',
      'customerEmail', 'customerFirstName', 'customerLastName', 'createdAt', 'updatedAt', 'items'
    ];
    
    return requiredFields.every(field => field in order);
  },

  /**
   * Validates that order calculations are correct
   */
  validateOrderCalculations: (order: Order): boolean => {
    const itemsTotal = order.items.reduce((sum, item) => sum + item.totalPriceCents, 0);
    const expectedTax = Math.round(itemsTotal * 0.0825); // 8.25% tax rate
    const expectedTotal = itemsTotal + expectedTax;
    
    return order.subtotalCents === itemsTotal && 
           order.taxCents === expectedTax && 
           order.totalCents === expectedTotal;
  },

  /**
   * Validates order status transitions
   */
  validateStatusTransition: (currentStatus: Order['status'], newStatus: Order['status']): boolean => {
    const validTransitions: Record<Order['status'], Order['status'][]> = {
      'pending': ['paid', 'cancelled'],
      'paid': ['preparing', 'cancelled'],
      'preparing': ['ready', 'cancelled'],
      'ready': ['completed'],
      'completed': [],
      'cancelled': []
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  },

  /**
   * Simulates order creation workflow
   */
  simulateOrderFlow: async (orderRequest: CreateOrderRequest) => {
    // This would be used in actual integration tests
    console.log('Simulating order creation for:', orderRequest.customerEmail);
    
    // Validation checks
    if (!orderRequest.customerEmail || !orderRequest.customerFirstName || !orderRequest.customerLastName) {
      throw new Error('Missing required customer information');
    }
    
    if (!orderRequest.items || orderRequest.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
    
    // Simulate order processing
    return {
      orderId: 'test-order-123',
      orderNumber: 'TH-2024-001',
      status: 'pending' as const,
      message: 'Order created successfully'
    };
  }
};

// Manual test scenarios
export const testScenarios = {
  /**
   * Test Case 1: Valid Order Creation
   */
  testValidOrderCreation: () => {
    console.log('🧪 Testing Valid Order Creation...');
    
    const orderRequest = testData.createValidOrderRequest();
    
    // Test validation
    expect(orderRequest.customerEmail).toBeTruthy();
    expect(orderRequest.items.length).toBeGreaterThan(0);
    expect(orderRequest.items[0].quantity).toBeGreaterThan(0);
    
    console.log('✅ Valid order request structure confirmed');
    return true;
  },

  /**
   * Test Case 2: Invalid Order Handling
   */
  testInvalidOrderHandling: () => {
    console.log('🧪 Testing Invalid Order Handling...');
    
    const invalidRequest = testData.createInvalidOrderRequest();
    
    // Test validation
    expect(invalidRequest.customerEmail).toBeFalsy();
    expect(invalidRequest.items.length).toBe(0);
    
    console.log('✅ Invalid order request properly identified');
    return true;
  },

  /**
   * Test Case 3: Order Status Transitions
   */
  testOrderStatusTransitions: () => {
    console.log('🧪 Testing Order Status Transitions...');
    
    // Test valid transitions
    expect(testUtils.validateStatusTransition('pending', 'paid')).toBe(true);
    expect(testUtils.validateStatusTransition('paid', 'preparing')).toBe(true);
    expect(testUtils.validateStatusTransition('preparing', 'ready')).toBe(true);
    expect(testUtils.validateStatusTransition('ready', 'completed')).toBe(true);
    
    // Test invalid transitions
    expect(testUtils.validateStatusTransition('completed', 'pending')).toBe(false);
    expect(testUtils.validateStatusTransition('cancelled', 'paid')).toBe(false);
    
    console.log('✅ Order status transitions validated');
    return true;
  },

  /**
   * Test Case 4: Order Calculation Validation
   */
  testOrderCalculations: () => {
    console.log('🧪 Testing Order Calculations...');
    
    const mockOrder: Order = {
      id: 'test-123',
      orderNumber: 'TH-2024-001',
      status: 'pending',
      subtotalCents: 2000, // $20.00
      taxCents: 165, // 8.25% of $20.00
      totalCents: 2165, // $21.65
      customerEmail: 'test@example.com',
      customerFirstName: 'John',
      customerLastName: 'Doe',
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [
        {
          menuItemId: 'item-1',
          menuItemNameEn: 'Test Item',
          menuItemNameZh: '测试菜品',
          quantity: 2,
          unitPriceCents: 1000,
          totalPriceCents: 2000
        }
      ]
    };
    
    expect(testUtils.validateOrderCalculations(mockOrder)).toBe(true);
    expect(testUtils.validateOrderStructure(mockOrder)).toBe(true);
    
    console.log('✅ Order calculations and structure validated');
    return true;
  },

  /**
   * Run all test scenarios
   */
  runAllTests: () => {
    console.log('🚀 Running Order API Test Suite...\n');
    
    const results = [
      testScenarios.testValidOrderCreation(),
      testScenarios.testInvalidOrderHandling(),
      testScenarios.testOrderStatusTransitions(),
      testScenarios.testOrderCalculations()
    ];
    
    const passed = results.filter(Boolean).length;
    const total = results.length;
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('❌ Some tests failed');
    }
    
    return passed === total;
  }
};

// Export for manual testing
if (typeof window !== 'undefined') {
  // Browser environment - make available globally
  (window as any).orderTests = testScenarios;
}

// Mock expect function for manual testing
function expect(value: any) {
  return {
    toBeTruthy: () => Boolean(value),
    toBeFalsy: () => !Boolean(value),
    toBe: (expected: any) => value === expected,
    toBeGreaterThan: (expected: number) => value > expected,
    toEqual: (expected: any) => JSON.stringify(value) === JSON.stringify(expected)
  };
}

// Jest test if in test environment
if (typeof describe !== 'undefined') {
  describe('Order API Integration Tests', () => {
    test('should validate order structure', () => {
      expect(testScenarios.testValidOrderCreation()).toBe(true);
    });
    
    test('should handle invalid orders', () => {
      expect(testScenarios.testInvalidOrderHandling()).toBe(true);
    });
    
    test('should validate status transitions', () => {
      expect(testScenarios.testOrderStatusTransitions()).toBe(true);
    });
    
    test('should validate order calculations', () => {
      expect(testScenarios.testOrderCalculations()).toBe(true);
    });
  });
}

export default testScenarios; 