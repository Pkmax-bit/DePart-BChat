import { Users, MessageSquare, MessageCircle, Building, LogOut, History, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useState } from 'react';

export default function AdminLayout({ user, activeTab, onTabChange, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // Lấy thông tin user từ session để log activity
      const localSession = localStorage.getItem('user_session');
      if (localSession) {
        const sessionData = JSON.parse(localSession);
        
        // Log activity khi đăng xuất
        try {
          await fetch('http://localhost:8001/api/v1/users/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: sessionData.user.id
            })
          });
          console.log('Logout activity logged');
        } catch (error) {
          console.error('Failed to log logout activity:', error);
        }
      }

      // Đăng xuất Supabase session (cho Admin)
      await supabase.auth.signOut();

      // Xóa localStorage session (cho User/Manager)
      localStorage.removeItem('user_session');

      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn chuyển hướng về login ngay cả khi có lỗi
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          <button
            onClick={() => {
              onTabChange('users');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mb-2 flex items-center ${
              activeTab === 'users'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            Quản lý Nhân viên
          </button>

          <button
            onClick={() => {
              onTabChange('chatflows');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mb-2 flex items-center ${
              activeTab === 'chatflows'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Quản lý Chatflow
          </button>

          <button
            onClick={() => {
              onTabChange('departments');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mb-2 flex items-center ${
              activeTab === 'departments'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Building className="w-4 h-4 mr-2" />
            Quản lý Phòng ban
          </button>

          <button
            onClick={() => {
              onTabChange('feedback');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mb-2 flex items-center ${
              activeTab === 'feedback'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Góp Ý
          </button>

          <button
            onClick={() => {
              onTabChange('payroll');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium mb-2 flex items-center ${
              activeTab === 'payroll'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Quản lý Lương
          </button>

          <button
            onClick={() => {
              onTabChange('chat-history');
              setSidebarOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center ${
              activeTab === 'chat-history'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-900 hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            Lịch sử Chat
          </button>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={() => {
              window.location.href = '/dashboard';
              setSidebarOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100 mb-2"
          >
            ← Quay lại Dashboard
          </button>
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 flex items-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-4 lg:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 mr-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900 truncate">
                {activeTab === 'users' ? 'Quản lý Nhân viên' :
                 activeTab === 'chatflows' ? 'Quản lý Chatflow' :
                 activeTab === 'departments' ? 'Quản lý Phòng ban' :
                 activeTab === 'feedback' ? 'Quản lý Góp Ý' :
                 activeTab === 'user-chat-history' ? 'User Chat History' :
                 activeTab === 'chat-history' ? 'Lịch sử Trò chuyện' :
                 activeTab === 'payroll' ? 'Quản lý Lương' : 'Admin Panel'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-900 hidden sm:block">
                Admin: {user?.full_name || user?.email || 'Admin'}
              </span>
              <span className="text-xs text-gray-600 sm:hidden">
                {user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
