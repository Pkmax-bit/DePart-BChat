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

        console.log('User session saved to localStorage:', {
          userId: userData.user.id,
          role: userData.role,
          department_id: userData.user.department_id
        });

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
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Đăng Nhập Hệ Thống
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Nhập thông tin tài khoản để tiếp tục
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Nhập địa chỉ email của bạn"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
              Mật Khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
            >
              Tạo tài khoản mới
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}