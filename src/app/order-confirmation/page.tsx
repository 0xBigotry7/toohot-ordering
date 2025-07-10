'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { type OrderWithItems } from '@/lib/database';

function OrderConfirmationContent() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const result = await response.json();
        if (result.success) {
          setOrder(result.order);
        } else {
          setError(result.error || 'Order not found');
        }
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#10B981'; // Green
      case 'preparing':
        return '#F59E0B'; // Amber
      case 'ready':
        return '#3B82F6'; // Blue
      case 'completed':
        return '#6B7280'; // Gray
      case 'cancelled':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return language === 'en' ? 'Pending Payment' : '待付款';
      case 'paid':
        return language === 'en' ? 'Payment Confirmed' : '付款确认';
      case 'preparing':
        return language === 'en' ? 'Preparing' : '准备中';
      case 'ready':
        return language === 'en' ? 'Ready for Pickup' : '准备取餐';
      case 'completed':
        return language === 'en' ? 'Completed' : '已完成';
      case 'cancelled':
        return language === 'en' ? 'Cancelled' : '已取消';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#B87333' }}
          ></div>
          <p style={{ color: '#6B5B4D' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="max-w-2xl mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#2D1B12' }}>
              {language === 'en' ? 'Order Not Found' : '找不到订单'}
            </h1>
            <p className="text-gray-600 mb-8">
              {error || (language === 'en' ? 'The order you are looking for does not exist.' : '您查找的订单不存在。')}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-md text-white font-medium"
              style={{ backgroundColor: '#B87333' }}
            >
              {language === 'en' ? 'Return to Menu' : '返回菜单'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1EB' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 
                className="text-2xl font-bold"
                style={{ 
                  color: '#2D1B12',
                  fontFamily: 'Cormorant Garamond, serif'
                }}
              >
                {language === 'en' ? 'Order Confirmation' : '订单确认'}
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

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="text-3xl mr-4">✅</div>
            <div>
              <h2 className="text-xl font-bold text-green-800">
                {language === 'en' ? 'Order Confirmed!' : '订单确认！'}
              </h2>
              <p className="text-green-700">
                {language === 'en' 
                  ? 'Thank you for your order. We\'ll start preparing your food shortly.' 
                  : '感谢您的订单。我们将很快开始准备您的食物。'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#2D1B12' }}>
              {language === 'en' ? 'Order Details' : '订单详情'}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium" style={{ color: '#6B5B4D' }}>
                  {language === 'en' ? 'Order Number' : '订单号'}
                </p>
                <p className="text-lg font-bold" style={{ color: '#2D1B12' }}>
                  {order.order_number}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium" style={{ color: '#6B5B4D' }}>
                  {language === 'en' ? 'Status' : '状态'}
                </p>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  ></div>
                  <p className="font-medium" style={{ color: getStatusColor(order.status) }}>
                    {getStatusText(order.status)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium" style={{ color: '#6B5B4D' }}>
                  {language === 'en' ? 'Customer' : '客户'}
                </p>
                <p style={{ color: '#2D1B12' }}>
                  {order.customer_first_name} {order.customer_last_name}
                </p>
                <p style={{ color: '#6B5B4D' }}>
                  {order.customer_email}
                </p>
                {order.customer_phone && (
                  <p style={{ color: '#6B5B4D' }}>
                    {order.customer_phone}
                  </p>
                )}
              </div>

              {order.pickup_time && (
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6B5B4D' }}>
                    {language === 'en' ? 'Pickup Time' : '取餐时间'}
                  </p>
                  <p style={{ color: '#2D1B12' }}>
                    {new Date(order.pickup_time).toLocaleString(language === 'en' ? 'en-US' : 'zh-CN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              )}

              {order.pickup_notes && (
                <div>
                  <p className="text-sm font-medium" style={{ color: '#6B5B4D' }}>
                    {language === 'en' ? 'Special Instructions' : '特殊要求'}
                  </p>
                  <p style={{ color: '#2D1B12' }}>
                    {order.pickup_notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium" style={{ color: '#6B5B4D' }}>
                  {language === 'en' ? 'Order Time' : '订单时间'}
                </p>
                <p style={{ color: '#2D1B12' }}>
                  {new Date(order.created_at!).toLocaleString(language === 'en' ? 'en-US' : 'zh-CN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: '#2D1B12' }}>
              {language === 'en' ? 'Order Items' : '订单项目'}
            </h3>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: '#2D1B12' }}>
                      {language === 'en' ? item.menu_item_name_en : item.menu_item_name_zh}
                    </p>
                    <p className="text-sm" style={{ color: '#6B5B4D' }}>
                      {language === 'en' ? 'Qty:' : '数量:'} {item.quantity}
                    </p>
                    {item.special_instructions && (
                      <p className="text-sm italic" style={{ color: '#6B5B4D' }}>
                        {item.special_instructions}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium" style={{ color: '#2D1B12' }}>
                      {formatCurrency(item.total_price_cents)}
                    </p>
                    <p className="text-sm" style={{ color: '#6B5B4D' }}>
                      {formatCurrency(item.unit_price_cents)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span style={{ color: '#6B5B4D' }}>
                    {language === 'en' ? 'Subtotal' : '小计'}
                  </span>
                  <span style={{ color: '#2D1B12' }}>
                    {formatCurrency(order.subtotal_cents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#6B5B4D' }}>
                    {language === 'en' ? 'Tax (6.25% MA)' : '税费 (6.25% MA)'}
                  </span>
                  <span style={{ color: '#2D1B12' }}>
                    {formatCurrency(order.tax_cents)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Total' : '总计'}
                  </span>
                  <span style={{ color: '#B87333' }}>
                    {formatCurrency(order.total_cents)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-md text-white font-medium transition-colors"
            style={{ backgroundColor: '#B87333' }}
          >
            {language === 'en' ? 'Order Again' : '再次订购'}
          </Link>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 rounded-md font-medium transition-colors border"
            style={{ 
              backgroundColor: 'transparent',
              color: '#2D1B12',
              borderColor: '#E8E1D9'
            }}
          >
            {language === 'en' ? 'Print Receipt' : '打印收据'}
          </button>
        </div>

        {/* Contact Information */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 text-center">
          <h4 className="text-lg font-semibold mb-4" style={{ color: '#2D1B12' }}>
            {language === 'en' ? 'Questions about your order?' : '对您的订单有疑问？'}
          </h4>
          <p className="text-gray-600 mb-4">
            {language === 'en' 
              ? 'Please contact us if you have any questions or need to modify your order.' 
              : '如果您有任何疑问或需要修改订单，请联系我们。'}
          </p>
          <div className="flex justify-center space-x-6">
            <a
              href="tel:+1-555-0123"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span>📞</span>
              <span>(555) 123-4567</span>
            </a>
            <a
              href="mailto:orders@toohot.kitchen"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <span>📧</span>
              <span>orders@toohot.kitchen</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: '#B87333' }}
          ></div>
          <p style={{ color: '#6B5B4D' }}>Loading...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
} 