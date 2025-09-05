'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Thử đăng nhập qua Supabase Auth trước (cho Admin)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        // Đăng nhập thành công với Supabase Auth (Admin)
        console.log('Admin login successful');
        router.push('/admin');
        return;
      }

      // Nếu Supabase Auth thất bại, thử kiểm tra bảng users (cho User/Manager)
      console.log('Supabase Auth failed, checking users table...');

      // Gọi API để kiểm tra user trong bảng users
      const checkResponse = await fetch('http://localhost:8001/api/v1/users/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (checkResponse.ok) {
        const userData = await checkResponse.json();
        console.log('User login successful:', userData);
        console.log('User ID:', userData.user.id); // Log user ID để debug

        // Lưu thông tin user vào localStorage (cho User/Manager)
        localStorage.setItem('user_session', JSON.stringify({
          user: userData.user,
          role: userData.role,
          department_id: userData.user.department_id,
          login_time: new Date().toISOString()
        }));

        // Log activity khi đăng nhập
        try {
          await fetch('http://localhost:8001/api/v1/users/activity/log', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userData.user.id,
              chatflow_id: null,  // null for login activity
              online: true  // true for login
            })
          });
          console.log('Login activity logged');
        } catch (error) {
          console.error('Failed to log login activity:', error);
        }

        // Chuyển hướng dựa trên role
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Đăng Nhập
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật Khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Tạo tài khoản mới
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}