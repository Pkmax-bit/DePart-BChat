'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Edit, Trash2, TrendingDown, DollarSign, Receipt, CreditCard, FileText, Info, Calendar, BarChart3, History, Settings, RotateCcw, Save, RefreshCw, Download, Users, Wrench, Eye, EyeOff, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const supabase = createClientComponentClient();

function ExpensesLayout({ user, activeTab, onTabChange, children }) {
  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { id: 'expenses', label: 'Chi phí', icon: Receipt },
    { id: 'categories', label: 'Loại chi phí', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Chi phí</h1>
              <p className="text-gray-600 mt-1">Quản lý và theo dõi các khoản chi phí</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Xin chào</p>
                <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-3 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

function ExpensesOverviewTab({ expenses, expenseCategories, selectedMonth }) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.so_tien || 0), 0);
  const expenseCount = expenses.length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Receipt className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Số khoản chi phí</p>
              <p className="text-2xl font-bold text-gray-900">{expenseCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trung bình/khoản</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenseCount > 0 ? (totalExpenses / expenseCount).toLocaleString('vi-VN') : 0} VND
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loại chi phí</p>
              <p className="text-2xl font-bold text-gray-900">{expenseCategories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense by Category */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi phí theo loại</h3>
        <div className="space-y-4">
          {Object.entries(
            expenses.reduce((acc, expense) => {
              const categoryName = expense.loaichiphi?.ten_loai || 'Chưa phân loại';
              const expenseType = 'Chi phí'; // Simplified since loai_phi is not available
              const key = `${categoryName} (${expenseType})`;
              acc[key] = (acc[key] || 0) + (expense.so_tien || 0);
              return acc;
            }, {})
          ).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Receipt className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-medium text-gray-900">{category}</span>
              </div>
              <span className="font-bold text-red-600">{amount.toLocaleString('vi-VN')} VND</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ chi phí theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[{ month: selectedMonth, expenses: totalExpenses }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [value.toLocaleString('vi-VN'), 'Chi phí']} />
            <Bar dataKey="expenses" fill="#EF4444" name="Chi phí" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ExpensesManagementTab({ expenses, expenseCategories, selectedMonth, onExpenseUpdate }) {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    id_loai_chiphi: '',
    ten_chi_phi: '',
    so_tien: '',
    mo_ta: '',
    hinh_chung_minh: '',
    ngay_chi_phi: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const url = editingExpense
        ? `http://localhost:8001/api/v1/quanly_chiphi/${editingExpense.id}`
        : 'http://localhost:8001/api/v1/quanly_chiphi/';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseForm)
      });

      if (response.ok) {
        setSuccess(true);
        setExpenseForm({
          id_loai_chiphi: '',
          ten_chi_phi: '',
          so_tien: '',
          mo_ta: '',
          hinh_chung_minh: '',
          ngay_chi_phi: new Date().toISOString().split('T')[0]
        });
        setEditingExpense(null);
        onExpenseUpdate();

        // Đóng modal sau 2 giây
        setTimeout(() => {
          setShowExpenseForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Có lỗi xảy ra khi lưu chi phí');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Có lỗi xảy ra khi lưu chi phí. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi phí này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/quanly_chiphi/${expenseId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSuccess(true);
        setError('');
        onExpenseUpdate();

        // Ẩn thông báo sau 2 giây
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError('Có lỗi xảy ra khi xóa chi phí');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Có lỗi xảy ra khi xóa chi phí');
    }
  };

  const editExpense = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      id_loai_chiphi: expense.id_loai_chiphi,
      ten_chi_phi: expense.ten_chi_phi,
      so_tien: expense.so_tien || '',
      mo_ta: expense.mo_ta || '',
      hinh_chung_minh: expense.hinh_chung_minh || '',
      ngay_chi_phi: expense.ngay_chi_phi
    });
    setError('');
    setSuccess(false);
    setShowExpenseForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách chi phí tháng {selectedMonth}</h2>
          <p className="text-gray-600 mt-1">Quản lý chi phí theo tháng</p>
        </div>
        <button
          onClick={() => {
            setShowExpenseForm(true);
            setEditingExpense(null);
            setExpenseForm({
              id_loai_chiphi: '',
              ten_chi_phi: '',
              so_tien: '',
              mo_ta: '',
              hinh_chung_minh: '',
              ngay_chi_phi: new Date().toISOString().split('T')[0]
            });
            setError('');
            setSuccess(false);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chi phí</span>
        </button>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingExpense ? 'Chỉnh sửa chi phí' : 'Thêm chi phí mới'}
                  </h3>
                  <p className="text-red-700 mt-1">Thêm khoản chi phí cho doanh nghiệp của bạn</p>
                </div>
              </div>
              <button
                onClick={() => setShowExpenseForm(false)}
                className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
                title="Đóng"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium">
                  {editingExpense ? 'Cập nhật chi phí thành công!' : 'Thêm chi phí thành công!'}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Field */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-blue-600">🏷️</span>
                    </span>
                    Loại chi phí
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={expenseForm.id_loai_chiphi}
                      onChange={(e) => setExpenseForm({...expenseForm, id_loai_chiphi: e.target.value})}
                      className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 appearance-none"
                      required
                    >
                      <option value="">Chọn loại chi phí</option>
                      {expenseCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.ten_loai}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 text-gray-400">
                      <Settings className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs">💡</span>
                    </span>
                    Chọn loại chi phí phù hợp để phân loại khoản chi
                  </p>
                </div>

                {/* Name Field */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-purple-600">📝</span>
                    </span>
                    Tên chi phí
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={expenseForm.ten_chi_phi}
                      onChange={(e) => setExpenseForm({...expenseForm, ten_chi_phi: e.target.value})}
                      className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                      placeholder="Ví dụ: Mua văn phòng phẩm, Thanh toán tiền điện..."
                      required
                    />
                    <div className="absolute right-4 top-4 text-gray-400">
                      <Receipt className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs">💡</span>
                    </span>
                    Nhập tên chi phí rõ ràng và dễ hiểu
                  </p>
                </div>

                {/* Amount Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-green-600">💰</span>
                    </span>
                    Số tiền (VND)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={expenseForm.so_tien}
                      onChange={(e) => setExpenseForm({...expenseForm, so_tien: e.target.value})}
                      className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute right-4 top-4 text-gray-400">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs">💡</span>
                    </span>
                    Nhập số tiền chính xác
                  </p>
                </div>

                {/* Date Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-orange-600">📅</span>
                    </span>
                    Ngày chi phí
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={expenseForm.ngay_chi_phi}
                      onChange={(e) => setExpenseForm({...expenseForm, ngay_chi_phi: e.target.value})}
                      className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 text-lg"
                      required
                    />
                    <div className="absolute right-4 top-4 text-gray-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs">💡</span>
                    </span>
                    Chọn ngày thực hiện chi phí
                  </p>
                </div>

                {/* Description Field */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-indigo-600">📋</span>
                    </span>
                    Mô tả chi tiết
                    <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
                  </label>
                  <textarea
                    value={expenseForm.mo_ta}
                    onChange={(e) => setExpenseForm({...expenseForm, mo_ta: e.target.value})}
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white resize-none text-gray-900 placeholder-gray-500 text-lg"
                    rows="4"
                    placeholder="Mô tả chi tiết về khoản chi phí này để dễ theo dõi..."
                  />
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs">💡</span>
                    </span>
                    Mô tả sẽ giúp dễ theo dõi và báo cáo chi phí
                  </p>
                </div>

                {/* Image URL Field */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs text-teal-600">🖼️</span>
                    </span>
                    Hình chứng minh
                    <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={expenseForm.hinh_chung_minh}
                      onChange={(e) => setExpenseForm({...expenseForm, hinh_chung_minh: e.target.value})}
                      className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                      placeholder="https://example.com/hinh-chung-minh.jpg"
                    />
                    <div className="absolute right-4 top-4 text-gray-400">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 flex items-center">
                    <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs">💡</span>
                    </span>
                    Đính kèm hình ảnh hóa đơn hoặc chứng từ để dễ kiểm tra
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowExpenseForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-semibold hover:shadow-md text-lg"
                >
                  <div className="flex items-center justify-center">
                    <X className="w-5 h-5 mr-2" />
                    Hủy
                  </div>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 px-6 rounded-xl hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Plus className="w-5 h-5 mr-2" />
                      {editingExpense ? 'Cập nhật chi phí' : 'Thêm chi phí'}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Không có chi phí nào trong tháng này</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại chi phí</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên chi phí</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {expense.loaichiphi?.ten_loai || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.ten_chi_phi}</div>
                          {expense.mo_ta && (
                            <div className="text-sm text-gray-500">{expense.mo_ta}</div>
                          )}
                          {expense.hinh_chung_minh && (
                            <div className="text-xs text-blue-600">
                              <a href={expense.hinh_chung_minh} target="_blank" rel="noopener noreferrer">
                                Xem chứng minh
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {(expense.so_tien || 0).toLocaleString('vi-VN')} VND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.ngay_chi_phi ? new Date(expense.ngay_chi_phi).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => editExpense(expense)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseCategoriesTab({ expenseCategories, onCategoryUpdate }) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    ten_loai: '',
    mo_ta: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `http://localhost:8001/api/v1/loaichiphi/${editingCategory.id}`
        : 'http://localhost:8001/api/v1/loaichiphi/';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ten_loai: categoryForm.ten_loai,
          mo_ta: categoryForm.mo_ta
          // Note: loai_phi field removed since database doesn't have this column
        })
      });

      if (response.ok) {
        setSuccess(true);
        setCategoryForm({ ten_loai: '', mo_ta: '' });
        setEditingCategory(null);
        onCategoryUpdate();

        // Đóng modal sau 2 giây
        setTimeout(() => {
          setShowCategoryForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Có lỗi xảy ra khi lưu loại chi phí');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Có lỗi xảy ra khi lưu loại chi phí. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa loại chi phí này?')) return;

    try {
      const response = await fetch(`http://localhost:8001/api/v1/loaichiphi/${categoryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Xóa loại chi phí thành công!');
        onCategoryUpdate();
      } else {
        alert('Có lỗi xảy ra khi xóa loại chi phí');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Có lỗi xảy ra khi xóa loại chi phí');
    }
  };

  const editCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      ten_loai: category.ten_loai,
      mo_ta: category.mo_ta || ''
    });
    setError('');
    setSuccess(false);
    setShowCategoryForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              Danh sách loại chi phí
            </h2>
            <p className="text-gray-600 mt-1">Quản lý và phân loại các khoản chi phí</p>
            <div className="flex items-center mt-2 text-sm text-green-700">
              <span className="bg-green-100 px-2 py-1 rounded-full">
                📊 {expenseCategories.length} loại chi phí
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCategoryForm(true);
              setEditingCategory(null);
              setCategoryForm({ ten_loai: '', mo_ta: '' });
              setError('');
              setSuccess(false);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm loại chi phí</span>
          </button>
        </div>
      </div>

      {/* Add Category Form - Inline */}
      {showCategoryForm && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? 'Chỉnh sửa loại chi phí' : 'Thêm loại chi phí mới'}
                </h3>
                <p className="text-green-700 mt-1">Tạo danh mục chi phí cho doanh nghiệp của bạn</p>
              </div>
            </div>
            <button
              onClick={() => setShowCategoryForm(false)}
              className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
              title="Đóng"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium">
                {editingCategory ? 'Cập nhật loại chi phí thành công!' : 'Thêm loại chi phí thành công!'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleCategorySubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Name Field */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-blue-600">🏷️</span>
                  </span>
                  Tên loại chi phí
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={categoryForm.ten_loai}
                    onChange={(e) => setCategoryForm({...categoryForm, ten_loai: e.target.value})}
                    className="w-full pl-5 pr-12 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-lg"
                    placeholder="Ví dụ: Văn phòng phẩm, Điện nước, Marketing..."
                    required
                  />
                  <div className="absolute right-4 top-4 text-gray-400">
                    <Settings className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Nhập tên loại chi phí rõ ràng và dễ hiểu
                </p>
              </div>

              {/* Description Field */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-xs text-orange-600">📝</span>
                  </span>
                  Mô tả chi tiết
                  <span className="text-gray-500 text-sm font-normal ml-2">(không bắt buộc)</span>
                </label>
                <textarea
                  value={categoryForm.mo_ta}
                  onChange={(e) => setCategoryForm({...categoryForm, mo_ta: e.target.value})}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white resize-none text-gray-900 placeholder-gray-500 text-lg"
                  rows="4"
                  placeholder="Mô tả chi tiết về loại chi phí này để nhân viên hiểu rõ hơn..."
                />
                <p className="text-sm text-gray-600 mt-2 flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs">💡</span>
                  </span>
                  Mô tả sẽ giúp nhân viên nhập liệu chính xác hơn
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCategoryForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 font-semibold hover:shadow-md text-lg"
              >
                <div className="flex items-center justify-center">
                  <X className="w-5 h-5 mr-2" />
                  Hủy
                </div>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    {editingCategory ? 'Cập nhật loại chi phí' : 'Thêm loại chi phí'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenseCategories.map(category => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-green-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-200">
                  <Settings className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg group-hover:text-green-700 transition-colors duration-200">
                    {category.ten_loai}
                  </h4>
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => editCategory(category)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {category.mo_ta && (
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-green-200">
                {category.mo_ta}
              </p>
            )}
            {!category.mo_ta && (
              <div className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-lg">
                Chưa có mô tả chi tiết
              </div>
            )}
          </div>
        ))}
      </div>

      {expenseCategories.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có loại chi phí nào</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Hãy tạo loại chi phí đầu tiên để bắt đầu quản lý chi phí hiệu quả cho doanh nghiệp của bạn
          </p>
          <button
            onClick={() => {
              setShowCategoryForm(true);
              setEditingCategory(null);
              setCategoryForm({ ten_loai: '', mo_ta: '' });
              setError('');
              setSuccess(false);
            }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Tạo loại chi phí đầu tiên</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExpensesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [expenses, setExpenses] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      if (user) {
        await loadData();
      }
    };
    getUser();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadExpenseCategories(),
        loadExpenses()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/v1/quanly_chiphi/?month=${selectedMonth}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      } else {
        console.error('Error loading expenses');
        setExpenses([]);
      }
    } catch (error) {
      console.error('Network error loading expenses:', error);
      setExpenses([]);
    }
  };

  const loadExpenseCategories = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/loaichiphi/');
      if (response.ok) {
        const data = await response.json();
        setExpenseCategories(data);
      }
    } catch (error) {
      console.error('Error loading expense categories:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'expenses' || activeTab === 'overview') {
      loadExpenses();
    }
  }, [selectedMonth, activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="text-lg text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <ExpensesLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'overview' && (
        <ExpensesOverviewTab
          expenses={expenses}
          expenseCategories={expenseCategories}
          selectedMonth={selectedMonth}
        />
      )}
      {activeTab === 'expenses' && (
        <ExpensesManagementTab
          expenses={expenses}
          expenseCategories={expenseCategories}
          selectedMonth={selectedMonth}
          onExpenseUpdate={loadExpenses}
        />
      )}
      {activeTab === 'categories' && (
        <ExpenseCategoriesTab
          expenseCategories={expenseCategories}
          onCategoryUpdate={loadExpenseCategories}
        />
      )}
    </ExpensesLayout>
  );
}
