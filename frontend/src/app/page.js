import Link from 'next/link'; // Import component Link để điều hướng
import { supabase } from '../lib/supabaseClient';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  // Kiểm tra session trên server
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Nếu đã đăng nhập, chuyển hướng đến dashboard
    redirect('/dashboard');
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <main className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto">
        <h1 className="text-5xl font-bold text-blue-800 mb-4">
          Xin Chào!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Chào mừng bạn đến với hệ thống chat nội bộ của <strong>Phúc Đạt</strong>.
        </p>

        <Link
          href="/login"
          className="inline-block px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Đăng Nhập
        </Link>
      </main>
    </div>
  );
}