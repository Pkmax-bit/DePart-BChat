import React, { useState } from 'react';

const UserChatHistory = ({ userChatHistory, loading, onRefresh }) => {
  const [selectedChatflow, setSelectedChatflow] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải lịch sử chat...</p>
        </div>
      </div>
    );
  }

  if (!userChatHistory || userChatHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Chưa có lịch sử chat
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Bạn chưa có cuộc trò chuyện nào. Hãy bắt đầu chat với một chatbot!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group chat history by conversation
  const groupedHistory = userChatHistory.reduce((acc, message) => {
    const convId = message.conversation_id;
    if (!acc[convId]) {
      acc[convId] = {
        conversation_id: convId,
        chatflow_name: message.chatflow_name || 'Unknown Chatbot',
        chatflow_id: message.chatflow_id,
        messages: [],
        created_at: message.created_at
      };
    }
    acc[convId].messages.push(message);
    return acc;
  }, {});

  // Get unique chatflows for filter
  const chatflows = [...new Set(Object.values(groupedHistory).map(conv => conv.chatflow_name))];
  
  // Filter conversations based on selected chatflow
  const filteredConversations = selectedChatflow === 'all' 
    ? Object.values(groupedHistory)
    : Object.values(groupedHistory).filter(conv => conv.chatflow_name === selectedChatflow);

  const conversations = filteredConversations;

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setViewMode('list');
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {viewMode === 'detail' && (
                <button
                  onClick={handleBackToList}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại danh sách
                </button>
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {viewMode === 'detail' ? 'Chi tiết cuộc trò chuyện' : 'Lịch sử chat'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {viewMode === 'list' && (
                <span className="text-sm text-gray-500">
                  {conversations.length} cuộc trò chuyện
                </span>
              )}
              <button
                onClick={onRefresh}
                className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section - Only show in list mode */}
        {viewMode === 'list' && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Lọc theo Chatbot</h3>
            </div>
            
            <select
              value={selectedChatflow}
              onChange={(e) => setSelectedChatflow(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả chatbot ({conversations.length})</option>
              {chatflows.map((chatflowName) => {
                const count = filteredConversations.filter(conv => conv.chatflow_name === chatflowName).length;
                return (
                  <option key={chatflowName} value={chatflowName}>
                    {chatflowName} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'detail' && selectedConversation ? (
            /* Detail View */
            <div className="p-6">
              {/* Conversation Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedConversation.chatflow_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedConversation.messages.length} tin nhắn • {selectedConversation.created_at ? new Date(selectedConversation.created_at).toLocaleString('vi-VN') : 'Unknown date'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded">
                    {selectedConversation.conversation_id ? selectedConversation.conversation_id.substring(0, 12) : 'Unknown'}...
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-6">
                {selectedConversation.messages.map((message, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      (message.role || 'user') === 'user' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {(message.role || 'user') === 'user' ? (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`text-sm font-semibold ${
                          (message.role || 'user') === 'user' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {(message.role || 'user') === 'user' ? 'Bạn' : 'Chatbot'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {message.created_at 
                            ? new Date(message.created_at).toLocaleString('vi-VN')
                            : 'Unknown time'
                          }
                        </span>
                      </div>
                      
                      <div className={`rounded-lg p-4 ${
                        (message.role || 'user') === 'user' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                          {message.content && typeof message.content === 'string'
                            ? message.content
                            : 'No content available'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="p-4">
              <div className="space-y-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">
                      {selectedChatflow === 'all' 
                        ? 'Chưa có lịch sử chat nào' 
                        : `Không có lịch sử chat cho ${selectedChatflow}`
                      }
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div 
                      key={conversation.conversation_id} 
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{conversation.chatflow_name}</h3>
                            <p className="text-sm text-gray-500">
                              {conversation.messages.length} tin nhắn • {conversation.created_at ? new Date(conversation.created_at).toLocaleString('vi-VN') : 'Unknown date'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {conversation.conversation_id ? conversation.conversation_id.substring(0, 8) : 'Unknown'}...
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {conversation.messages.slice(0, 5).map((message, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                (message.role || 'user') === 'user' ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                {(message.role || 'user') === 'user' ? (
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs font-medium ${
                                    (message.role || 'user') === 'user' ? 'text-blue-600' : 'text-green-600'
                                  }`}>
                                    {(message.role || 'user') === 'user' ? 'Bạn' : 'Chatbot'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {message.created_at 
                                      ? new Date(message.created_at).toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })
                                      : 'Unknown time'
                                    }
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mt-1 break-words">
                                  {message.content && typeof message.content === 'string'
                                    ? message.content.length > 100 
                                      ? `${message.content.substring(0, 100)}...` 
                                      : message.content
                                    : 'No content available'
                                  }
                                </p>
                              </div>
                            </div>
                          ))}
                          {conversation.messages.length > 5 && (
                            <div className="text-center text-xs text-gray-500 py-2">
                              Và {conversation.messages.length - 5} tin nhắn khác...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserChatHistory;
