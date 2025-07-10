'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { createOrder, CreateOrderRequest } from '@/lib/order-api';

interface OrderPlacementProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
}

interface OrderFormData {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  pickupTime: string;
  pickupNotes: string;
}

const OrderPlacement: React.FC<OrderPlacementProps> = ({ isOpen, onClose, language }) => {
  const { cart, clearCart, getTotalAmount, getTaxAmount, getGrandTotal } = useCart();
  const [formData, setFormData] = useState<OrderFormData>({
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    pickupTime: '',
    pickupNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.customerEmail || !formData.customerFirstName || !formData.customerLastName) {
      setError(language === 'en' ? 'Please fill in all required fields' : '请填写所有必填字段');
      return false;
    }
    
    if (!formData.customerEmail.includes('@')) {
      setError(language === 'en' ? 'Please enter a valid email address' : '请输入有效的邮箱地址');
      return false;
    }
    
    if (!cart.items || cart.items.length === 0) {
      setError(language === 'en' ? 'Your cart is empty' : '您的购物车是空的');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Convert cart items to order format
      const orderItems = cart.items.map((cartItem) => ({
        menuItemId: cartItem.id,
        quantity: cartItem.quantity
      }));
      
      const orderRequest: CreateOrderRequest = {
        customerEmail: formData.customerEmail,
        customerFirstName: formData.customerFirstName,
        customerLastName: formData.customerLastName,
        customerPhone: formData.customerPhone || undefined,
        pickupTime: formData.pickupTime ? new Date(formData.pickupTime) : undefined,
        pickupNotes: formData.pickupNotes || undefined,
        items: orderItems
      };
      
      const order = await createOrder(orderRequest);
      
      setOrderSuccess(true);
      setOrderNumber(order.orderNumber);
      clearCart();
      
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(language === 'en' 
        ? 'Failed to create order. Please try again.' 
        : '创建订单失败，请重试。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOrderSuccess(false);
    setOrderNumber('');
    setError('');
    setFormData({
      customerEmail: '',
      customerFirstName: '',
      customerLastName: '',
      customerPhone: '',
      pickupTime: '',
      pickupNotes: ''
    });
    onClose();
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#2D1B12' }}>
              {language === 'en' ? 'Complete Your Order' : '完成订单'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {orderSuccess ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Order Confirmed!' : '订单确认！'}
              </h3>
              <p className="text-lg mb-4" style={{ color: '#6B5B4D' }}>
                {language === 'en' ? 'Your order number is:' : '您的订单号是：'}
              </p>
              <p className="text-xl font-mono font-bold mb-6" style={{ color: '#B87333' }}>
                {orderNumber}
              </p>
              <p className="text-sm mb-6" style={{ color: '#6B5B4D' }}>
                {language === 'en' 
                  ? 'We\'ll send you an email confirmation and updates about your order.'
                  : '我们将向您发送电子邮件确认和订单更新。'
                }
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-md text-white font-medium"
                style={{ backgroundColor: '#B87333' }}
              >
                {language === 'en' ? 'Close' : '关闭'}
              </button>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F9F6F2' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#2D1B12' }}>
                  {language === 'en' ? 'Order Summary' : '订单摘要'}
                </h3>
                <div className="space-y-2 text-sm">
                  {cart.items.map((cartItem) => (
                    <div key={cartItem.id} className="flex justify-between">
                      <span>
                        {cartItem.quantity}x {cartItem.menuItem.name[language]}
                      </span>
                      <span>{formatCurrency(cartItem.totalPrice)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span>{language === 'en' ? 'Subtotal:' : '小计：'}</span>
                      <span>{formatCurrency(getTotalAmount())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'en' ? 'Tax:' : '税费：'}</span>
                      <span>{formatCurrency(getTaxAmount())}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>{language === 'en' ? 'Total:' : '总计：'}</span>
                      <span style={{ color: '#B87333' }}>{formatCurrency(getGrandTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                      {language === 'en' ? 'First Name' : '名字'} *
                    </label>
                    <input
                      type="text"
                      value={formData.customerFirstName}
                      onChange={(e) => handleInputChange('customerFirstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                      {language === 'en' ? 'Last Name' : '姓氏'} *
                    </label>
                    <input
                      type="text"
                      value={formData.customerLastName}
                      onChange={(e) => handleInputChange('customerLastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Email Address' : '电子邮箱'} *
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Phone Number' : '电话号码'}
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Preferred Pickup Time' : '首选取餐时间'}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.pickupTime}
                    onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                    {language === 'en' ? 'Special Instructions' : '特殊要求'}
                  </label>
                  <textarea
                    value={formData.pickupNotes}
                    onChange={(e) => handleInputChange('pickupNotes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    placeholder={language === 'en' ? 'Any special requests or dietary restrictions...' : '任何特殊要求或饮食限制...'}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : '取消'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 rounded-md text-white font-medium transition-colors disabled:opacity-50"
                    style={{ backgroundColor: '#B87333' }}
                  >
                    {isSubmitting 
                      ? (language === 'en' ? 'Placing Order...' : '正在下单...')
                      : (language === 'en' ? 'Place Order' : '下单')
                    }
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPlacement; 