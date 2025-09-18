'use client';

import { useState } from 'react';
import { DollarSign, BarChart3, Receipt, CreditCard, FileText, Menu, X, ArrowLeft, History, Package, Settings, TrendingUp } from 'lucide-react';

export default function AccountingLayout({ user, activeTab, onTabChange, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Báo cáo', icon: BarChart3 },
    { id: 'revenue', label: 'Quản lý Doanh thu', icon: Receipt },
    { id: 'expenses', label: 'Quản lý Chi phí', icon: CreditCard },
    { id: 'profit', label: 'Báo cáo hoạt động kinh doanh', icon: TrendingUp },
    { id: 'products', label: 'Quản lý Sản phẩm', icon: Package },
    { id: 'categories', label: 'Quản lý Danh mục', icon: Settings },
    { id: 'generate', label: 'Tạo Báo cáo', icon: FileText },
    { id: 'history', label: 'Lịch sử Báo cáo', icon: History }
  ];

  const getTabTitle = () => {
    const tab = tabs.find(t => t.id === activeTab);
    return tab ? tab.label : 'Quản lý Tài chính';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Quản lý doanh thu</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="p-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium mb-2 flex items-center transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-56 p-4 border-t bg-gray-50">
          <button
            onClick={() => {
              window.location.href = '/dashboard';
              setSidebarOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200 flex items-center mb-2 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-4 lg:px-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 mr-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                    {getTabTitle()}
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Quản lý tài chính doanh nghiệp
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email || 'Người dùng'}
                  </p>
                  <p className="text-xs text-gray-600">Kế toán</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
