'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClientSupabase } from '@/lib/supabase';
import Link from 'next/link';

const AccountPage = () => {
  const { user, profile, loading, signIn, signUp, signOut, updateProfile } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [orders, setOrders] = useState<Array<{
    id: string;
    order_number: string;
    created_at: string;
    total_cents: number;
    status: string;
    order_items?: Array<{
      id: string;
      menu_item_name_en: string;
      quantity: number;
      total_price_cents: number;
    }>;
  }>>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load user orders if authenticated
  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserOrders = async () => {
    if (!user) return;
    
    setLoadingOrders(true);
    try {
      const supabase = createClientSupabase();
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            menu_item_name_en,
            menu_item_name_zh,
            quantity,
            unit_price_cents,
            total_price_cents
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isSignUp) {
      const { error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created successfully! Please check your email for verification.');
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
      }
    } else {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Signed in successfully!');
        setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profile) return;

    const { error } = await updateProfile({
      first_name: formData.firstName || profile.first_name,
      last_name: formData.lastName || profile.last_name,
      phone: formData.phone || profile.phone
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Profile updated successfully!');
      setFormData({ email: '', password: '', firstName: '', lastName: '', phone: '' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setOrders([]);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F1EB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#B87333' }}></div>
          <p style={{ color: '#6B5B4D' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1EB' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#2D1B12', borderColor: '#B87333' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold" style={{ color: '#F5F1EB', fontFamily: 'Cormorant Garamond, serif' }}>
              TooHot 太辣
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-yellow-200 transition-colors">
                ← Back to Menu
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          // Authentication Form
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8" style={{ backgroundColor: '#F9F6F2' }}>
              <h1 className="text-3xl font-bold text-center mb-8" style={{ color: '#2D1B12', fontFamily: 'Cormorant Garamond, serif' }}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h1>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <>
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: '#2D1B12' }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required={isSignUp}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: '#2D1B12' }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required={isSignUp}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#2D1B12' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                        style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#2D1B12' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#2D1B12' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#B87333' }}
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm underline transition-colors"
                  style={{ color: '#B87333' }}
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // User Dashboard
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-lg shadow-lg p-8" style={{ backgroundColor: '#F9F6F2' }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#2D1B12', fontFamily: 'Cormorant Garamond, serif' }}>
                  My Account
                </h1>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#2D1B12' }}>
                    Profile Information
                  </h2>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> {profile?.email}</p>
                    <p><strong>Name:</strong> {profile?.first_name} {profile?.last_name}</p>
                    <p><strong>Phone:</strong> {profile?.phone || 'Not provided'}</p>
                    <p><strong>Member since:</strong> {formatDate(profile?.created_at || '')}</p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#2D1B12' }}>
                    Update Profile
                  </h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                    />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      style={{ backgroundColor: 'white', borderColor: '#B87333' }}
                    />
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors hover:opacity-90"
                      style={{ backgroundColor: '#B87333' }}
                    >
                      Update Profile
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Orders Section */}
            <div className="bg-white rounded-lg shadow-lg p-8" style={{ backgroundColor: '#F9F6F2' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#2D1B12', fontFamily: 'Cormorant Garamond, serif' }}>
                Order History
              </h2>

              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#B87333' }}></div>
                  <p style={{ color: '#6B5B4D' }}>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p style={{ color: '#6B5B4D' }}>You haven&apos;t placed any orders yet.</p>
                  <Link href="/" className="mt-4 inline-block px-4 py-2 rounded-md text-white font-medium transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#B87333' }}>
                    Browse Menu
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4" style={{ borderColor: '#B87333' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold" style={{ color: '#2D1B12' }}>
                            Order #{order.order_number}
                          </h3>
                          <p className="text-sm" style={{ color: '#6B5B4D' }}>
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold" style={{ color: '#B87333' }}>
                            {formatCurrency(order.total_cents)}
                          </p>
                          <p className="text-sm capitalize" style={{ color: '#6B5B4D' }}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium" style={{ color: '#2D1B12' }}>Items:</p>
                        <ul className="text-sm mt-1" style={{ color: '#6B5B4D' }}>
                          {order.order_items?.map((item) => (
                            <li key={item.id}>
                              {item.quantity}x {item.menu_item_name_en} - {formatCurrency(item.total_price_cents)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage; 