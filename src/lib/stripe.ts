import Stripe from 'stripe';

// Initialize Stripe conditionally
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    })
  : null;

/**
 * Calculate tax amount (6.25% MA sales tax + 0.75% local tax)
 */
export function calculateTax(subtotal: number): number {
  const MA_SALES_TAX = 0.0625; // 6.25% MA sales tax
  const LOCAL_TAX = 0.0075; // 0.75% local tax
  const TOTAL_TAX_RATE = MA_SALES_TAX + LOCAL_TAX; // 7.00% total
  return Math.round(subtotal * TOTAL_TAX_RATE);
}

/**
 * Calculate total with tax
 */
export function calculateTotal(subtotal: number): { tax: number; total: number } {
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;
  return { tax, total };
}

/**
 * Format amount in cents to dollar string
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Parse dollar amount to cents
 */
export function parseCurrency(dollarAmount: string): number {
  // Remove currency symbols and parse
  const numericAmount = dollarAmount.replace(/[$,]/g, '');
  return Math.round(parseFloat(numericAmount) * 100);
}

// Export the stripe instance for direct use if needed
export { stripe };

// Helper function to ensure stripe is initialized
export function ensureStripeInitialized(): Stripe {
  if (!stripe) {
    throw new Error('Stripe is not initialized. Please check your STRIPE_SECRET_KEY environment variable.');
  }
  return stripe;
} 