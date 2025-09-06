'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [currentConversationId, setCurrentConversationId] = useState('ac58bfe4-fc1a-4b27-8607-1ab314972766');
  const [iframeKey, setIframeKey] = useState(0);
  const [chatflow, setChatflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localStorageData, setLocalStorageData] = useState({});

  // Conversation IDs for testing
  const conversationIds = [
    'ac58bfe4-fc1a-4b27-8607-1ab314972766',
    'e13e4262-f720-43d8-8d8e-7c28ef2981bf'
  ];

  useEffect(() => {
    fetchChatflow();
    loadLocalStorageData();

    // Add message listener for iframe communication
    const handleMessage = (event) => {
      console.log('📨 Received message from iframe:', event.data);

      // Log any messages that might contain conversation info
      if (event.data && typeof event.data === 'object') {
        if (event.data.conversation_id || event.data.conversationId) {
          console.log('🎯 Conversation ID in message:', event.data.conversation_id || event.data.conversationId);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const fetchChatflow = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/chatflows/1');
      if (response.ok) {
        const data = await response.json();
        setChatflow(data);
      } else {
        console.error('Failed to fetch chatflow');
        // Fallback: use sample embed URL
        setChatflow({
          id: 1,
          name: 'Test Chatbot',
          embed_url: 'https://udify.app/chatbot/051zePBdBET2RKsv'
        });
      }
    } catch (error) {
      console.error('Error fetching chatflow:', error);
      // Fallback
      setChatflow({
        id: 1,
        name: 'Test Chatbot',
        embed_url: 'https://udify.app/chatbot/051zePBdBET2RKsv'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLocalStorageData = () => {
    try {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      setLocalStorageData(data);
    } catch (error) {
      console.error('Error loading localStorage:', error);
    }
  };

  const clearLocalStorage = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả localStorage?')) {
      localStorage.clear();
      setLocalStorageData({});
      alert('Đã xóa tất cả localStorage');
    }
  };

  const removeLocalStorageItem = (key) => {
    if (confirm(`Xóa item "${key}" khỏi localStorage?`)) {
      localStorage.removeItem(key);
      loadLocalStorageData();
      alert(`Đã xóa "${key}" khỏi localStorage`);
    }
  };

  const addLocalStorageItem = () => {
    const key = prompt('Nhập key:');
    if (!key) return;

    const value = prompt('Nhập value:');
    if (value === null) return;

    localStorage.setItem(key, value);
    loadLocalStorageData();
    alert(`Đã thêm "${key}" = "${value}" vào localStorage`);
  };

  const handleConversationChange = (conversationId) => {
    console.log('🔄 Changing conversation to:', conversationId);
    console.log('📊 Previous conversation:', currentConversationId);

    setCurrentConversationId(conversationId);
    setIframeKey(prev => prev + 1); // Force iframe reload

    // Clear any cached conversation data
    localStorage.removeItem('dify_conversation_id');
    localStorage.removeItem('dify_chat_history');
    localStorage.removeItem('conversation_id');

    // Update parent localStorage for debugging
    localStorage.setItem('parent_conversation_id', conversationId);
    loadLocalStorageData();

    // Try multiple approaches for Dify conversation switching
    setTimeout(() => {
      const iframe = document.querySelector('iframe');
      if (iframe && iframe.contentWindow) {
        console.log('📤 Sending postMessage to iframe with conversation:', conversationId);

        // Method 1: Clear iframe localStorage first
        try {
          iframe.contentWindow.localStorage.clear();
          console.log('🧹 Cleared iframe localStorage');
        } catch (e) {
          console.log('❌ Cannot clear iframe localStorage:', e);
        }

        // Method 2: Try postMessage with different formats
        iframe.contentWindow.postMessage({
          type: 'SET_CONVERSATION_ID',
          conversationId: conversationId
        }, '*');

        iframe.contentWindow.postMessage({
          type: 'conversation_change',
          conversation_id: conversationId
        }, '*');

        iframe.contentWindow.postMessage({
          action: 'switch_conversation',
          conversationId: conversationId
        }, '*');

        // Method 3: Try setting localStorage in iframe context
        try {
          iframe.contentWindow.localStorage.setItem('conversation_id', conversationId);
          iframe.contentWindow.localStorage.setItem('dify_conversation_id', conversationId);
          iframe.contentWindow.localStorage.setItem('app_id', '051zePBdBET2RKsv');
          console.log('✅ Set localStorage in iframe context');
        } catch (e) {
          console.log('❌ Cannot access iframe localStorage:', e);
        }

        // Method 4: Try dispatching custom event
        iframe.contentWindow.postMessage({
          type: 'dify-chatbot-conversation-change',
          conversationId: conversationId
        }, '*');

        // Method 5: Force reload iframe with new URL and timestamp
        setTimeout(() => {
          const newSrc = `${chatflow.embed_url}?conversationId=${conversationId}&t=${Date.now()}`;
          console.log('🔄 Reloading iframe with new conversation URL:', newSrc);
          iframe.src = newSrc;
        }, 500);
      }
    }, 1000);
  };

  const testSync = () => {
    // Test đồng bộ hóa giữa web và dify
    console.log('Testing sync with conversation:', currentConversationId);

    // Gửi request để test đồng bộ hóa
    fetch('http://localhost:8001/api/v1/chat-history/conversation/' + currentConversationId)
      .then(response => response.json())
      .then(data => {
        console.log('Sync test result:', data);
        const messageCount = Array.isArray(data) ? data.length : (data.messages ? data.messages.length : 0);
        alert(`Đồng bộ hóa thành công! Tìm thấy ${messageCount} tin nhắn trong conversation ${currentConversationId}`);
      })
      .catch(error => {
        console.error('Sync test failed:', error);
        alert('Lỗi khi test đồng bộ hóa: ' + error.message);
      });
  };

  const checkCurrentConversation = () => {
    console.log('Checking current conversation data...');
    alert(`Conversation ID hiện tại: ${currentConversationId}\n\nĐể kiểm tra data, sử dụng nút "Test Đồng Bộ Hóa" hoặc kiểm tra Network tab trong DevTools để xem API calls từ Dify.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl">Đang tải chatbot...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Trang Test Chatbot ID 1
          </h1>
          <p className="text-gray-600">
            Test đồng bộ hóa giữa web và Dify với các conversation IDs
          </p>
        </div>

        {/* LocalStorage Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">LocalStorage Manager</h2>
            <div className="flex gap-2">
              <button
                onClick={loadLocalStorageData}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={addLocalStorageItem}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
              >
                Add Item
              </button>
              <button
                onClick={clearLocalStorage}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <p className="text-sm font-medium text-gray-700 mb-3">
              LocalStorage Items ({Object.keys(localStorageData).length}):
            </p>

            {Object.keys(localStorageData).length === 0 ? (
              <p className="text-sm text-gray-500 italic">No localStorage items found</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(localStorageData).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{key}</div>
                      <div className="text-xs text-gray-600 truncate max-w-md" title={value}>
                        {value}
                      </div>
                    </div>
                    <button
                      onClick={() => removeLocalStorageItem(key)}
                      className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 transition-colors"
                      title="Remove this item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Điều khiển Test</h2>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-600">Embed URL: {chatflow?.embed_url}</p>
            <p className="text-xs text-gray-600">Current Conversation: {currentConversationId}</p>
            <p className="text-xs text-gray-600">Full iframe src: {chatflow?.embed_url ? `${chatflow.embed_url}?conversationId=${currentConversationId}` : 'N/A'}</p>
            <p className="text-xs text-gray-600">Iframe Key: {iframeKey}</p>
            <div className="mt-2">
              <button
                onClick={() => {
                  const iframe = document.querySelector('iframe');
                  if (iframe) {
                    console.log('🔍 Current iframe src:', iframe.src);
                    console.log('🔍 Expected src:', `${chatflow?.embed_url}?conversationId=${currentConversationId}`);
                    alert(`Iframe src: ${iframe.src}\nExpected: ${chatflow?.embed_url}?conversationId=${currentConversationId}`);
                  }
                }}
                className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors"
              >
                Check Iframe Src
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            {conversationIds.map((convId, index) => (
              <button
                key={convId}
                onClick={() => handleConversationChange(convId)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentConversationId === convId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Conversation {index + 1}: {convId.substring(0, 8)}...
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              onClick={testSync}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Đồng Bộ Hóa
            </button>

            <button
              onClick={() => {
                // Try setting conversation_id in parent window localStorage
                localStorage.setItem('dify_conversation_id', currentConversationId);
                loadLocalStorageData(); // Refresh localStorage display
                alert(`Đã set conversation_id: ${currentConversationId} trong localStorage`);
              }}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Set LocalStorage
            </button>

            <button
              onClick={() => {
                if (chatflow?.embed_url) {
                  window.open(`${chatflow.embed_url}?conversationId=${currentConversationId}`, '_blank');
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mở trong Tab Mới
            </button>

            <button
              onClick={() => {
                // Generate a new UUID for conversation
                const newConvId = crypto.randomUUID();
                console.log('Generated new conversation ID:', newConvId);
                setCurrentConversationId(newConvId);
                setIframeKey(prev => prev + 1);
                alert(`✅ Tạo conversation ID mới: ${newConvId}`);
              }}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tạo Conversation ID Mới
            </button>

            <button
              onClick={() => {
                // Monitor network requests for conversation_id
                console.log('🔍 Monitoring network requests...');
                alert('📊 Cách monitor network requests:\n\n1. Mở DevTools (F12)\n2. Chọn tab "Network"\n3. Filter: "udify.app" hoặc "messages"\n4. Chat trong iframe\n5. Tìm request có conversation_id parameter\n6. Verify conversation_id có đúng không\n\n💡 Tip: Tắt "Preserve log" để clear old requests');
              }}
              className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Monitor Network
            </button>

            <button
              onClick={() => {
                // Test direct API call to Dify
                const testUrl = `https://udify.app/api/messages?conversation_id=${currentConversationId}&limit=20&last_id=`;
                console.log('🔍 Testing direct API call:', testUrl);
                console.log('⚠️ Note: This will likely return 401 Unauthorized because direct API calls need authentication');
                
                fetch(testUrl, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                })
                .then(response => {
                  console.log('API Response status:', response.status);
                  if (response.status === 401) {
                    console.log('🚫 401 Unauthorized - This is expected for direct API calls without authentication');
                    alert('🚫 401 Unauthorized\n\nĐây là điều bình thường! Direct API calls cần authentication.\n\nThay vào đó, hãy:\n1. Mở DevTools → Network\n2. Filter "messages"\n3. Chat trong iframe để xem API calls từ Dify');
                    return;
                  }
                  return response.json();
                })
                .then(data => {
                  if (data) {
                    console.log('API Response data:', data);
                    alert(`API Response:\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
                  }
                })
                .catch(error => {
                  console.error('API call failed:', error);
                  alert('API call failed: ' + error.message);
                });
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Test Direct API (401 Expected)
            </button>

            <button
              onClick={() => {
                // Reset everything and start fresh
                console.log('🔄 Resetting everything...');
                localStorage.clear();
                setLocalStorageData({});
                setCurrentConversationId('ac58bfe4-fc1a-4b27-8607-1ab314972766');
                setIframeKey(prev => prev + 1);
                alert('Đã reset tất cả. Conversation sẽ về mặc định.');
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reset Everything
            </button>

            <button
              onClick={() => {
                // Clear iframe localStorage
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  try {
                    iframe.contentWindow.localStorage.clear();
                    console.log('🧹 Cleared iframe localStorage');
                    alert('Đã xóa localStorage của iframe');
                  } catch (e) {
                    console.log('❌ Cannot clear iframe localStorage:', e);
                    alert('Không thể xóa localStorage của iframe');
                  }
                }
              }}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Clear Iframe LocalStorage
            </button>

            <button
              onClick={() => {
                // Check iframe localStorage
                const iframe = document.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  try {
                    const iframeLocalStorage = {};
                    for (let i = 0; i < iframe.contentWindow.localStorage.length; i++) {
                      const key = iframe.contentWindow.localStorage.key(i);
                      iframeLocalStorage[key] = iframe.contentWindow.localStorage.getItem(key);
                    }
                    console.log('📊 Iframe localStorage:', iframeLocalStorage);
                    alert(`Iframe localStorage:\n${JSON.stringify(iframeLocalStorage, null, 2)}`);
                  } catch (e) {
                    console.log('❌ Cannot access iframe localStorage:', e);
                    alert('Không thể truy cập localStorage của iframe');
                  }
                }
              }}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Check Iframe LocalStorage
            </button>

            <button
              onClick={checkCurrentConversation}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Kiểm tra Conversation Hiện tại
            </button>

            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">Current Conversation:</span>
              <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">
                {currentConversationId}
              </span>
            </div>
          </div>
        </div>

        {/* Chatbot Iframe */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Chatbot Interface</h2>
            <p className="text-sm text-gray-600">
              Chatbot ID: {chatflow?.id} | Name: {chatflow?.name} | Conversation: {currentConversationId}
            </p>
          </div>

          <div className="h-[600px]">
            {chatflow?.embed_url ? (
              <iframe
                key={iframeKey}
                src={`${chatflow.embed_url}?conversationId=${currentConversationId}`}
                className="w-full h-full border-0"
                title="Test Chatbot"
                allow="fullscreen"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                onLoad={() => {
                  console.log('Chatbot iframe loaded with conversation:', currentConversationId);
                  console.log('Iframe src:', `${chatflow.embed_url}?conversationId=${currentConversationId}`);
                }}
                onError={(e) => {
                  console.error('Iframe failed to load:', e);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="mb-4">Không thể tải chatbot. Vui lòng kiểm tra embed URL.</p>
                  <p className="text-sm">Chatflow data: {JSON.stringify(chatflow, null, 2)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Kết quả Test & Hướng dẫn Dify</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Instructions:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>• Click vào các nút Conversation để chuyển đổi giữa các cuộc hội thoại</li>
              <li>• Nhấn "Test Đồng Bộ Hóa" để kiểm tra dữ liệu được đồng bộ từ Dify</li>
              <li>• Nhấn "Mở trong Tab Mới" để test chatbot trực tiếp</li>
              <li>• Chat trong iframe và kiểm tra xem dữ liệu có được lưu và đồng bộ không</li>
              <li>• Kiểm tra console để xem log chi tiết</li>
            </ul>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-blue-700 mb-2">
                🔍 Kiểm tra URL Dify: <span className="text-green-600">✅ Có thể truy cập</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Vấn đề conversation switching:</strong> Dify iframe có thể không hỗ trợ thay đổi conversation_id động.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>1. <strong>Test trực tiếp:</strong> Nhấn "Mở trong Tab Mới" với conversation_id khác nhau</li>
                <li>2. <strong>Set LocalStorage:</strong> Dify có thể đọc conversation_id từ localStorage của parent</li>
                <li>3. <strong>Tạo ID mới:</strong> Sử dụng nút "Tạo Conversation ID Mới" để test với ID mới</li>
                <li>4. <strong>Kiểm tra Network:</strong> Xem API calls có sử dụng conversation_id mới không</li>
                <li>5. <strong>Force Reload:</strong> Sử dụng nút "Force Reload Iframe" để reload iframe hoàn toàn</li>
                <li>6. <strong>Monitor Network:</strong> Mở DevTools → Network tab → Filter by "messages" để xem API calls</li>
              </ul>

              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>💡 Gợi ý:</strong> Nếu Dify không hỗ trợ switch conversation trong iframe:
                  <br />• Mở nhiều tab với conversation_id khác nhau
                  <br />• Test đồng bộ hóa bằng cách chat trong các tab khác nhau
                  <br />• Kiểm tra data được lưu trong backend database
                  <br />• Sử dụng "Force Reload Iframe" để test với conversation mới
                </p>
              </div>

              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-800">
                  <strong>� Vấn đề đã biết:</strong>
                  <br />• Dify iframe có thể đang cache conversation_id cũ trong localStorage
                  <br />• URL parameters (?conversationId=...) có thể không được Dify tôn trọng
                  <br />• Cần clear localStorage của iframe trước khi switch conversation
                  <br />• Sử dụng "Reset Everything" để test từ đầu
                </p>
              </div>

              <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                <p className="text-xs text-orange-800">
                  <strong>🔍 Về 401 Unauthorized:</strong>
                  <br />• <strong>Direct API calls sẽ luôn bị 401</strong> vì thiếu authentication
                  <br />• <strong>Thay vào đó:</strong> Monitor network requests từ iframe
                  <br />• <strong>Cách monitor:</strong> DevTools → Network → Filter "udify.app"
                  <br />• <strong>Kiểm tra:</strong> conversation_id trong URL parameters của requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
