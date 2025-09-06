'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import DashboardLayout from '../../components/DashboardLayout';

// DashboardContent Component
function DashboardContent({ selectedChatflow, currentConversationId, user, sidebarWidth, onSidebarWidthChange }) {
  // Update local sidebarWidth when prop changes
  React.useEffect(() => {
    onSidebarWidthChange(sidebarWidth);
  }, [sidebarWidth, onSidebarWidthChange]);

  return (
    <div className="h-full">
      {selectedChatflow ? (
        <iframe
          key={`${user?.id || 'no-user'}-${selectedChatflow.id}-${currentConversationId || 'no-conversation'}`}
          src={currentConversationId
            ? `${selectedChatflow.embed_url}?conversationId=${currentConversationId}`
            : selectedChatflow.embed_url
          }
          className="w-full h-full border-0 transition-opacity duration-300"
          title={selectedChatflow.name}
          onLoad={() => {
            console.log('Chatbot loaded successfully with conversation:', currentConversationId);

            // Inject script để monitor conversation_id changes trong iframe
            try {
              const iframe = document.querySelector('iframe');
              if (iframe && iframe.contentWindow) {
                // Send message to iframe để setup monitoring
                iframe.contentWindow.postMessage({
                  type: 'INIT_CONVERSATION_MONITOR',
                  parentOrigin: window.location.origin
                }, '*');
              }
            } catch (error) {
              console.log('Could not inject monitoring script:', error);
            }
          }}
          onError={(e) => {
            console.error('Failed to load chatbot:', e);
            // Có thể hiển thị error message ở đây
          }}
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Chào mừng đến với Chatbot
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Chọn một chatbot từ sidebar để bắt đầu cuộc trò chuyện thú vị của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Thông Minh</h3>
                <p className="text-gray-500 text-xs">AI tiên tiến hỗ trợ 24/7</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 text-sm">Nhanh Chóng</h3>
                <p className="text-gray-500 text-xs">Phản hồi tức thời</p>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Chọn chatbot từ menu bên trái để bắt đầu
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function PasswordChangeModal({ isOpen, onClose, userEmail }) {
  const [step, setStep] = useState('email'); // 'email', 'code', 'success'
  const [email, setEmail] = useState(userEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8001/api/v1/users/password-reset/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStep('code');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Không thể gửi mã xác thực');
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    }

    setLoading(false);
  };

  const handleVerifyCode = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8001/api/v1/users/password-reset/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword
        })
      });

      if (response.ok) {
        setStep('success');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Mã xác thực không hợp lệ');
      }
    } catch (error) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    }

    setLoading(false);
  };

  const resetModal = () => {
    setStep('email');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setEmail(userEmail || '');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 'email' && 'Đổi mật khẩu'}
            {step === 'code' && 'Nhập mã xác thực'}
            {step === 'success' && 'Thành công'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === 'email' && (
          <div>
            <p className="text-gray-600 mb-4">
              Chúng tôi sẽ gửi mã xác thực đến email của bạn để đổi mật khẩu.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email của bạn
              </label>
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span className="text-gray-900 font-medium">{email}</span>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
              </button>
            </div>
          </div>
        )}

        {step === 'code' && (
          <div>
            <p className="text-gray-600 mb-4">
              Nhập mã xác thực đã được gửi đến email {email}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã xác thực
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mã 6 chữ số"
                maxLength={6}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu mới"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStep('email')}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Mật khẩu đã được đổi thành công!
            </h3>
            <p className="text-gray-600 mb-4">
              Bạn có thể sử dụng mật khẩu mới để đăng nhập.
            </p>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [chatflows, setChatflows] = useState([]);
  const [selectedChatflow, setSelectedChatflow] = useState(null);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConversationControls, setShowConversationControls] = useState(false);
  const [manualConversationId, setManualConversationId] = useState('');
  const [showSessionList, setShowSessionList] = useState(false);
  const [userSessions, setUserSessions] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userChatHistory, setUserChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width matching DashboardLayout
  // useEffect để gửi conversation_id vào iframe khi nó thay đổi
  useEffect(() => {
    if (currentConversationId && selectedChatflow) {
      console.log('Conversation ID changed, sending to iframe:', currentConversationId);
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'SET_CONVERSATION_ID',
          conversationId: currentConversationId
        }, '*');
      }
    }
  }, [currentConversationId, selectedChatflow]);

  const router = useRouter();

  useEffect(() => {
    checkUser();
    fetchChatflows();
  }, []);

  // Reset state khi user thay đổi
  useEffect(() => {
    if (user) {
      console.log('User changed, resetting dashboard state for:', user);
      console.log('User ID:', user.id, 'Type:', typeof user.id);
      setSelectedChatflow(null);
      setCurrentConversationId(null);
      setChatHistory([]);
      setUserSessions([]);
      setShowConversationControls(false);
      setManualConversationId('');
      // Load user chat history
      console.log('About to call loadUserChatHistory with user.id:', user.id);
      loadUserChatHistory(user.id);
    } else {
      console.log('User is null, not loading chat history');
    }
  }, [user?.id]);

  // useEffect để listen for messages từ iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Chỉ accept messages từ Dify domain
      if (event.origin.includes('udify.app') || event.origin.includes('localhost')) {
        console.log('Received message from iframe:', event.data);

        // Check if message contains conversation_id
        if (event.data && event.data.conversationId) {
          syncConversationFromIframe(event.data.conversationId);
        }

        // Check if iframe is ready
        if (event.data && event.data.type === 'dify-chatbot-iframe-ready') {
          console.log('Iframe is ready, sending conversation_id:', currentConversationId);
          // Send conversation_id to iframe
          const iframe = document.querySelector('iframe');
          if (iframe && iframe.contentWindow && currentConversationId) {
            iframe.contentWindow.postMessage({
              type: 'SET_CONVERSATION_ID',
              conversationId: currentConversationId
            }, '*');
          }
        }

        // Check if message is FIRST_MESSAGE_SENT
        if (event.data && event.data.type === 'FIRST_MESSAGE_SENT') {
          handleFirstMessageSent();
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [selectedChatflow, currentConversationId]);

  const handleFirstMessageSent = async () => {
    if (!selectedChatflow) return;

    console.log('First message sent - conversation tracking handled by sync');

    // Conversation ID will be synced from iframe messages
    // No need to manually update sessions anymore
  };

  const checkUser = async () => {
    try {
      console.log('Checking user authentication...');

      // Kiểm tra Supabase session (cho Admin)
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Supabase session check:', { session: !!session, error });

      if (session && !error) {
        console.log('Admin session found:', session.user);
        console.log('Admin user ID:', session.user.id, 'Type:', typeof session.user.id);
        setUser(session.user);
        setLoading(false);
        return;
      }

      // Kiểm tra localStorage session (cho User/Manager)
      const localSession = localStorage.getItem('user_session');
      console.log('Local session check:', !!localSession);

      if (localSession) {
        const sessionData = JSON.parse(localSession);
        console.log('Local session data:', sessionData);
        console.log('Local user ID:', sessionData.user?.id, 'Type:', typeof sessionData.user?.id);

        // Kiểm tra session expiry (24 giờ)
        const loginTime = new Date(sessionData.login_time);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          console.log('Session expired, clearing...');
          localStorage.removeItem('user_session');
          router.push('/login');
          return;
        }

        setUser(sessionData.user);
        setLoading(false);

        return;
      }

      // Không có session hợp lệ
      console.log('No valid session found, redirecting to login');
      router.push('/login');
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/login');
    }
    setLoading(false);
  };

  const fetchChatflows = async () => {
    try {
      // Kiểm tra Supabase session (cho Admin)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Admin: fetch tất cả chatflows
        const response = await fetch('http://localhost:8001/api/v1/chatflows/');
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched chatflows for admin:', data);
          // Lọc chỉ những chatflow được bật
          const enabledChatflows = data.filter(chatflow => chatflow.is_enabled);
          setChatflows(enabledChatflows);
        } else {
          console.error('Failed to fetch chatflows for admin:', response.status);
        }
        return;
      }

      // Kiểm tra localStorage session (cho User/Manager)
      const localSession = localStorage.getItem('user_session');
      if (localSession) {
        const sessionData = JSON.parse(localSession);
        const userId = sessionData.user.id;
        const departmentId = sessionData.department_id;

        // Nếu có departmentId, fetch chatflows theo department của user
        // Nếu không có departmentId, fetch tất cả chatflows
        const endpoint = departmentId
          ? `http://localhost:8001/api/v1/chatflows/user/${userId}`
          : 'http://localhost:8001/api/v1/chatflows/';

        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched chatflows for user:', data);
          setChatflows(data);
        } else {
          console.error('Failed to fetch chatflows for user:', response.status);
        }
        return;
      }

      // Không có session
      console.error('No authentication session found');
    } catch (error) {
      console.error('Error fetching chatflows:', error);
    }
  };

  const loadUserSession = async (userId, chatflowId) => {
    try {
      // Since we moved to user-chat table, this function is no longer needed
      // Return null to indicate no session found
      console.log('loadUserSession: Function deprecated, using user-chat table instead');
      return null;
    } catch (error) {
      console.error('Error in deprecated loadUserSession:', error);
      return null;
    }
  };

  const initializeUserSession = async (userId, chatflowId, conversationId = null) => {
    try {
      // Since we moved to user-chat table, session initialization is handled differently
      // This function is now deprecated
      console.log('initializeUserSession: Function deprecated, using user-chat table instead');
      return null;
    } catch (error) {
      console.error('Error in deprecated initializeUserSession:', error);
      return null;
    }
  };

  const handleSelectChatflow = async (chatflow) => {
    setSelectedChatflow(chatflow);

    // Lấy thông tin user
    const localSession = localStorage.getItem('user_session');
    if (localSession) {
      const sessionData = JSON.parse(localSession);
      const userId = sessionData.user.id;

      // Since we moved to user-chat table, session creation is handled by sync
      // Just set the conversation ID if available
      console.log(`User ${userId} selecting chatflow ${chatflow.id}`);
      setCurrentConversationId(null); // Will be set by iframe or manual input
    }

    // Log activity khi user chọn chatflow
    try {
      if (localSession) {
        const sessionData = JSON.parse(localSession);
        await fetch('http://localhost:8001/api/v1/users/activity/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: sessionData.user.id,
            chatflow_id: chatflow.id,
            online: null
          })
        });
        console.log(`Activity logged: User ${sessionData.user.username} accessed chatflow ${chatflow.name}`);
      }
    } catch (error) {
      console.error('Failed to log chatflow activity:', error);
    }
  };

  const updateConversationId = async (newConversationId) => {
    if (!selectedChatflow) return;

    setCurrentConversationId(newConversationId);

    // Tải lịch sử chat cho conversation mới
    await loadChatHistory(newConversationId);

    console.log('Conversation ID updated:', newConversationId);
  };

  const resetConversation = async () => {
    if (!selectedChatflow) return;

    const newConversationId = `conv_${Date.now()}`;
    setCurrentConversationId(newConversationId);
    setChatHistory([]); // Xóa lịch sử chat cũ
    console.log('Conversation reset:', newConversationId);
  };

  const loadChatHistory = async (conversationId) => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/chat-history/conversation/${conversationId}`);
      if (response.ok) {
        const history = await response.json();
        setChatHistory(history);
        console.log('Chat history loaded:', history.length, 'messages');
      } else {
        console.error('Failed to load chat history');
        setChatHistory([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory([]);
    }
  };

  const syncConversationFromIframe = async (detectedConversationId) => {
    if (!selectedChatflow || !detectedConversationId) return;

    // Chỉ cập nhật nếu conversation_id khác với hiện tại
    if (detectedConversationId !== currentConversationId) {
      console.log('Syncing conversation ID from iframe:', detectedConversationId);
      setCurrentConversationId(detectedConversationId);

      // Tải lịch sử chat cho conversation mới
      await loadChatHistory(detectedConversationId);
    }
  };

  const loadUserChatHistory = async (userId) => {
    try {
      console.log('=== STARTING loadUserChatHistory for userId:', userId, 'Type:', typeof userId);

      // Convert userId to number if it's a string
      const numericUserId = typeof userId === 'string' ? parseInt(userId) : userId;
      console.log('Using numeric userId:', numericUserId);

      setLoadingHistory(true);

      // Test basic connectivity first
      console.log('Testing basic API connectivity...');
      try {
        const testResponse = await fetch('http://localhost:8001/');
        console.log('Basic API test status:', testResponse.status);
      } catch (testError) {
        console.error('Basic API test failed:', testError);
      }

      // Sử dụng endpoint user-chat thay vì user-chat-sessions
      const apiUrl = `http://localhost:8001/api/v1/user-chat/user/${numericUserId}`;
      console.log('Calling API:', apiUrl);

      const response = await fetch(apiUrl);
      console.log('User-chat API response status:', response.status);

      if (response.ok) {
        const userChatRecords = await response.json();
        console.log('User-chat records received:', userChatRecords);

        // Transform user-chat data để phù hợp với UserChatHistory component
        const transformedData = [];

        for (const record of userChatRecords) {
          console.log('Processing record:', record);

          // Lấy thông tin user từ email
          const userResponse = await fetch('http://localhost:8001/api/v1/users/');
          let userInfo = null;

          if (userResponse.ok) {
            const usersData = await userResponse.json();
            const users = usersData.users || [];
            userInfo = users.find(u => u.id === record.user_id);
            console.log('Found user info:', userInfo);
          } else {
            console.error('Users API failed:', userResponse.status);
          }

          // Lấy chat history cho conversation này
          const chatResponse = await fetch(`http://localhost:8001/api/v1/chat-history/conversation/${record.conversation_id}`);
          console.log('Chat history API response status for', record.conversation_id, ':', chatResponse.status);

          let messages = [];

          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            console.log('Chat data received:', chatData);

            // Transform từng record thành messages
            chatData.forEach(msg => {
              console.log('Processing message:', msg);

              // Tạo message cho input (user)
              if (msg.input_text) {
                const userMessage = {
                  id: `input_${msg.log_id}`,
                  role: 'user',
                  content: msg.input_text,
                  created_at: msg.created_at,
                  conversation_id: record.conversation_id,
                  chatflow_name: record.name_app,
                  chatflow_id: record.app_id,
                  user_name: userInfo ? userInfo.full_name : 'Unknown User',
                  user_email: record.email
                };
                messages.push(userMessage);
                console.log('Created user message:', userMessage);
              }

              // Tạo message cho output (assistant)
              if (msg.output_text) {
                const botMessage = {
                  id: `output_${msg.log_id}`,
                  role: 'assistant',
                  content: msg.output_text,
                  created_at: msg.created_at,
                  conversation_id: record.conversation_id,
                  chatflow_name: record.name_app,
                  chatflow_id: record.app_id,
                  user_name: userInfo ? userInfo.full_name : 'Unknown User',
                  user_email: record.email
                };
                messages.push(botMessage);
                console.log('Created bot message:', botMessage);
              }
            });
          } else {
            console.error('Chat history API failed for', record.conversation_id, ':', chatResponse.status);
          }

          // Group messages by conversation
          if (messages.length > 0) {
            // Sort messages by time
            messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            transformedData.push(...messages);
            console.log('Added messages to transformed data:', messages.length);
          }
        }

        console.log('Final transformed data:', transformedData);
        setUserChatHistory(transformedData);
      } else {
        console.error('Failed to load user chat history - status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setUserChatHistory([]);
      }
    } catch (error) {
      console.error('Error loading user chat history:', error);
      setUserChatHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Lấy thông tin user từ session để log activity
      const localSession = localStorage.getItem('user_session');
      if (localSession) {
        const sessionData = JSON.parse(localSession);

        // Log activity khi đăng xuất
        try {
          await fetch(`http://localhost:8001/api/v1/users/auth/logout/${sessionData.user.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          console.log('Logout activity logged');
        } catch (error) {
          console.error('Failed to log logout activity:', error);
        }
      }

      // Reset dashboard state trước khi logout
      setSelectedChatflow(null);
      setCurrentConversationId(null);
      setChatHistory([]);
      setUserSessions([]);
      setShowConversationControls(false);
      setManualConversationId('');

      // Clear iframe messages để tránh conflict với user mới
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'CLEAR_CONVERSATION'
        }, '*');
      }

      // Đăng xuất Supabase session (cho Admin)
      await supabase.auth.signOut();

      // Xóa localStorage session (cho User/Manager)
      localStorage.removeItem('user_session');

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn chuyển hướng về login ngay cả khi có lỗi
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout
      user={user}
      chatflows={chatflows}
      selectedChatflow={selectedChatflow}
      onSelectChatflow={handleSelectChatflow}
      onLogout={handleLogout}
      onPasswordChange={() => setShowPasswordModal(true)}
      userChatHistory={userChatHistory}
      loadingHistory={loadingHistory}
      onRefreshHistory={() => user && loadUserChatHistory(user.id)}
    >
      <DashboardContent 
        selectedChatflow={selectedChatflow}
        currentConversationId={currentConversationId}
        user={user}
        sidebarWidth={sidebarWidth}
        onSidebarWidthChange={setSidebarWidth}
      />
    </DashboardLayout>
  );
}
