'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function UserPage() {
  const params = useParams();
  const userId = params?.id;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserChatHistory();
    }
  }, [userId]);

  const fetchUserChatHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/chat-history/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user chat history');
      }
    } catch (error) {
      console.error('Error fetching user chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseEmailFromConversation = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/chat-history/parse-email/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        alert(`Kết quả parse email:\n${JSON.stringify(data, null, 2)}`);
        // Refresh data sau khi parse
        fetchUserChatHistory();
      } else {
        alert('Không thể parse email từ conversation này');
      }
    } catch (error) {
      console.error('Error parsing email:', error);
      alert('Lỗi khi parse email: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Đang tải dữ liệu user...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-red-600">Không tìm thấy dữ liệu user</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* User Info Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Lịch sử Chat của User
            </h1>
            <button
              onClick={fetchUserChatHistory}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>

          {userData.user && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Thông tin User</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">ID</p>
                  <p className="text-lg font-semibold">{userData.user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Username</p>
                  <p className="text-lg font-semibold">{userData.user.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-lg font-semibold">{userData.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Full Name</p>
                  <p className="text-lg font-semibold">{userData.user.full_name}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-blue-600">Tổng tin nhắn</p>
              <p className="text-2xl font-bold text-blue-700">{userData.total_messages}</p>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <p className="text-sm font-medium text-green-600">Số cuộc hội thoại</p>
              <p className="text-2xl font-bold text-green-700">{userData.conversation_count}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <p className="text-sm font-medium text-yellow-600">User ID</p>
              <p className="text-2xl font-bold text-yellow-700">{userId}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <p className="text-sm font-medium text-purple-600">Trạng thái</p>
              <p className="text-lg font-bold text-purple-700">
                {userData.user?.is_active ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Danh sách cuộc hội thoại</h2>

          {Object.keys(userData.conversations).length === 0 ? (
            <p className="text-gray-500 italic">Không có cuộc hội thoại nào</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(userData.conversations).map(([conversationId, messages]) => (
                <div key={conversationId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-medium">
                        Conversation: {conversationId.substring(0, 8)}...
                      </h3>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {messages.length} tin nhắn
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => parseEmailFromConversation(conversationId)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                      >
                        Parse Email
                      </button>
                      <button
                        onClick={() => setSelectedConversation(
                          selectedConversation === conversationId ? null : conversationId
                        )}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                      >
                        {selectedConversation === conversationId ? 'Ẩn' : 'Xem'} chi tiết
                      </button>
                    </div>
                  </div>

                  {selectedConversation === conversationId && (
                    <div className="mt-4 space-y-3">
                      {messages.map((message, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-gray-600">
                              {new Date(message.created_at || message.timestamp).toLocaleString('vi-VN')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {message.name_app}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-blue-600">User:</p>
                              <p className="text-sm bg-blue-50 p-2 rounded">
                                {message.user_message}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm font-medium text-green-600">Bot:</p>
                              <p className="text-sm bg-green-50 p-2 rounded">
                                {message.bot_response}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parse Email Tool */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Công cụ Parse Email</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              <strong>Cách sử dụng:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Nhấn "Parse Email" trên từng conversation để tách email từ tin nhắn đầu tiên</li>
              <li>• Email sẽ được parse từ format: <code className="bg-gray-200 px-1 rounded">{"{"}Email":"user@example.com"{"}"}</code></li>
              <li>• Hệ thống sẽ tự động tìm user tương ứng với email đó</li>
              <li>• Nếu tìm thấy user, dữ liệu sẽ được cập nhật tự động</li>
            </ul>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-blue-700 mb-2">
                📧 Email Parsing Results:
              </p>
              <div className="bg-white p-3 rounded border text-sm">
                {userData.user ? (
                  <p className="text-green-600">
                    ✅ User found: {userData.user.email} (ID: {userData.user.id})
                  </p>
                ) : (
                  <p className="text-red-600">
                    ❌ No user found for this email
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
