'use client';

import React, { useState, useEffect } from 'react';

export default function ChatHistoryDemo() {
  const [userChatHistory, setUserChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      console.log('Loading chat history...');

      // Test user-chat API
      const response = await fetch('http://localhost:8001/api/v1/user-chat/user/8');
      if (response.ok) {
        const userChatRecords = await response.json();
        console.log('User chat records:', userChatRecords);

        // Transform data
        const transformedData = [];

        for (const record of userChatRecords) {
          // Get chat history for this conversation
          const chatResponse = await fetch(`http://localhost:8001/api/v1/chat-history/conversation/${record.conversation_id}`);

          if (chatResponse.ok) {
            const chatData = await chatResponse.json();
            console.log(`Chat data for ${record.conversation_id}:`, chatData);

            // Transform messages
            chatData.forEach(msg => {
              // User message
              if (msg.input_text) {
                transformedData.push({
                  id: `input_${msg.log_id}`,
                  role: 'user',
                  content: msg.input_text,
                  created_at: msg.created_at,
                  conversation_id: record.conversation_id,
                  chatflow_name: record.name_app,
                  user_email: record.email
                });
              }

              // Bot message
              if (msg.output_text) {
                transformedData.push({
                  id: `output_${msg.log_id}`,
                  role: 'assistant',
                  content: msg.output_text,
                  created_at: msg.created_at,
                  conversation_id: record.conversation_id,
                  chatflow_name: record.name_app,
                  user_email: record.email
                });
              }
            });
          }
        }

        console.log('Transformed data:', transformedData);
        setUserChatHistory(transformedData);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group by conversation
  const groupedHistory = userChatHistory.reduce((acc, message) => {
    const convId = message.conversation_id;
    if (!acc[convId]) {
      acc[convId] = {
        conversation_id: convId,
        chatflow_name: message.chatflow_name || 'Unknown Chatbot',
        messages: [],
        created_at: message.created_at
      };
    }
    acc[convId].messages.push(message);
    return acc;
  }, {});

  const conversations = Object.values(groupedHistory);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải lịch sử chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Demo Lịch Sử Chat</h1>

        {!selectedConversation ? (
          // List View
          <div>
            <h2 className="text-xl font-semibold mb-4">Danh sách cuộc trò chuyện ({conversations.length})</h2>
            <div className="grid gap-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.conversation_id}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{conversation.chatflow_name}</h3>
                      <p className="text-sm text-gray-600">
                        {conversation.messages.length} tin nhắn • {new Date(conversation.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded">
                      {conversation.conversation_id.substring(0, 12)}...
                    </div>
                  </div>

                  {/* Preview messages */}
                  <div className="space-y-2">
                    {conversation.messages.slice(0, 3).map((message, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {message.role === 'user' ? (
                            <span className="text-xs text-blue-600 font-semibold">U</span>
                          ) : (
                            <span className="text-xs text-green-600 font-semibold">B</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">
                            {message.content.length > 100
                              ? `${message.content.substring(0, 100)}...`
                              : message.content
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Click để xem chi tiết →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Detail View
          <div>
            <button
              onClick={() => setSelectedConversation(null)}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              ← Quay lại danh sách
            </button>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedConversation.chatflow_name}</h2>
                <p className="text-gray-600 mt-2">
                  Conversation ID: {selectedConversation.conversation_id}
                </p>
                <p className="text-gray-600">
                  {selectedConversation.messages.length} tin nhắn • {new Date(selectedConversation.created_at).toLocaleString('vi-VN')}
                </p>
              </div>

              <div className="space-y-6">
                {selectedConversation.messages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      <span className="text-white font-semibold">
                        {message.role === 'user' ? 'U' : 'B'}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`font-semibold ${
                          message.role === 'user' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {message.role === 'user' ? 'Bạn' : 'Chatbot'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      <div className={`rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'bg-gray-50 border-l-4 border-green-500'
                      }`}>
                        <p className="text-gray-800 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
