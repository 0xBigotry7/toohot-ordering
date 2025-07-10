'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
}

// Payment form component
const PaymentForm = ({ 
  orderId, 
  onPaymentSuccess, 
  language 
}: {
  customerInfo: CustomerInfo;
  orderId: string;
  clientSecret: string;
  onPaymentSuccess: (orderData: OrderData) => void;
  language: 'en' | 'zh';
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation?order_id=${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        });

        const result = await response.json();

        if (result.success) {
          onPaymentSuccess(result.order);
        } else {
          setPaymentError(result.error || 'Payment confirmation failed');
        }
      }
    } catch (error) {
      setPaymentError('Payment processing failed');
      console.error('Payment error:', error);
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D1B12' }}>
          {language === 'en' ? 'Payment Information' : '支付信息'}
        </h3>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
        
        {paymentError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{paymentError}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#B87333' }}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {language === 'en' ? 'Processing...' : '处理中...'}
          </span>
        ) : (
          language === 'en' ? 'Complete Order' : '完成订单'
        )}
      </button>
    </form>
  );
};

export default function CheckoutPage() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const { cart, clearCart, getGrandTotal } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState<'customer' | 'payment' | 'confirmation'>('customer');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [pickupTime, setPickupTime] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to format currency
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push('/');
    }
  }, [cart.items, router]);

  // Generate pickup time options (next 2 hours to 7 days)
  const generatePickupTimes = () => {
    const times = [];
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    for (let day = 0; day < 7; day++) {
      const date = new Date(startTime.getTime() + day * 24 * 60 * 60 * 1000);
      
      // Restaurant hours: 11:30 AM - 9:30 PM
      const startHour = day === 0 ? Math.max(12, startTime.getHours()) : 12;
      const endHour = 21;

      for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeDate = new Date(date);
          timeDate.setHours(hour, minute, 0, 0);
          
          if (timeDate > startTime) {
            times.push({
              value: timeDate.toISOString(),
              label: timeDate.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            });
          }
        }
      }
    }

    return times.slice(0, 50); // Limit to 50 options
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: customerInfo,
          cartItems: cart.items,
          pickupTime: pickupTime || undefined,
          pickupNotes: pickupNotes || undefined,
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      setOrderId(orderResult.order.id);

      // Create payment intent
      const paymentResponse = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderResult.order.id,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment');
      }

      setClientSecret(paymentResult.clientSecret);
      setStep('payment');

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }

    setIsLoading(false);
  };

  const handlePaymentSuccess = (orderData: OrderData) => {
    clearCart();
    router.push(`/order-confirmation?order_id=${orderData.id}`);
  };

  if (cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1EB' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ 
                  color: '#6B5B4D',
                  backgroundColor: '#E8E1D9'
                }}
              >
                ← {language === 'en' ? 'Back to Menu' : '返回菜单'}
              </Link>
              <h1 
                className="text-2xl font-bold"
                style={{ 
                  color: '#2D1B12',
                  fontFamily: 'Cormorant Garamond, serif'
                }}
              >
                {language === 'en' ? 'Checkout' : '结账'}
              </h1>
            </div>
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="px-3 py-1 rounded-md transition-colors"
              style={{ 
                backgroundColor: '#E8E1D9', 
                color: '#2D1B12' 
              }}
            >
              {language === 'en' ? '中文' : 'English'}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-8">
              <div className={`flex items-center ${step === 'customer' ? 'text-orange-600' : step === 'payment' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'customer' ? 'bg-orange-100' : step === 'payment' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {step === 'payment' || step === 'confirmation' ? '✓' : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">
                  {language === 'en' ? 'Customer Info' : '客户信息'}
                </span>
              </div>
              <div className={`w-8 h-1 ${step === 'payment' || step === 'confirmation' ? 'bg-green-200' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${step === 'payment' ? 'text-orange-600' : step === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-orange-100' : step === 'confirmation' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {step === 'confirmation' ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">
                  {language === 'en' ? 'Payment' : '支付'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {step === 'customer' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6" style={{ color: '#2D1B12' }}>
                  {language === 'en' ? 'Customer Information' : '客户信息'}
                </h2>

                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                        {language === 'en' ? 'First Name *' : '名字 *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                        {language === 'en' ? 'Last Name *' : '姓氏 *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                      {language === 'en' ? 'Email Address *' : '电子邮箱 *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                      {language === 'en' ? 'Phone Number' : '电话号码'}
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                      {language === 'en' ? 'Pickup Time' : '取餐时间'}
                    </label>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">
                        {language === 'en' ? 'Select pickup time (optional)' : '选择取餐时间（可选）'}
                      </option>
                      {generatePickupTimes().map((time) => (
                        <option key={time.value} value={time.value}>
                          {time.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                      {language === 'en' ? 'Special Instructions' : '特殊要求'}
                    </label>
                    <textarea
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder={language === 'en' ? 'Any special requests or dietary restrictions...' : '任何特殊要求或饮食限制...'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#B87333' }}
                  >
                    {isLoading ? (
                      language === 'en' ? 'Creating Order...' : '创建订单中...'
                    ) : (
                      language === 'en' ? 'Continue to Payment' : '继续支付'
                    )}
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && clientSecret && orderId && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  customerInfo={customerInfo}
                  orderId={orderId}
                  clientSecret={clientSecret}
                  onPaymentSuccess={handlePaymentSuccess}
                  language={language}
                />
              </Elements>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Order Summary' : '订单摘要'}
              </h3>

              <div className="space-y-3 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: '#2D1B12' }}>
                        {item.menuItem.name[language]}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {language === 'en' ? 'Qty:' : '数量:'} {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium" style={{ color: '#2D1B12' }}>
                      {formatCurrency(item.totalPrice)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#6B5B4D' }}>
                    {language === 'en' ? 'Subtotal' : '小计'}
                  </span>
                  <span style={{ color: '#2D1B12' }}>
                    {formatCurrency(cart.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B5B4D' }}>
                    {language === 'en' ? 'Tax (6.25% MA)' : '税费 (6.25% MA)'}
                  </span>
                  <span style={{ color: '#2D1B12' }}>
                    {formatCurrency(cart.tax)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Total' : '总计'}
                  </span>
                  <span style={{ color: '#B87333' }}>
                    {formatCurrency(getGrandTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 