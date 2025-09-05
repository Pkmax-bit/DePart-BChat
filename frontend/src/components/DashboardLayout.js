import React from 'react';
import { LogOut, Settings, Menu, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function DashboardLayout({
  user,
  chatflows,
  selectedChatflow,
  onSelectChatflow,
  onLogout,
  onPasswordChange,
  children
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  // Kiểm tra admin từ cả Supabase session và localStorage session
  const isAdmin = user?.email === 'backen@vanphuthanh.net' ||
                  (localStorage.getItem('user_session') &&
                   JSON.parse(localStorage.getItem('user_session')).role === 'admin');

  // Hiển thị tên user (ưu tiên full_name, fallback to email)
  const displayName = user?.full_name || user?.email || 'User';

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Main Content Container */}
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
              <div>
                <h1 className="text-2xl font-display text-gray-900">
                  {selectedChatflow ? selectedChatflow.name : 'Dashboard'}
                </h1>
                {selectedChatflow?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedChatflow.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
              {/* Nút góp ý */}
             
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-button text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-label text-gray-700 hidden sm:block">
                  {displayName}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } flex-shrink-0`}>
            {/* Logo Section */}
            <div className={`p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 ${
              sidebarCollapsed ? 'px-2' : 'px-6'
            }`}>
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <h1 className="text-sm font-heading text-white truncate">Chat System</h1>
                    <p className="text-xs text-blue-100">AI Assistant</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chatflows Section */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-6">
                {!sidebarCollapsed && (
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <MessageCircle className="w-4 h-4 mr-2 text-gray-400" />
                    Chatbots ({chatflows.length})
                  </h2>
                )}
                <div className="space-y-2">
                  {chatflows.length === 0 ? (
                    !sidebarCollapsed && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageCircle className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Không có chatbot nào khả dụng</p>
                      </div>
                    )
                  ) : (
                    chatflows.map((chatflow) => (
                      <button
                        key={chatflow.id}
                        onClick={() => onSelectChatflow(chatflow)}
                        className={`w-full text-left px-3 py-3 rounded-xl text-sm font-label transition-all duration-200 group ${
                          selectedChatflow?.id === chatflow.id
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                        } ${sidebarCollapsed ? 'px-2 justify-center' : ''}`}
                        title={sidebarCollapsed ? chatflow.name : ''}
                      >
                        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                          <div className={`rounded-lg flex items-center justify-center mr-3 transition-colors flex-shrink-0 ${
                            sidebarCollapsed ? 'w-8 h-8 mr-0' : 'w-8 h-8'
                          } ${
                            selectedChatflow?.id === chatflow.id
                              ? 'bg-white bg-opacity-20'
                              : 'bg-gray-100 group-hover:bg-blue-100'
                          }`}>
                            <MessageCircle className={`w-4 h-4 ${
                              selectedChatflow?.id === chatflow.id
                                ? 'text-white'
                                : 'text-gray-600 group-hover:text-blue-600'
                            }`} />
                          </div>
                          {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                              <p className={`truncate ${
                                selectedChatflow?.id === chatflow.id ? 'text-white' : 'text-gray-900'
                              }`}>
                                {chatflow.name}
                              </p>
                              {chatflow.description && (
                                <p className={`text-xs truncate mt-1 ${
                                  selectedChatflow?.id === chatflow.id
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}>
                                  {chatflow.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* User Section & Admin */}
            <div className={`border-t border-gray-200 p-4 ${sidebarCollapsed ? 'px-2' : ''}`}>
              {/* User Info */}
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-label text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs font-body text-gray-500">
                      {isAdmin ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Section */}
              {isAdmin && !sidebarCollapsed && (
                <div className="mb-4">
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="w-full flex items-center px-4 py-3 text-sm font-label text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-600" />
                    Quản lý hệ thống
                    <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Password Change Button */}
              <div className="mb-4">
                <button
                  onClick={onPasswordChange}
                  className={`w-full flex items-center px-4 py-3 text-sm font-label text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group ${
                    sidebarCollapsed ? 'px-2 justify-center' : ''
                  }`}
                  title={sidebarCollapsed ? 'Đổi mật khẩu' : ''}
                >
                  <svg className={`w-4 h-4 text-gray-500 group-hover:text-blue-600 ${
                    sidebarCollapsed ? '' : 'mr-3'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {!sidebarCollapsed && 'Đổi mật khẩu'}
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className={`w-full flex items-center px-4 py-3 text-sm font-button text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg ${
                  sidebarCollapsed ? 'px-2 justify-center' : ''
                }`}
                title={sidebarCollapsed ? 'Đăng xuất' : ''}
              >
                <LogOut className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && 'Đăng xuất'}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-hidden bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
