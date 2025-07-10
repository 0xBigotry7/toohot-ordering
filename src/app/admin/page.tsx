'use client';

import { useState, useEffect } from 'react';
import { updateOrderStatus } from '@/lib/order-api';
import { getAllOrdersWithFetch } from '@/lib/order-api-fetch';
import { Order } from '@/lib/order-api';

const AdminDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'zh'>('en');

  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const orderData = await getAllOrdersWithFetch(100); // Get last 100 orders using fetch
      setOrders(orderData);
    } catch {
      // Error loading orders - orders will remain empty
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(orderId);
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      
      // Update orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
      
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
    } catch (error) {
      alert(`Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#FBB040',
      paid: '#10B981',
      preparing: '#3B82F6',
      ready: '#8B5CF6',
      completed: '#6B7280',
      cancelled: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusText = (status: Order['status']) => {
    const texts = {
      en: {
        pending: 'Pending Payment',
        paid: 'Paid',
        preparing: 'Preparing',
        ready: 'Ready for Pickup',
        completed: 'Completed',
        cancelled: 'Cancelled'
      },
      zh: {
        pending: '待付款',
        paid: '已付款',
        preparing: '制作中',
        ready: '待取餐',
        completed: '已完成',
        cancelled: '已取消'
      }
    };
    return texts[language][status] || status;
  };

  const translations = {
    en: {
      title: 'TooHot Admin Dashboard',
      subtitle: 'Order Management System',
      totalOrders: 'Total Orders',
      refresh: 'Refresh',
      recentOrders: 'Recent Orders',
      orderDetails: 'Order Details',
      customerInfo: 'Customer Information',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      pickupTime: 'Pickup Time',
      orderItems: 'Order Items',
      subtotal: 'Subtotal',
      tax: 'Tax',
      total: 'Total',
      updateStatus: 'Update Status',
      specialNotes: 'Special Notes',
      note: 'Note',
      noOrders: 'No orders found',
      selectOrder: 'Select an order to view details',
      loading: 'Loading orders...',
      items: 'items',
      item: 'item'
    },
    zh: {
      title: 'TooHot 管理后台',
      subtitle: '订单管理系统',
      totalOrders: '订单总数',
      refresh: '刷新',
      recentOrders: '最新订单',
      orderDetails: '订单详情',
      customerInfo: '客户信息',
      name: '姓名',
      email: '邮箱',
      phone: '电话',
      pickupTime: '取餐时间',
      orderItems: '订单商品',
      subtotal: '小计',
      tax: '税费',
      total: '总计',
      updateStatus: '更新状态',
      specialNotes: '特殊说明',
      note: '备注',
      noOrders: '暂无订单',
      selectOrder: '选择订单查看详情',
      loading: '加载订单中...',
      items: '件商品',
      item: '件商品'
    }
  };

  const getText = (key: keyof typeof translations.en) => {
    return translations[language][key];
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error, 'Input:', date);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundImage: 'url("/background_panda.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
        <div className="text-center p-8 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105" style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(184, 115, 51, 0.2)'
        }}>
          <div className="relative mb-6">
            <div 
              className="animate-spin rounded-full h-16 w-16 mx-auto"
              style={{ 
                background: `conic-gradient(from 0deg, transparent, #B87333, transparent)`,
                borderRadius: '50%',
                padding: '2px'
              }}
            >
              <div className="rounded-full h-full w-full" style={{ background: '#F5F1EB' }}></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span style={{ fontSize: '24px' }}>🍽️</span>
            </div>
          </div>
          <p className="text-lg font-semibold animate-pulse" style={{ color: '#2D1B12' }}>
            {getText('loading')}
          </p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#B87333', animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#B87333', animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#B87333', animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundImage: 'url("/background_panda.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      {/* Header */}
      <header 
        className="shadow-lg border-b backdrop-blur-md sticky top-0 z-10"
        style={{ 
          background: 'linear-gradient(135deg, rgba(249, 246, 242, 0.95) 0%, rgba(255, 248, 240, 0.95) 100%)',
          borderBottomColor: '#E8E1D9'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: '#2D1B12', fontFamily: 'Cormorant Garamond, serif' }}>
                {getText('title')}
              </h1>
              <p className="text-sm" style={{ color: '#6B5B4D' }}>
                {getText('subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                style={{ 
                  backgroundColor: '#E8E1D9', 
                  color: '#2D1B12',
                  border: '1px solid #D4C4B8'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#D4C4B8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#E8E1D9';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
              >
                <span className="flex items-center space-x-1">
                  <span>🌐</span>
                  <span>{language === 'en' ? '中文' : 'English'}</span>
                </span>
              </button>
              
              <div className="text-sm" style={{ color: '#6B5B4D' }}>
                {getText('totalOrders')}: <span className="font-semibold">{orders.length}</span>
              </div>
              <button
                onClick={loadOrders}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center space-x-2 ${
                  loading ? 'cursor-not-allowed opacity-75' : 'hover:brightness-110'
                }`}
                style={{ 
                  backgroundColor: '#B87333', 
                  color: 'white',
                  border: '2px solid #A0622A'
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(184, 115, 51, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(184, 115, 51, 0.2)';
                }}
                onMouseDown={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(1px)';
                  }
                }}
                onMouseUp={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
              >
                <span className={loading ? 'animate-spin' : ''}>
                  {loading ? '⏳' : '🔄'}
                </span>
                <span>{getText('refresh')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-1 gap-6 lg:gap-8">
          {/* Mobile Order Details Modal Overlay */}
          {selectedOrder && (
                         <div 
               className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4"
               onClick={() => setSelectedOrder(null)}
             >
              <div 
                className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold" style={{ color: '#2D1B12' }}>
                    {getText('orderDetails')}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl">×</span>
                  </button>
                </div>
                <div className="p-4 overflow-y-auto max-h-96">
                  {/* Same order details content as desktop */}
                  <div className="space-y-4">
                    {/* Customer Info */}
                    <div>
                      <h3 className="font-bold mb-2" style={{ color: '#2D1B12' }}>{getText('customerInfo')}</h3>
                      <p className="text-sm" style={{ color: '#2D1B12' }}>
                        <span className="font-medium" style={{ color: '#B87333' }}>{getText('name')}:</span> {selectedOrder.customerFirstName} {selectedOrder.customerLastName}
                      </p>
                      <p className="text-sm" style={{ color: '#2D1B12' }}>
                        <span className="font-medium" style={{ color: '#B87333' }}>{getText('email')}:</span> {selectedOrder.customerEmail}
                      </p>
                    </div>
                    
                    {/* Status Update */}
                    <div>
                      <h3 className="font-bold mb-2" style={{ color: '#2D1B12' }}>{getText('updateStatus')}</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {(['paid', 'preparing', 'ready', 'completed'] as const).map((status) => {
                          const isActive = selectedOrder.status === status;
                          const isUpdating = updatingStatus === selectedOrder.id;
                          const isDisabled = isUpdating || isActive;
                          
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                              disabled={isDisabled}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                isActive ? 'opacity-60' : 'hover:scale-105'
                              }`}
                              style={{ 
                                backgroundColor: getStatusColor(status), 
                                color: 'white'
                              }}
                            >
                              {isUpdating ? '⏳' : getStatusText(status)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Orders List */}
          <div className="xl:col-span-2 lg:col-span-1">
            <div 
              className="rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
              style={{ 
                background: 'linear-gradient(135deg, #F9F6F2 0%, #FFF8F0 100%)'
              }}
            >
                             <div className="px-6 py-4 border-b border-gray-200">
                 <h2 className="text-xl font-bold" style={{ color: '#2D1B12' }}>
                   {getText('recentOrders')}
                 </h2>
               </div>
              
              <div className="max-h-96 overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="p-8 text-center">
                    <p style={{ color: '#2D1B12', fontWeight: '500' }}>{getText('noOrders')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className={`p-5 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-lg mx-2 my-1 shadow-sm hover:shadow-lg ${
                          selectedOrder?.id === order.id 
                            ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-400 shadow-md' 
                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border-l-4 border-transparent hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          background: selectedOrder?.id === order.id 
                            ? 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)' 
                            : undefined
                        }}
                        onMouseOver={(e) => {
                          if (selectedOrder?.id !== order.id) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                          }
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = selectedOrder?.id === order.id 
                            ? '0 4px 15px rgba(0,0,0,0.1)' 
                            : '0 1px 3px rgba(0,0,0,0.05)';
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-bold text-lg" style={{ color: '#2D1B12' }}>
                                {order.orderNumber}
                              </h3>
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getStatusColor(order.status) }}
                              >
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            <p className="text-sm" style={{ color: '#2D1B12' }}>
                              {order.customerFirstName} {order.customerLastName} • {order.customerEmail}
                            </p>
                            <p className="text-xs" style={{ color: '#6B5B4D', fontWeight: '500' }}>
                              {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold" style={{ color: '#B87333' }}>
                              {formatCurrency(order.totalCents)}
                            </p>
                            <p className="text-xs" style={{ color: '#6B5B4D', fontWeight: '500' }}>
                              {order.items.length} {getText(order.items.length === 1 ? 'item' : 'items')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Details - Desktop Only */}
          <div className="hidden xl:block xl:col-span-1">
            <div 
              className="rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl sticky top-8"
              style={{ 
                background: 'linear-gradient(135deg, #F9F6F2 0%, #FFF8F0 100%)',
                maxHeight: 'calc(100vh - 200px)'
              }}
            >
                             <div className="px-6 py-4 border-b border-gray-200">
                 <h2 className="text-xl font-bold" style={{ color: '#2D1B12' }}>
                   {getText('orderDetails')}
                 </h2>
               </div>
              
              {selectedOrder ? (
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {/* Customer Info */}
                  <div className="mb-6">
                    <h3 className="font-bold mb-2" style={{ color: '#2D1B12' }}>{getText('customerInfo')}</h3>
                    <p className="text-sm" style={{ color: '#2D1B12' }}>
                      <span className="font-medium" style={{ color: '#B87333' }}>{getText('name')}:</span> {selectedOrder.customerFirstName} {selectedOrder.customerLastName}
                    </p>
                    <p className="text-sm" style={{ color: '#2D1B12' }}>
                      <span className="font-medium" style={{ color: '#B87333' }}>{getText('email')}:</span> {selectedOrder.customerEmail}
                    </p>
                    {selectedOrder.customerPhone && (
                      <p className="text-sm" style={{ color: '#2D1B12' }}>
                        <span className="font-medium" style={{ color: '#B87333' }}>{getText('phone')}:</span> {selectedOrder.customerPhone}
                      </p>
                    )}
                    {selectedOrder.pickupTime && (
                      <p className="text-sm" style={{ color: '#2D1B12' }}>
                        <span className="font-medium" style={{ color: '#B87333' }}>{getText('pickupTime')}:</span> {formatDate(selectedOrder.pickupTime)}
                      </p>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-bold mb-2" style={{ color: '#2D1B12' }}>{getText('orderItems')}</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between text-sm p-3 rounded-lg" 
                          style={{ background: '#FFF8F0', border: '1px solid #E8E1D9' }}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-base" style={{ color: '#2D1B12' }}>
                              {item.quantity}x {language === 'en' ? item.menuItemNameEn : item.menuItemNameZh}
                            </p>
                            {language === 'en' && item.menuItemNameZh && (
                              <p className="text-sm" style={{ color: '#6B5B4D', fontWeight: '500' }}>
                                {item.menuItemNameZh}
                              </p>
                            )}
                            {language === 'zh' && item.menuItemNameEn && (
                              <p className="text-sm" style={{ color: '#6B5B4D', fontWeight: '500' }}>
                                {item.menuItemNameEn}
                              </p>
                            )}
                            {item.specialInstructions && (
                              <p className="text-sm italic" style={{ color: '#B87333' }}>
                                {getText('note')}: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                          <p className="font-bold text-base" style={{ color: '#B87333' }}>
                            {formatCurrency(item.totalPriceCents)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6 border-t pt-4" style={{ borderColor: '#E8E1D9' }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: '#2D1B12' }}>{getText('subtotal')}:</span>
                      <span style={{ color: '#2D1B12', fontWeight: '500' }}>{formatCurrency(selectedOrder.subtotalCents)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: '#2D1B12' }}>{getText('tax')}:</span>
                      <span style={{ color: '#2D1B12', fontWeight: '500' }}>{formatCurrency(selectedOrder.taxCents)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span style={{ color: '#2D1B12' }}>{getText('total')}:</span>
                      <span style={{ color: '#B87333', fontWeight: '700' }}>{formatCurrency(selectedOrder.totalCents)}</span>
                    </div>
                  </div>

                  {/* Status Update Actions */}
                  <div>
                    <h3 className="font-bold mb-4" style={{ color: '#2D1B12' }}>{getText('updateStatus')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {(['paid', 'preparing', 'ready', 'completed'] as const).map((status) => {
                        const isActive = selectedOrder.status === status;
                        const isUpdating = updatingStatus === selectedOrder.id;
                        const isDisabled = isUpdating || isActive;
                        
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                            disabled={isDisabled}
                            className={`relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                              isActive
                                ? 'opacity-60 cursor-not-allowed scale-95 shadow-inner'
                                : isUpdating
                                ? 'opacity-75 cursor-wait animate-pulse'
                                : 'hover:scale-105 hover:shadow-lg active:scale-95 shadow-md hover:shadow-xl'
                            }`}
                            style={{ 
                              backgroundColor: getStatusColor(status), 
                              color: 'white',
                              border: isActive ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
                              boxShadow: isActive 
                                ? 'inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)'
                                : `0 4px 15px ${getStatusColor(status)}40`
                            }}
                            onMouseOver={(e) => {
                              if (!isDisabled) {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                e.currentTarget.style.boxShadow = `0 8px 25px ${getStatusColor(status)}60`;
                                e.currentTarget.style.filter = 'brightness(1.1)';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isDisabled) {
                                e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                                e.currentTarget.style.boxShadow = `0 4px 15px ${getStatusColor(status)}40`;
                                e.currentTarget.style.filter = 'brightness(1)';
                              }
                            }}
                            onMouseDown={(e) => {
                              if (!isDisabled) {
                                e.currentTarget.style.transform = 'translateY(1px) scale(0.98)';
                              }
                            }}
                            onMouseUp={(e) => {
                              if (!isDisabled) {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                              }
                            }}
                          >
                            {isUpdating && updatingStatus === selectedOrder.id ? (
                              <span className="flex items-center justify-center">
                                <span className="animate-spin mr-2">⏳</span>
                                更新中...
                              </span>
                            ) : (
                              <span className="flex items-center justify-center">
                                {isActive && <span className="mr-2">✓</span>}
                                {getStatusText(status)}
                              </span>
                            )}
                            
                            {/* Ripple effect overlay */}
                            {!isDisabled && (
                              <span 
                                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 hover:opacity-20"
                                style={{ 
                                  background: 'radial-gradient(circle, white 0%, transparent 70%)',
                                  pointerEvents: 'none'
                                }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedOrder.pickupNotes && (
                    <div className="mt-6 p-3 rounded-md" style={{ background: '#FEF3C7', border: '1px solid #F3E88A' }}>
                      <h4 className="font-medium text-sm mb-1" style={{ color: '#B87333' }}>{getText('specialNotes')}:</h4>
                      <p className="text-sm" style={{ color: '#2D1B12', fontWeight: '500' }}>{selectedOrder.pickupNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-64">
                  <div className="mb-4 text-6xl opacity-50 animate-bounce">📋</div>
                  <p className="text-lg font-semibold mb-2" style={{ color: '#2D1B12' }}>
                    {getText('selectOrder')}
                  </p>
                  <p className="text-sm opacity-70" style={{ color: '#6B5B4D' }}>
                    {language === 'en' ? 'Click on an order from the list to view details' : '点击左侧订单查看详情'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 