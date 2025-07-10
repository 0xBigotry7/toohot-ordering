'use client';

import React, { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'zh';
  onAuthSuccess?: (user: { id: string; email?: string }) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, language, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClientSupabase();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setError('');
    setSuccess('');
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess(language === 'en' ? 'Login successful!' : '登录成功！');
        onAuthSuccess?.(data.user);
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch {
      setError(language === 'en' ? 'Login failed. Please try again.' : '登录失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError(language === 'en' ? 'Passwords do not match' : '密码不匹配');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setSuccess(language === 'en' 
          ? 'Account created! Please check your email to confirm your account.' 
          : '账户已创建！请检查您的邮箱以确认账户。'
        );
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      }
    } catch {
      setError(language === 'en' ? 'Signup failed. Please try again.' : '注册失败，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(language === 'en' 
          ? 'Password reset email sent! Please check your inbox.' 
          : '密码重置邮件已发送！请查看您的收件箱。'
        );
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      }
    } catch {
      setError(language === 'en' ? 'Failed to send reset email.' : '发送重置邮件失败。');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const titles = {
    login: { en: 'Sign In', zh: '登录' },
    signup: { en: 'Create Account', zh: '创建账户' },
    forgot: { en: 'Reset Password', zh: '重置密码' }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#2D1B12' }}>
            {titles[mode][language]}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Email' : '邮箱'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Password' : '密码'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#B87333' }}
            >
              {isLoading 
                ? (language === 'en' ? 'Signing in...' : '登录中...')
                : (language === 'en' ? 'Sign In' : '登录')
              }
            </button>
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {language === 'en' ? 'Forgot Password?' : '忘记密码？'}
              </button>
              <div className="text-sm" style={{ color: '#6B5B4D' }}>
                {language === 'en' ? "Don't have an account? " : '没有账户？ '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {language === 'en' ? 'Sign up' : '注册'}
                </button>
              </div>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                  {language === 'en' ? 'First Name' : '名字'}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                  {language === 'en' ? 'Last Name' : '姓氏'}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Email' : '邮箱'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Password' : '密码'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Confirm Password' : '确认密码'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#B87333' }}
            >
              {isLoading 
                ? (language === 'en' ? 'Creating account...' : '创建账户中...')
                : (language === 'en' ? 'Create Account' : '创建账户')
              }
            </button>
            <div className="text-center text-sm" style={{ color: '#6B5B4D' }}>
              {language === 'en' ? 'Already have an account? ' : '已有账户？ '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800"
              >
                {language === 'en' ? 'Sign in' : '登录'}
              </button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#2D1B12' }}>
                {language === 'en' ? 'Email Address' : '邮箱地址'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                placeholder={language === 'en' ? 'Enter your email address' : '输入您的邮箱地址'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#B87333' }}
            >
              {isLoading 
                ? (language === 'en' ? 'Sending...' : '发送中...')
                : (language === 'en' ? 'Send Reset Email' : '发送重置邮件')
              }
            </button>
            <div className="text-center text-sm" style={{ color: '#6B5B4D' }}>
              {language === 'en' ? 'Remember your password? ' : '记起密码了？ '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800"
              >
                {language === 'en' ? 'Sign in' : '登录'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal; 