'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Import client mới
import { LogOut, ChevronFirst, ChevronLast, Bot, DollarSign } from "lucide-react";
import Link from 'next/link';

// Thay vì import từ file helper cũ, chúng ta có thể tạo client trực tiếp ở đây
// Hoặc bạn có thể cập nhật file lib/supabaseClient.js để dùng createClientComponentClient
const supabase = createClientComponentClient();

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      // Fetch role if user exists
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const response = await fetch('http://localhost:8001/api/v1/users/me', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            const userData = await response.json();
            setRole(userData.role_id);
          } catch (error) {
            console.error('Error fetching role:', error);
          }
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Tải lại trang để middleware xử lý chuyển hướng
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${sidebarExpanded ? "w-64" : "w-16"}`}>
         <nav className="h-full flex flex-col bg-white border-r shadow-sm">
           <div className="p-4 pb-2 flex justify-between items-center">
             <h1 className={`overflow-hidden transition-all font-display text-xl text-blue-700 ${sidebarExpanded ? "w-32" : "w-0"}`}>Phúc Đạt</h1>
             <button onClick={() => setSidebarExpanded(curr => !curr)} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
               {sidebarExpanded ? <ChevronFirst /> : <ChevronLast />}
             </button>
           </div>
 
           <ul className="flex-1 px-3">
             <li className="relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors bg-gradient-to-tr from-blue-200 to-blue-100 text-blue-800">
                 <Bot className="w-6 h-6 mr-3 text-blue-700 flex-shrink-0" />
                 <span className={`overflow-hidden transition-all font-heading text-blue-900 ${sidebarExpanded ? "w-52 ml-3" : "w-0"}`}>Chatflows</span>
             </li>
             <Link href="/dashboard/accounting">
               <li className="relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors text-gray-600 hover:bg-blue-50 group">
                 <DollarSign className="w-6 h-6 mr-3 text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200 flex-shrink-0" />
                 <span className={`overflow-hidden transition-all font-heading text-gray-800 ${sidebarExpanded ? "w-52 ml-3" : "w-0"}`}>Quản lý Tài chính</span>
               </li>
             </Link>
             <li className="relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors text-gray-600 hover:bg-blue-50 group" onClick={() => setShowFeedbackModal(true)}>
                 <svg className="w-6 h-6 mr-3 text-gray-700 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                 </svg>
                 <span className={`overflow-hidden transition-all font-heading text-gray-800 ${sidebarExpanded ? "w-52 ml-3" : "w-0"}`}>Góp Ý</span>
             </li>
           </ul>
 
           <div className="border-t flex p-3">
             <div className="w-10 h-10 rounded-md bg-blue-200 flex items-center justify-center font-bold text-blue-700">
               {user?.email?.charAt(0).toUpperCase()}
             </div>
             <div className={`flex justify-between items-center overflow-hidden transition-all ${sidebarExpanded ? "w-52 ml-3" : "w-0"}`}>
               <div className="leading-4">
                 <h4 className="font-heading text-sm truncate">{user?.email}</h4>
                 <span className="text-xs text-gray-600">Nhân viên</span>
               </div>
               <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-md">
                 <LogOut size={20} />
               </button>
             </div>
           </div>
         </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-display text-white">Gửi Góp Ý</h2>
                    <p className="text-blue-200 text-sm">Chúng tôi luôn lắng nghe ý kiến của bạn</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="w-10 h-10 bg-white bg-opacity-40 rounded-full flex items-center justify-center hover:bg-opacity-60 hover:bg-red-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                  title="Đóng"
                >
                  <svg className="w-5 h-5 text-gray-700 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <FeedbackForm onClose={() => setShowFeedbackModal(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackForm({ onClose }) {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      let headers = {
        'Content-Type': 'application/json',
      };
      let requestBody = formData;

      // Kiểm tra xem có session Supabase không (cho admin)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        // Cho user/manager, lấy user từ localStorage và thêm user_id vào body
        const userSession = localStorage.getItem('user_session');
        if (userSession) {
          const { user } = JSON.parse(userSession);
          requestBody = { ...formData, user_id: user.id };
        } else {
          setError('Bạn cần đăng nhập để gửi góp Ý');
          return;
        }
      }

      const response = await fetch('http://localhost:8001/api/v1/feedback/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({
          subject: '',
          message: '',
          category: 'general',
          priority: 'medium'
        });
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Có lỗi xảy ra khi gửi góp Ý');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Có lỗi xảy ra khi gửi góp Ý');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bug':
        return '🐛';
      case 'feature':
        return '✨';
      case 'improvement':
        return '🚀';
      default:
        return '💬';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-heading text-gray-900 mb-2">Gửi thành công!</h3>
        <p className="text-gray-700">Cảm ơn bạn đã góp ý. Ý kiến của bạn rất quý giá với chúng tôi.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-label">{error}</p>
        </div>
      )}

      {/* Subject Field */}
      <div>
        <label className="block text-sm font-label text-gray-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Tiêu đề
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
          placeholder="Nhập tiêu đề góp ý của bạn..."
        />
      </div>

      {/* Message Field */}
      <div>
        <label className="block text-sm font-label text-gray-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Nội dung chi tiết
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none text-gray-900 placeholder-gray-500"
          placeholder="Mô tả chi tiết góp ý của bạn..."
        />
      </div>

      {/* Category and Priority Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-label text-gray-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Danh mục
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white appearance-none text-gray-900"
          >
            <option value="general">💬 Tổng quát</option>
            <option value="bug">🐛 Lỗi</option>
            <option value="feature">✨ Tính năng</option>
            <option value="improvement">🚀 Cải thiện</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-label text-gray-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Ưu tiên
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none text-gray-900 ${getPriorityColor(formData.priority)}`}
          >
            <option value="low" className="bg-green-50 text-green-800">Thấp</option>
            <option value="medium" className="bg-yellow-50 text-yellow-800">Trung bình</option>
            <option value="high" className="bg-orange-50 text-orange-800">Cao</option>
            <option value="urgent" className="bg-red-50 text-red-800">Khẩn cấp</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-button hover:shadow-md"
        >
          <div className="flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Hủy
          </div>
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-button shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang gửi...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Gửi Góp Ý
            </div>
          )}
        </button>
      </div>
    </form>
  );
}